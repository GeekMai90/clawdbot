# 麦先生的 OpenClaw Workspace

这是麦先生的 OpenClaw 个性化配置和记忆备份仓库。

## 📦 仓库内容

### 🧠 核心配置
- `SOUL.md` - 灵瑶的性格和行为准则
- `USER.md` - 麦先生的个人信息
- `AGENTS.md` - 工作区说明和规则
- `TOOLS.md` - 本地工具配置和快查
- `HEARTBEAT.md` - 心跳检查清单
- `IDENTITY.md` - 身份信息

### 📝 记忆系统（三层架构）
- `memory/core.md` - 🔥 HOT：每次都加载的核心规则（极简）
- `MEMORY.md` - ♻️ WARM：长期记忆，按需加载（主会话专用）
- `memory/` - 每日记忆文件（按日期组织）
- `memory/_archive/` - 🗄️ COLD：30天以上旧日志归档

### 🛠️ 自定义技能（33 个）

#### 提醒 & 生活
- `weather-morning/` - 早晨天气提醒（07:00）
- `lunch-reminder/` - 午餐提醒（10:25）
- `diary-reminder/` - 日记提醒（22:00）

#### 笔记 & 内容
- `obsidian-diary/` - Obsidian 日记写入
- `url-reader/` - 网页抓取存 Obsidian
- `bookmark-organizer/` - 书签整理
- `flashnote-capsule-sync/` - 闪念胶囊同步
- `content-production/` - 内容生产系统
- `notion-topic/` - 选题记录到 Notion

#### 财务 & 记录
- `bookkeeping/` - 记账 / 报销 / 订阅管理
- `bookkeeping-monthly-report/` - 月度账单报告
- `douban-movie/` - 豆瓣电影推荐 & 观影记录

#### AI & 创作
- `airbrush/` - Airbrush AI 文生图
- `speckit-code/` - Spec 驱动开发

#### 输入法
- `rime-squirrel/` - 鼠须管小鹤音形
- `rime-flypy/` - 小鹤音形词库
- `logos-codebook-sync/` - 落格输入法码表同步

#### 系统 & 运维
- `memory-backup/` - 自动备份到 GitHub（03:00）
- `self-improving-agent/` - 自我改进记录
- `weekly-system-healthcheck/` - 每周系统体检（周六 10:00）
- `openclaw-security-auditor/` - 安全审计
- `openclaw-tutorial-writer/` - 公开教程撰写
- `openclaw-update-checker/` - 版本更新检查
- `second-brain-start/` - 启动第二大脑 App
- `second-brain-stop/` - 停止第二大脑 App

#### 工具 & 集成
- `telegram-offline-voice/` - Telegram 本地语音 TTS
- `apple-mail-search/` / `apple-mail-search-safe/` - Apple Mail 搜索
- `getnote-kb/` - Get 笔记知识库
- `byterover-headless/` - ByteRover 知识库
- `discord-translator/` - Discord 翻译
- `appsumo-watcher/` - AppSumo 监控
- `voicenotes-official/` - 语音笔记

## 🔐 隐私说明

⚠️ **这是私有仓库**，包含个人信息和配置。请勿公开分享。

**不包含的敏感信息：**
- ✅ API Keys（已在 `.gitignore` 中排除）
- ✅ OpenClaw 配置文件（`openclaw.config.yaml`）
- ✅ 凭证和密钥文件

## 🚀 自动备份

使用 `skills/memory-backup/` 技能自动备份：
- 每天凌晨 3 点自动备份
- 检测文件变化后自动提交推送
- 静默运行，无变化时不产生输出

## 🔄 恢复记忆

如果本地文件丢失，可以从 GitHub 恢复：

```bash
# 克隆私有仓库
git clone git@github.com:GeekMai90/clawd-private.git ~/clawd-restored

# 复制文件回 workspace
cp -r ~/clawd-restored/* /Users/geekmai/clawd/
```

## 📊 仓库统计

- 自定义技能：33 个
- 每日记忆：持续积累中
- 最后更新：自动备份

---

**灵瑶** 为麦先生服务 ✨
