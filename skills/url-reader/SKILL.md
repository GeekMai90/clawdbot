---
name: url-reader
description: "网页内容抓取技能。用户发送URL，自动抓取内容转换为Markdown，下载图片，保存到Obsidian网络收藏文件夹。两层降级策略：Jina Reader（免费）→ Playwright（兜底）。"
---

# URL Reader - 网页内容抓取

## 触发
用户发送一个 URL（以 http/https 开头），说"帮我收藏这篇文章"或直接粘贴链接。

## 支持平台
| 平台 | 识别域名 | 备注 |
|------|----------|------|
| 微信公众号 | mp.weixin.qq.com | 建议用短链接 /s/xxxxx |
| 小红书 | xiaohongshu.com, xhslink.com | 图片需要 Referer |
| 知乎 | zhihu.com | |
| 抖音 | douyin.com | 可能需要登录态 |
| 淘宝 | taobao.com | |
| 京东 | jd.com | |
| B站 | bilibili.com | |
| 其他 | - | 通用抓取 |

## 用法
```bash
cd /Users/geekmai/clawd/skills/url-reader
python scripts/url_reader.py <URL>
```

## 示例
```bash
python scripts/url_reader.py https://mp.weixin.qq.com/s/xxxxx
python scripts/url_reader.py https://www.zhihu.com/question/xxxxx
python scripts/url_reader.py https://www.xiaohongshu.com/explore/xxxxx
```

## 输出结构
保存到 Obsidian `网络收藏/` 文件夹：
```
网络收藏/
└── 2026-02-05_文章标题/
    ├── content.md      # 正文（含 frontmatter 元数据）
    └── images/         # 下载的图片
        ├── img_01.jpg
        └── img_02.jpg
```

## 技术方案：两层降级

### 第一层：Jina Reader（首选）
- 免费、快速、能搞定大部分网站
- URL: `https://r.jina.ai/{原始URL}`
- 验证：内容 > 100 字符 + 无验证页特征

### 第二层：Playwright（兜底）
- 真实浏览器访问，什么都能搞
- 需要预先安装：`pip install playwright && playwright install chromium`
- 自动选择最佳内容区域

## 后续扩展方向
- [ ] 添加 Firecrawl 作为第一层（有 API Key 时启用）
- [ ] 批量抓取（一次传多个 URL）
- [ ] 自动去重（检测已收藏的 URL）

## 依赖
- Python 3.10+
- requests
- playwright（可选，兜底用）

## 安装
```bash
pip install requests
# Playwright（可选，Jina 失败时才用）
pip install playwright && playwright install chromium
```
