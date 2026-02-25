# Agent 经验笔记（Agent Notes）

> 技能配置、工具踩坑、架构决策。对应 OpenViking 的 `agent/memories/`
> 由每日蒸馏 cron 自动更新。

---

## 联网抓取

> web_fetch 被沙盒拦截时的替代方案

`web_fetch` 因 IP 检查被拦，**一律用 curl + Jina Reader**：
```bash
curl -s --max-time 30 -H "User-Agent: Mozilla/5.0" "https://r.jina.ai/https://目标URL"
```
降级：复杂网站（微信/Cloudflare）→ url-reader 技能（Playwright 兜底）

---

## Cron 配置三要素

> 踩了 3 天坑的核心教训，缺一不可

1. `cron.enabled: true`（配置文件必须明确开启）
2. `--wake now`（不用 next-heartbeat）
3. 用 CLI 创建，不用 API

```bash
openclaw cron add --name "job" --cron "0 7 * * *" --tz "Asia/Shanghai" \
  --session isolated --message "任务" --announce --channel telegram \
  --to 5233110346 --wake now
```
验证：`openclaw cron list` 中 `nextRunAtMs` 不为 null。

---

## Cron 消息目标

> --to 参数必须用 chatId 数字，不能用用户名

麦先生的 Telegram chatId：**`5233110346`**
错误写法：`--to geekmai` 或 `--to 麦先生`（会报 Unknown target 错误）

---

## 数据存储设计原则

> 技能数据用 JSON 还是 Markdown 的判断标准

- **结构化大数据 / 需要程序查询** → JSON（如豆瓣 TOP250 数据）
- **流水账 / 个人记录 / 人需要阅读** → Markdown in Obsidian（如记账、日记）

---

## 记忆系统架构

> 当前三层结构（2026-02-25 优化，参考 OpenViking L0/L1/L2）

```
L0 HOT  memory/core.md          关键行为规则，每次必读（< 2KB）
L1 WARM MEMORY.md（索引）        指向 user-prefs.md / agent-notes.md
        memory/user-prefs.md    用户偏好分区
        memory/agent-notes.md   本文件，Agent 经验
L2 COLD memory/YYYY-MM-DD.md    原始日志（近 30 天）
        memory/_archive/        30 天前归档
```
- 每日 01:00 轻量蒸馏（当天日志 → 分区文件）
- 每周日 22:00 全量蒸馏 + 归档

---

## 定时提醒体系

> cron 只管时间，skill 负责内容；只发最终消息，不展示中间过程

| 任务 | 时间 | 技能 |
|------|------|------|
| 天气提醒 | 每天 07:00 | weather-morning |
| 午餐提醒 | 每天 10:25 | lunch-reminder |
| 日记提醒 | 每天 22:00 | diary-reminder |
| 记账月报 | 月1日 09:00 | bookkeeping-monthly-report |
| 记忆备份 | 每天 03:00 | memory-backup |
| 轻量蒸馏 | 每天 01:00 | daily_micro_distill（静默，无消息）|
| 全量蒸馏 | 每周日 22:00 | weekly_memory_distill |
| 系统体检 | 每周六 10:00 | weekly_system_healthcheck（发 Telegram 报告）|

---

## 记忆备份

> GitHub 私有仓库备份

- 私有仓库：`git@github.com:GeekMai90/clawd-private.git`（remote: `private`）
- 手动：`bash skills/memory-backup/backup.sh`
- ⚠️ 教训：只能推私有仓库，绝不推公开仓库（曾误推，已撤回）

---

## url-reader 技能

> 网页内容抓取三层降级策略

Firecrawl（首选）→ Jina Reader（备选）→ Playwright（兜底）
- 微信公众号：直接跳到 Playwright
- Jina 踩坑：用简短 UA；用 Session 对象控制 headers（不能用 requests.get 直接调用）
- Obsidian 保存路径：`GeekMaiOB/00-收集区/网络收藏/{日期}_{标题}/`

---

## qmd 语义搜索

> OpenClaw 内置记忆检索后端

- 优先用 `memory_search`（内置），找不到再手动用 qmd CLI
- 每 30 分钟自动更新索引
- 覆盖所有 `memory/*.md` + `skills/*/SKILL.md` + 文档

---

## 技能踩坑记录

> 各技能的关键配置提醒

**鼠须管（Rime/Squirrel）**
- 标点覆盖：值用字符串或列表，不用 `{commit: ...}`
- `~/Library/Rime` 可能是 iCloud symlink，照常处理

**落格输入法码表**
- 格式：UTF-16LE + BOM，**CRLF 换行**（写成 LF 会导入报错）
- 字段：`词条\t编码\t权重`（权重默认 0）
- Mac 本地：`/Users/geekmai/Documents/落格输入法/小麦音形 1.2.txt`

**obsidian-diary**
- 触发：消息第一行以「日记」开头，第二行起是正文
- 存储：`GeekMaiOB/30-运行记录/私人日记/YYYY-MM.md`，末尾追加

**notion-topic**
- 触发：「选题 xxx」；已删「简介」字段，勿再使用

**bookmark-organizer**
- 书签格式：DataView 内联字段（name:: / alias:: / url:: / tags:: / saved::）
- 每周日 10:00 自动运行（job: `ed5e96cb-0619-4775-bdfe-3dbe5322ba7a`）

---

## 复杂项目开发流程

> Speckit / SDD 规范

constitution → spec → plan → tasks → implement
执行器：Codex CLI（coding-agent + PTY 后台），严格按 tasks.md 操作并回写

---

## OpenClaw 教程写作

> openclaw-tutorial-writer 技能要点

- 强制脱敏：API Key / token / chatId / 绝对路径一律用占位符
- 保存到：`GeekMaiOB/07-工具/OpenClaw教程/`
