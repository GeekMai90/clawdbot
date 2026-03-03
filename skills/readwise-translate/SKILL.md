---
name: readwise-translate
description: 抓取英文网页文章，翻译成自然流畅的简体中文，保存到 Readwise Reader 收件箱。触发方式：用户发送 URL + "保存"（或"帮我保存"/"翻译保存"）。自动完成：抓取→翻译→保存→回复确认。
---

# Readwise 翻译保存技能

## 触发条件

用户发送一个 URL，并附带"保存"、"帮我保存"、"翻译保存"等关键词时触发。

## 执行步骤

### 第一步：抓取原文

```bash
curl -s --max-time 30 -H "User-Agent: Mozilla/5.0" "https://r.jina.ai/<URL>"
```

若抓取失败或内容为空，告知用户并停止。

### 第二步：翻译

将抓取到的正文翻译成简体中文，遵守以下规则：
- **符合中文语言习惯**：不生硬，不逐字对译，读起来像中文写的
- **忠实原意**：不过度意译，不改变原作者立场和结论
- **保留结构**：段落、标题、列表、代码块结构不变
- **文章末尾**：追加一行 `原文链接：<原始URL>`

翻译结果组织为完整 HTML：
```html
<h1>（中文标题）</h1>
<p>（译文正文...）</p>
<hr>
<p>原文链接：<a href="<URL>"><URL></a></p>
```

将 HTML 写入临时文件：
```bash
TMP=$(mktemp /tmp/rw_XXXX.html)
cat > "$TMP" << 'EOF'
（译文 HTML）
EOF
```

### 第三步：保存到 Readwise

```bash
bash /Users/geekmai/clawd/skills/readwise-translate/scripts/save_to_readwise.sh "<URL>" "<中文标题>" "$TMP"
rm -f "$TMP"
```

脚本返回 `OK:<readwise_url>` 表示成功；`ERROR:...` 表示失败。

### 第四步：回复确认

成功时回复（简洁）：
> 已保存到 Readwise Reader ✅
> 《（中文标题）》
> 🔗 <readwise_url>

失败时说明原因并询问是否重试。

## 注意事项

- API Token 存储在 Keychain（`readwise_token`），脚本自动读取
- 保存时自动打标签：`译文`、`灵瑶翻译`，位置：`new`（收件箱）
- 依赖：`curl`、`jq`（已预装）
