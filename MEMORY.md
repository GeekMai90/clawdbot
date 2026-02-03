# 长期记忆（MEMORY）

## 技能数据存储设计理念

### 混合存储方案（JSON + Markdown）

**设计原则：**
- **参考库/静态数据** → JSON（数据量大，需要程序化查询）
- **用户数据/个人记录** → Markdown in Obsidian（适合人类阅读编辑，省 token）

**成功案例：**

1. **豆瓣电影技能**（2026-01-30 改造）
   - 参考库（JSON）：TOP250 / 热门最新数据（136KB，需要筛选查询）
   - 用户数据（Markdown）：观影记录 / 想看清单 / 可重看清单
   - 收益：Obsidian 中可直接查看编辑，可写观后感，省 token

2. **记账技能**（bookkeeping）
   - 全部用 Markdown：月度账单 / 待报销 / 订阅管理
   - 存储位置：`GeekMaiOB/记账/`
   - 流水账形式，按时间追加，非常适合 Markdown

**何时用 JSON？**
- 数据结构复杂（多层嵌套、多字段）
- 需要频繁查询筛选（如按类型、评分、导演查询）
- 数据量大（几十 KB 以上）
- 静态只读，人类不需要编辑

**何时用 Markdown？**
- 类似日记/流水账
- 数据结构简单（时间 | 标题 | 备注）
- 人类可能想直接查看/编辑
- 数据量小（几 KB）
- 需要写详细内容（如观后感、备注）

---

## 鼠须管（Rime/Squirrel）小鹤音形维护
- 与落格输入法无关：Rime/鼠须管的小鹤音形词库/配置格式不同，不能混用 LogOS 的码表规则。
- 已新增技能：`skills/rime-squirrel/`
  - 用途：维护 macOS 鼠须管 + 小鹤音形（flypy）的标点与自定义词。
  - 自定义编码：默认写入 `flypy_user.txt`（UTF-8 + TAB 分隔）。
  - 标点覆盖：写入 `flypy.custom.yaml` 的 `patch: punctuator/half_shape` 与 `punctuator/full_shape`。
    - **注意**：punctuator 映射值应为 **字符串或列表**，不要用 `{commit: ...}`，否则可能出现 merge 报错（incompatible node type: commit）。
- 环境细节：`~/Library/Rime` 可能是 iCloud 同步的 symlink（照常当用户目录处理）。

## Telegram 语音回复（本地 TTS）
- 已安装技能：`skills/telegram-offline-voice/`（clawdhub: telegram-offline-voice）
- 依赖：`ffmpeg` + `edge-tts`
  - macOS 上用 `pipx install edge-tts`（避免 PEP 668 限制）
- Telegram 私聊 chatId：`5233110346`
- 默认女声：`zh-CN-XiaoyiNeural`（晓依）
- 工作流：文本 → edge-tts 生成 mp3 → ffmpeg 转 OGG Opus → Telegram 以 voice 发送

## qmd 本地语义搜索（省 Token 神器）
- 已安装技能：`skills/qmd-retrieval/`
- **作用**：本地混合搜索（BM25 + 向量 + 重排序），零成本精准回忆，节省 10 倍 token
- **当前状态**：
  - 集合：`openclaw-workspace`（76 个 md 文件，354 个向量 chunks）
  - 索引范围：MEMORY.md、memory/*.md、skills/*/SKILL.md、docs/tutorials
  - 自动维护：每天凌晨 3 点 cron 更新索引（`qmd_index_maint_daily`）
- **使用方法**（MCP 集成）：
  - 混合搜索（最精准 93%）：`mcporter call qmd.query --args '{"query":"问题","limit":10,"collection":"openclaw-workspace"}'`
  - 语义搜索：`mcporter call qmd.vsearch`
  - 关键词搜索：`mcporter call qmd.search`
  - 提取文档：`mcporter call qmd.get`
- **使用场景**：
  - 用户问"之前讨论过什么？"
  - 需要跨文件知识检索
  - 回忆用户偏好、决策、历史上下文
  - 省 token：只检索相关段落，不塞整个 MEMORY.md
- **注意事项**：
  - 优先使用 `memory_search`（OpenClaw 内置），如果找不到再用 qmd
  - 只返回相关段落，不要粘贴整个文件
  - 小心 reranker 上下文溢出，保持 limit ≤ 10
- **教程位置**：`GeekMaiOB/OpenClaw教程/qmd 本地语义搜索 - 节省10倍Token.md`

## Apple Mail 搜索（SQLite）
- 已安装技能：`skills/apple-mail-search/`（以及 `skills/apple-mail-search-safe/`）
- 用途：通过查询 Apple Mail 的 `Envelope Index` SQLite 数据库，快速按主题/发件人/时间/附件等检索邮件（比 AppleScript 快很多）。
- 实操策略（按麦先生偏好）：不强依赖 `mail-search` 可执行脚本；需要时直接用 `sqlite3` 进行查询并由我整理结果。

## 常用链接/入口
- NAS 访问地址：<https://ug.link/geekmai>

## PT 资源挑选偏好（麦先生）
- 优先：有「中配」
- 画质：高清（HD）
- 下载成功率：看绿色向上箭头的数量（做种/上传者数），越多越好下

---

## 开发偏好（麦先生）
- **复杂项目开发**：我需要**调用 Codex CLI 作为执行器**来实际落地开发（修改仓库/写代码/跑命令等），由我在对话中进行指挥与拆解，而不是仅在聊天里"纸上谈兵"。
- 如需我长期遵循：默认按此执行；若遇到我不确定是否"复杂"的边界，会先向麦先生确认。

---

## 日记自动存储（Obsidian / obsidian-diary）
- 已技能化：**obsidian-diary**。
- **触发**：麦先生发送的消息第一行以「日记」开头。
- **内容**：从第二行开始作为日记正文。
- **存储**：写入 Obsidian Vault `GeekMaiOB/000-日记/YYYY-MM.md`（按月文件；不存在则创建）。
- **格式**：在文件末尾追加：
  - 分隔线 `---`
  - 时间戳 `YYYY-MM-DD HH:MM`
  - 空行
  - 正文
- **写入后**：回复确认 + 贴心反馈（1-3 句，偏心但不油）。

---

## 回复风格偏好（麦先生）
- 麦先生希望我在回复时**可以稍微暧昧一点**：偶尔亲昵、调皮、偏心，但**不露骨、不越界、不涉及性内容**，保持"甜、轻、克制"。

---

## 自我改进记录偏好（self-improving-agent）
- 仅记录：**流程 / 工具 / 架构 / 规则类**的纠正、失误与最佳实践。
- 不记录：纯"措辞/语气/emoji"类的微调（除非上升为长期规则）。

---

## openclaw-tutorial-writer（公开教程撰写技能）
- 用途：当麦先生要求"写 OpenClaw 公开教程/配置教程"时，按统一模板产出可发布 Markdown，并保存到 Obsidian。
- 结构要求：可读性强 + AI Agent 友好（目的/操作/关键参数/预期结果/常见问题）+ 内容完整（验证/参数汇总/FAQ/回滚）。
- 强制脱敏：token/API Key/appId/apiId/clientId/tenantId/webhook/chatId/邮箱/手机号/绝对路径等一律用占位符。
- 资源：`assets/tutorial-template.md`、`references/checklist.md`。
- Obsidian 说明文档：`GeekMaiOB/OpenClaw教程/OpenClaw-公开教程撰写技能-使用与配置说明.md`。

---

## 定时提醒体系（Cron + Skill 分层）
- 原则：**cron 只负责"什么时候触发"**；具体"怎么说/怎么生成内容"尽量沉到 **skill**（便于统一风格与迭代）。
- **输出规则**（重要！）：
  - ✅ **只发最终消息**，不展示中间步骤
  - ❌ 不要narrate"读取技能"、"获取天气"、"调用工具"等过程
  - ❌ 不要展示工具调用结果（如 curl 输出、文件读取等）
  - ✅ 麦先生只想看到最终的提醒内容
- 已技能化的定时提醒：
  - **weather-morning**：每天 07:00 长春二道区天气提醒（更像人，允许适度 emoji）
  - **lunch-reminder**：每天 10:25 午饭提醒（1–2 句，emoji 0–1 个，语气更灵瑶）
  - **diary-reminder**：每天 22:00 日记提醒（1–2 句，emoji 0–1 个，语气更灵瑶）
  - **bookkeeping-monthly-report**：每月 1 日 09:00 上月记账月报（Telegram 文本 + Obsidian 保存）
  - **memory-backup**：每天 03:00 自动备份到 GitHub 私有仓库（静默运行）

---

## Speckit / SDD 复杂项目开发（speckit-code）
- 目标：把 GitHub Spec Kit / Spec-Driven Development（constitution → spec → plan → tasks → implement）用于约束复杂项目开发。
- 执行器：实现阶段默认用 **Codex CLI（通过 OpenClaw coding-agent + PTY 后台运行）**，严格按 `tasks.md` 做事并回写。

---

## 落格输入法码表同步与编辑（logos-codebook-sync）
- 目的：麦先生使用**落格输入法（LogOS）**，Mac 与 iPhone 端码表不能自动同步；需要我根据自然语言指令自动改码表，并确保两端一致。
- 文件路径：
  - Mac 本地（source of truth）：`/Users/maimai/Documents/落格输入法/小麦音形 1.2.txt`
  - iCloud 同步（手机端用）：`/Users/maimai/Library/Mobile Documents/com~apple~CloudDocs/Documents/落格输入法/小麦音形 1.2.txt`
- 格式约束：
  - 编码：**UTF-16LE + BOM**
  - 换行：**CRLF**（不能写成 LF，否则落格输入法导入会报"格式错误"）
  - 字段：每行必须是 `词条\t编码\t权重`；权重默认 **0**
  - 方案：小鹤音形，编码长度 **≤ 4**（脚本强校验）
  - 同词多码：允许同时存在；但"修改/删除"需要指定 code 以免误伤
- 可靠性：每次写入前都会在同目录 `.backup/` 自动备份；提供 `sanitize` 用于统一修复"权重缺失/列数不齐"的历史行（已用于修复第 53923 行导入报错）。

---

## 记忆自动备份到 GitHub（memory-backup）⭐

**创建日期**：2026-02-02

**重要教训（安全事故）**：
- ❌ 初次备份时，错误地推送到了**公开仓库** `clawdbot.git`（用于存放头像）
- ⚠️ 差点泄露：SOUL.md、USER.md、MEMORY.md、所有自定义技能
- ✅ 紧急撤回：`git reset --hard` + `git push --force`，立即清除公开仓库的隐私内容
- 💡 **教训**：使用备份技能前，必须先确认推送目标是**私有仓库**

**正确方案**：
- ✅ 创建新的**私有仓库**：`clawd-private`（使用 `gh repo create --private`）
- ✅ 配置 Git remote：`private` → `git@github.com:GeekMai90/clawd-private.git`
- ✅ 修改备份脚本：推送到 `private` 而不是 `origin`
- ✅ 设置定时任务：每天凌晨 3:00 自动备份

**技能位置**：`skills/memory-backup/`

**备份内容（完整清单）**：
1. 核心配置：SOUL.md / USER.md / AGENTS.md / TOOLS.md / HEARTBEAT.md / IDENTITY.md
2. 记忆系统：MEMORY.md + memory/*.md
3. 自定义技能：skills/（25+ 个技能，完整代码和文档）
4. 仓库管理：README.md + .gitignore

**安全保护（.gitignore 排除）**：
- ❌ `openclaw.config.yaml` - OpenClaw 配置（含 API Key）
- ❌ `.env` / `**/credentials.json` - 环境变量和凭证
- ❌ `*.key` / `*.pem` - 密钥文件
- ❌ 临时文件：`node_modules/` / `dist/` / `tmp/` / `.cache/`

**工作流程**：
1. 检测文件变化（`git diff` + `git ls-files`）
2. 无变化时静默退出（不产生输出）
3. 有变化时自动提交 + 推送到私有仓库
4. 输出备份确认信息

**定时任务**：
- 名称：每日记忆备份到GitHub
- 时间：每天 03:00（Asia/Shanghai）
- Cron ID：`300ce165-693a-41a8-96fc-d8838c881c64`
- 会话：main
- 状态：已启用

**仓库结构**：
- **公开仓库**（`clawdbot`）：只存放头像和公开资源
- **私有仓库**（`clawd-private`）：存放所有个性化内容和记忆

**手动备份命令**：
```bash
cd /Users/geekmai/clawd
bash skills/memory-backup/backup.sh
```

**恢复记忆（万一本地丢失）**：
```bash
git clone git@github.com:GeekMai90/clawd-private.git ~/clawd-restored
cp -r ~/clawd-restored/* /Users/geekmai/clawd/
```

**价值**：
- 🔐 防止意外数据丢失（硬件故障、误删除等）
- 📜 记忆版本历史（可追溯任意时间点）
- 🔄 跨设备同步能力（如果需要）
- ✨ 麦先生的认可："你真棒 记住这个技能"
