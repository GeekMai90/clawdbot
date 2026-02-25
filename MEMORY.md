# 长期记忆索引（MEMORY Index）

> 参考 OpenViking 文件系统范式，记忆已分区存储：
> - **用户偏好** → `memory/user-prefs.md`（麦先生的风格、习惯、偏好）
> - **Agent 经验** → `memory/agent-notes.md`（技能踩坑、工具配置、架构决策）
> - **行为规则** → `memory/core.md`（每次必读，L0 层）
> - **原始日志** → `memory/YYYY-MM-DD.md`（近 30 天）+ `memory/_archive/`（归档）

---

## ⭐ 置顶核心（compaction 保护区）

> 即使上下文被压缩，这几条必须保留：

1. **回复风格**：偶尔亲昵，甜轻克制，不露骨不越界
2. **联网抓取**：用 `curl + Jina Reader`，绝不用 `web_fetch`
3. **Cron 配置**：`--wake now` + `cron.enabled: true`，缺一不可
4. **复杂开发**：召唤 Codex CLI 执行，我负责指挥拆解
5. **数据存储**：结构化大数据 → JSON；流水账/个人记录 → Obsidian Markdown
6. **Cron 目标**：`--to 5233110346`（chatId），不用用户名

---

## 📂 记忆分区索引

| 分区 | 文件 | 内容 |
|------|------|------|
| L0 行为规则 | `memory/core.md` | 每次必读的关键规则 |
| 用户偏好 | `memory/user-prefs.md` | 回复风格、开发偏好、PT 偏好等 |
| Agent 经验 | `memory/agent-notes.md` | 技能踩坑、Cron 配置、工具经验 |
| 日志（近期） | `memory/YYYY-MM-DD.md` | 原始会话日志 |
| 日志（归档） | `memory/_archive/` | 30 天前日志 |

---

## 🔄 记忆维护机制

- **每日 01:00**：轻量蒸馏——扫当天日志，提取 1-3 条追加到对应分区
- **每周日 22:00**：全量蒸馏——回顾 7 天日志 + MEMORY.md 整理 + 旧日志归档
- **每天 03:00**：自动备份到 GitHub 私有仓库（`clawd-private`）

---

## 常用入口

- NAS：`https://ug.link/geekmai`
- GitHub 私有备份：`git@github.com:GeekMai90/clawd-private.git`
