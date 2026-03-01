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

## 常用入口 🗄️ 可归档（与 TOOLS.md 重复）

- NAS：`https://ug.link/geekmai`
- GitHub 私有备份：`git@github.com:GeekMai90/clawd-private.git`

---

## 2026-03-01 每周蒸馏（近 7 天）

1. **Cron 投递必须用 chatId，不能用用户名**
   过去一周再次出现 Telegram 目标写成用户名导致发送失败（如 `麦先生` / `geekmai`）的问题，已统一修正为 `5233110346`。这条规则已经从“经验”升级为“强约束”，后续所有 cron/消息技能默认显式写 chatId，避免静默漏提醒。

2. **记忆系统分层已完成重构并进入稳定维护期**
   已完成 `core + user-prefs + agent-notes + MEMORY索引 + 日志归档` 的分层体系，MEMORY.md 只保留索引和高优先规则。维护节奏固定为「每日 01:00 轻蒸馏 + 每周日 22:00 全量蒸馏 + 每日 03:00 备份」，属于当前长期架构基线。

3. **Notion 选题技能字段以“可用最小集”为准**
   `notion-topic` 实测中删除了“简介”字段后才稳定写入，说明数据库 schema 漂移会直接导致技能失败。后续 Notion 类技能应优先按当前数据库真实字段写入，避免依赖可选字段。

4. **Docker 相关任务在本机需考虑 sudo/镜像网络现实约束**
   macOS 上即使用户无登录密码，终端安装 Docker Desktop 仍可能触发 sudo 交互限制；这类安装需优先给图形化安装路径。国内网络场景下 Docker Hub 拉取常失败，需预置 registry mirrors 再继续容器部署。

5. **公网访问链路已验证可用，KKClaw 属于附加层而非核心层**
   `claw.geekmai.cc` → Cloudflare Tunnel → OpenClaw Gateway 的主链路已打通，远程访问能力可作为稳定能力沉淀。KKClaw 本周验证结果是“可连但价值有限”，定位为可选玩具层，不影响主系统决策。

6. **23:50 每日笔记整理 cron 已替代 22:00 日记提醒 cron**
   旧的“22:00 提醒写日记”已删除，改为睡前静默执行的每日笔记整理流程，并附带自动记账检测。若当天没有 `memory/YYYY-MM-DD.md`，`daily_micro_distill` 需静默退出（graceful guard），避免无效报错噪音。
