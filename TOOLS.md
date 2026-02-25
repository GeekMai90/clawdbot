# TOOLS.md - 通用工具快查

> 只放「每次都可能用到」的通用工具和路径。
> 技能专属的详细操作手册 → 看各自 `skills/*/SKILL.md`。
> 备份原版：`memory/tools-full-backup-20260225.md`

---

## 联网抓取（web_fetch 替代）

`web_fetch` 在沙盒里会被拦，**一律改用 curl + Jina Reader**：

```bash
curl -s --max-time 30 -H "User-Agent: Mozilla/5.0" "https://r.jina.ai/https://目标URL"
```

- 复杂网站（Cloudflare/微信）→ url-reader 技能（Playwright 兜底）
- 需要交互的页面 → browser 工具（需挂载 Chrome Tab）

---

## Obsidian（GeekMaiOB）

**Vault 路径**：`/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB`

```bash
VAULT="/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"
```

**常用文件夹（2026-02-25 更新后结构）**：
- `00-收集区/` — 收件箱（新笔记、待整理内容落这里）
- `00-收集区/网络收藏/` — url-reader 抓取的网页（按日期_标题子文件夹）
- `00-收集区/闪念笔记/` — 闪念
- `00-收集区/Readwise/` — Readwise 同步划线
- `10-系统管理/EPOS个人操作系统/` — EPOS 系统
- `20-认知结构/` — 原则/变量/机制/框架
- `30-运行记录/私人日记/` — 月度日记（YYYY-MM.md）
- `30-运行记录/财务记录/` — 记账（YYYY-MM.md）
- `30-运行记录/观影记录/` — 豆瓣观影
- `40-项目创作/` — 文章写作、中医养生、英语学习等
- `50-资源资料/书签/` — 书签
- `50-资源资料/工具说明/` — 工具文档
- `60-归档/` — 归档内容

**默认写入规则**：往 Obsidian 写笔记时，如果没有指定文件夹，默认写到 `00-收集区/` 下。

**obsidian-cli**：
```bash
obsidian-cli search "关键词"          # 搜索笔记名
obsidian-cli search-content "关键词"  # 搜索内容
obsidian-cli create "路径/笔记名" --content "内容"
obsidian-cli move "旧路径" "新路径"    # 自动更新所有链接
```

---

## Apple Reminders（remindctl）

```bash
remindctl all / today / overdue / list
remindctl add --title "标题" --list "工作" --due "2026-01-30 09:00" --notes "备注"
remindctl complete [id]
```

---

## Apple Calendar（osascript）

```bash
osascript <<'APPLESCRIPT'
tell application "Calendar"
    tell calendar "日历"
        set s to current date
        -- 设置 year/month/day/time of s
        set e to current date
        -- 设置 year/month/day/time of e
        make new event with properties {summary:"标题", start date:s, end date:e, description:"描述"}
    end tell
end tell
APPLESCRIPT
```

时区：Asia/Shanghai（东八区），创建时按本地时间即可。

---

## Apple Notes（osascript）

```bash
osascript -e 'tell application "Notes"
    tell account "iCloud"
        tell folder "Notes"
            make new note with properties {name:"标题", body:"内容"}
        end tell
    end tell
end tell'
```

---

## Notion

**API Key**：`~/.config/notion/api_key`（以 `ntn_` 开头）

```bash
NOTION_KEY=$(cat ~/.config/notion/api_key)

# 搜索页面
curl -sX POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" -H "Notion-Version: 2025-09-03" \
  -d '{"query":"关键词"}'

# 追加块
curl -sX PATCH "https://api.notion.com/v1/blocks/{id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"children":[{"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":"内容"}}]}}]}'
```

常用属性格式：
- 标题：`{"title":[{"text":{"content":"..."}}]}`
- 选择：`{"select":{"name":"选项"}}`
- 日期：`{"date":{"start":"2024-01-15"}}`

---

## Rime / 鼠须管

**配置路径（iCloud 同步）**：
`/Users/geekmai/Library/Mobile Documents/iCloud~com~ihsiao~apps~Hamster3/Documents/RimeUserData/RimeMac`

---

## 落格输入法码表

- Mac 本地：`/Users/geekmai/Documents/落格输入法/小麦音形 1.2.txt`
- iCloud 同步：`/Users/geekmai/Library/Mobile Documents/com~apple~CloudDocs/Documents/落格输入法/小麦音形 1.2.txt`
- 格式：UTF-16LE + BOM，CRLF 换行，`词条\t编码\t权重`

---

## 技能快查索引

| 技能 | 触发场景 | SKILL.md |
|------|---------|----------|
| airbrush | 生成图片 | `skills/airbrush/SKILL.md` |
| douban-movie | 推荐/记录电影 | `skills/douban-movie/SKILL.md` |
| bookkeeping | 记账/报销/订阅 | `skills/bookkeeping/SKILL.md` |
| bookmark-organizer | 整理书签 | `skills/bookmark-organizer/SKILL.md` |
| url-reader | 抓取网页存 Obsidian | `skills/url-reader/SKILL.md` |
| obsidian-diary | 写日记 | `skills/obsidian-diary/SKILL.md` |
| notion-topic | 添加选题 | `skills/notion-topic/SKILL.md` |
| memory-backup | 备份记忆到 GitHub | `skills/memory-backup/SKILL.md` |
| weekly-system-healthcheck | 每周系统体检（周六 10:00） | `skills/weekly-system-healthcheck/SKILL.md` |

---

## 常用路径 / 入口

- NAS：`https://ug.link/geekmai`
- GitHub 私有备份仓库：`git@github.com:GeekMai90/clawd-private.git`
- Telegram chatId（麦先生）：`5233110346`
