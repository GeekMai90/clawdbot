#!/usr/bin/env python3
"""
URL Reader - 网页内容抓取工具
两层降级策略：Jina Reader（首选） → Playwright（兜底）
自动保存到 Obsidian 网络收藏文件夹
"""

import sys
import os
import re
import json
import time
import requests
from urllib.parse import urlparse, urljoin
from datetime import datetime
from pathlib import Path

# ─── 配置 ───────────────────────────────────────────────────
OBSIDIAN_SAVE_DIR = Path(
    os.path.expanduser(
        "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB/00-收集区/网络收藏"
    )
)

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
WECHAT_UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 FBAN/FBAV/380.0.0.0.0;FBDV/Google Pixel 7;FBMD/Pixel;FBSN/Android;FBSV/13;"

# 平台对应的 Referer
PLATFORM_REFERERS = {
    "xiaohongshu": "https://www.xiaohongshu.com/",
    "wechat":      "https://mp.weixin.qq.com/",
    "zhihu":       "https://www.zhihu.com/",
    "bilibili":    "https://www.bilibili.com/",
}

# 黑名单词汇（验证页面特征）
BLACKLIST = ["验证码", "captcha", "verify", "人验证", "滑动验证", "请完成验证"]


# ─── 1. 平台识别 ────────────────────────────────────────────
def identify_platform(url: str) -> dict:
    """识别 URL 所属平台"""
    parsed = urlparse(url)
    netloc = parsed.netloc.lower()

    platforms = {
        "wechat":      ["mp.weixin.qq.com"],
        "xiaohongshu": ["xiaohongshu.com", "xhslink.com"],
        "zhihu":       ["zhihu.com"],
        "douyin":      ["douyin.com"],
        "taobao":      ["taobao.com"],
        "jd":          ["jd.com"],
        "bilibili":    ["bilibili.com"],
    }

    for name, domains in platforms.items():
        if any(d in netloc for d in domains):
            needs_login = name in ("xiaohongshu", "douyin")
            return {"platform": name, "needs_login": needs_login}

    return {"platform": "unknown", "needs_login": False}


# ─── 2. Firecrawl（首选，AI驱动） ──────────────────────────
def load_firecrawl_key() -> str | None:
    """从配置文件读取 Firecrawl API Key"""
    key_path = Path(os.path.expanduser("~/.config/firecrawl/api_key"))
    if key_path.exists():
        return key_path.read_text().strip()
    return os.environ.get("FIRECRAWL_API_KEY")


def fetch_firecrawl(url: str) -> str | None:
    """通过 Firecrawl API 获取 Markdown 内容"""
    api_key = load_firecrawl_key()
    if not api_key:
        print("  ⚠ Firecrawl API Key 未配置，跳过")
        return None

    try:
        from firecrawl import FirecrawlApp
    except ImportError:
        print("  ⚠ firecrawl-py 未安装，跳过")
        return None

    try:
        print("  → 调用 Firecrawl…")
        app = FirecrawlApp(api_key=api_key)
        result = app.scrape(url)

        # v2 返回 Document 对象，用 getattr（踩坑：不能用 .get()）
        markdown = getattr(result, "markdown", None) or (result.get("markdown") if isinstance(result, dict) else None)

        if not markdown or len(markdown) < 100:
            print("  ⚠ Firecrawl 返回内容过短，降级…")
            return None
        if any(kw in markdown for kw in BLACKLIST):
            print("  ⚠ Firecrawl 返回验证页面，降级…")
            return None

        # 从 metadata 提取 title，注入到开头（统一格式，方便 extract_title 解析）
        metadata = getattr(result, "metadata", None)
        if metadata:
            title = getattr(metadata, "title", None) or getattr(metadata, "og_title", None)
            if title:
                markdown = f"Title: {title}\n\n{markdown}"

        print(f"  ✓ Firecrawl 获取成功（{len(markdown)} 字符）")
        return markdown

    except Exception as e:
        print(f"  ⚠ Firecrawl 失败：{e}，降级…")
        return None


# ─── 3. Jina Reader（备选，免费） ───────────────────────────
def fetch_jina(url: str) -> str | None:
    """通过 Jina Reader 获取 Markdown 内容"""
    jina_url = f"https://r.jina.ai/{url}"
    # 注意：Jina 对完整的 Chrome UA 会返回 403，用简短 UA
    headers = {
        "Accept":          "text/markdown",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    }
    try:
        print("  → 调用 Jina Reader…")
        session = requests.Session()
        session.headers = headers
        resp = session.get(jina_url, timeout=30)
        resp.raise_for_status()
        content = resp.text

        # 验证内容有效性
        if len(content) < 100:
            print("  ⚠ Jina 返回内容过短，降级…")
            return None
        if any(kw in content for kw in BLACKLIST):
            print("  ⚠ Jina 返回验证页面，降级…")
            return None

        print(f"  ✓ Jina 获取成功（{len(content)} 字符）")
        return content

    except Exception as e:
        print(f"  ⚠ Jina 失败：{e}，降级…")
        return None


# ─── 3. Playwright（兜底） ──────────────────────────────────
async def fetch_playwright(url: str, platform: str) -> str | None:
    """通过 Playwright 浏览器自动化获取内容"""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("  ⚠ Playwright 未安装，跳过")
        print("    安装方法：pip install playwright && playwright install chromium")
        return None

    ua = WECHAT_UA if platform == "wechat" else USER_AGENT

    try:
        print("  → 启动 Playwright 浏览器…")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=ua)
            page = await context.new_page()

            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)  # 等待动态内容加载

            # 提取标题和正文
            content = await page.evaluate("""() => {
                const title = document.title || '';

                // 尝试常见的主内容选择器
                const selectors = [
                    '.article-content', '.post-content', '.entry-content',
                    '.rich_text', '.content', 'article', 'main',
                    '#mp-editor', '.pay-unlock-bg',  // 公众号
                    '.note-content',                  // 小红书
                    '.post-text',                     // 知乎
                ];

                let bestEl = null;
                let bestLen = 0;
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText.length > bestLen) {
                        bestEl = el;
                        bestLen = el.innerText.length;
                    }
                }

                // 都没找到就用 body
                const mainEl = bestEl || document.body;

                // 提取图片
                const imgs = Array.from(mainEl.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src && src.startsWith('http'));

                return {
                    title: title,
                    text: mainEl.innerText,
                    images: [...new Set(imgs)]
                };
            }""")

            await browser.close()

            if not content["text"] or len(content["text"]) < 50:
                print("  ⚠ Playwright 获取内容过短")
                return None

            # 拼接成简单 Markdown
            md = f"# {content['title']}\n\n{content['text']}\n"
            # 把图片加回来
            for img_url in content.get("images", []):
                md += f"\n![image]({img_url})"

            print(f"  ✓ Playwright 获取成功（{len(md)} 字符）")
            return md

    except Exception as e:
        print(f"  ⚠ Playwright 失败：{e}")
        return None


# ─── 4. 提取标题 ────────────────────────────────────────────
def extract_title(markdown: str, url: str) -> str:
    """从 Markdown 中提取标题"""
    skip_keywords = ["来源", "source", "url", "http"]

    for line in markdown.split("\n"):
        line = line.strip()
        if not line:
            continue

        # Jina 格式：Title: xxx
        if line.lower().startswith("title:"):
            title = line.split(":", 1)[1].strip()
            if title and len(title) > 2:
                return title[:80]

        # Markdown 标题：# xxx
        if line.startswith("#"):
            title = re.sub(r"^#+\s*", "", line).strip()
            if title and len(title) > 2:
                if any(kw in title.lower() for kw in skip_keywords):
                    continue
                return title[:80]

    # 没找到标题就用 hostname
    return urlparse(url).netloc


# ─── 5. 图片下载 ────────────────────────────────────────────
def download_images(markdown: str, images_dir: Path, platform: str) -> tuple[str, int]:
    """下载 Markdown 中的图片，返回替换后的 Markdown 和下载数量"""
    # 提取所有图片 URL
    # 匹配 Markdown 图片格式 ![...](url) 和直接 URL
    img_pattern = re.compile(
        r'!\[([^\]]*)\]\((https?://[^\)]+)\)'
    )
    matches = img_pattern.findall(markdown)

    if not matches:
        # 尝试匹配直接 URL（以常见图片后缀结尾）
        url_pattern = re.compile(
            r'(https?://[^\s\)]+\.(?:jpg|jpeg|png|gif|webp|bmp)(?:\?[^\s\)]*)?)',
            re.IGNORECASE
        )
        direct_urls = url_pattern.findall(markdown)
        matches = [("image", url) for url in direct_urls]

    if not matches:
        return markdown, 0

    # 设置 Referer
    headers = {"User-Agent": USER_AGENT}
    if platform in PLATFORM_REFERERS:
        headers["Referer"] = PLATFORM_REFERERS[platform]

    images_dir.mkdir(parents=True, exist_ok=True)
    downloaded = 0

    # 去重
    seen_urls = {}
    for alt, img_url in matches:
        if img_url in seen_urls:
            continue

        try:
            print(f"  → 下载图片 {downloaded + 1}…")
            resp = requests.get(img_url, headers=headers, timeout=15, stream=True)
            resp.raise_for_status()

            # 确定后缀
            content_type = resp.headers.get("Content-Type", "image/jpeg")
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp",
            }
            ext = ext_map.get(content_type.split(";")[0].strip(), ".jpg")

            local_name = f"img_{downloaded + 1:02d}{ext}"
            local_path = images_dir / local_name

            with open(local_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)

            seen_urls[img_url] = f"images/{local_name}"
            downloaded += 1
            print(f"    ✓ 保存为 {local_name}")

        except Exception as e:
            print(f"    ⚠ 图片下载失败：{e}")
            seen_urls[img_url] = img_url  # 保留原 URL

    # 替换 Markdown 中的图片 URL
    for orig_url, local_path in seen_urls.items():
        markdown = markdown.replace(orig_url, local_path)

    return markdown, downloaded


# ─── 6. 清理目录名 ──────────────────────────────────────────
def sanitize_dirname(name: str) -> str:
    """清理标题用于目录名"""
    # 替换特殊字符
    for ch in '/\\:*?"<>|':
        name = name.replace(ch, "_")
    # 截断长度
    return name[:60].strip()


# ─── 7. 保存内容 ────────────────────────────────────────────
def save_content(markdown: str, title: str, url: str, platform: str):
    """保存内容到 Obsidian"""
    date_str = datetime.now().strftime("%Y-%m-%d")
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    dir_name = f"{date_str}_{sanitize_dirname(title)}"
    save_dir = OBSIDIAN_SAVE_DIR / dir_name

    save_dir.mkdir(parents=True, exist_ok=True)
    images_dir = save_dir / "images"

    # 下载图片并替换路径
    print("\n📸 下载图片…")
    markdown, img_count = download_images(markdown, images_dir, platform)

    # 写入 content.md（带 frontmatter）
    frontmatter = f"""---
title: {title}
source: {url}
platform: {platform}
saved_at: {time_str}
---

"""
    content_path = save_dir / "content.md"
    with open(content_path, "w", encoding="utf-8") as f:
        f.write(frontmatter + markdown)

    return save_dir, content_path, img_count


# ─── 8. 主入口 ──────────────────────────────────────────────
async def main():
    if len(sys.argv) < 2:
        print("用法：python url_reader.py <URL>")
        print("示例：python url_reader.py https://mp.weixin.qq.com/s/xxxxx")
        sys.exit(1)

    url = sys.argv[1].strip()

    print(f"\n🌐 URL Reader")
    print(f"   目标：{url}\n")

    # 1. 平台识别
    print("🔍 识别平台…")
    platform_info = identify_platform(url)
    platform = platform_info["platform"]
    print(f"   平台：{platform}")
    if platform_info["needs_login"]:
        print("   ⚠ 此平台可能需要登录态，如果 Jina 失败会用 Playwright 尝试")

    # 2. 抓取内容（三层降级：Firecrawl → Jina → Playwright）
    # 微信公众号直接用 Playwright，Firecrawl/Jina 均无法处理
    DIRECT_PLAYWRIGHT_PLATFORMS = {"wechat"}

    if platform in DIRECT_PLAYWRIGHT_PLATFORMS:
        print(f"\n📥 {platform} 平台直接使用 Playwright…")
        content = await fetch_playwright(url, platform)
    else:
        # 第一层：Firecrawl
        print("\n📥 抓取内容…")
        content = fetch_firecrawl(url)

        # 第二层：Jina
        if content is None:
            print("\n📥 降级到 Jina…")
            content = fetch_jina(url)

        # 第三层：Playwright
        if content is None:
            print("\n📥 降级到 Playwright…")
            content = await fetch_playwright(url, platform)

    if content is None:
        print("\n❌ 所有策略均失败，无法获取内容")
        sys.exit(1)

    # 3. 提取标题
    title = extract_title(content, url)
    print(f"\n📄 标题：{title}")

    # 4. 保存到 Obsidian
    print("\n💾 保存到 Obsidian…")
    save_dir, content_path, img_count = save_content(content, title, url, platform)

    print(f"\n✅ 完成！")
    print(f"   📂 目录：{save_dir}")
    print(f"   📝 文稿：{content_path}")
    print(f"   🖼  图片：{img_count} 张")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
