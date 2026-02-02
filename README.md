# 麦先生的 OpenClaw Workspace

这是麦先生的 OpenClaw 个性化配置和记忆备份仓库。

## 📦 仓库内容

### 🧠 核心配置
- `SOUL.md` - 灵瑶的性格和行为准则
- `USER.md` - 麦先生的个人信息
- `AGENTS.md` - 工作区说明和规则
- `TOOLS.md` - 本地工具配置和技巧
- `HEARTBEAT.md` - 心跳检查清单
- `IDENTITY.md` - 身份信息

### 📝 记忆系统
- `MEMORY.md` - 长期记忆（主会话专用）
- `memory/` - 每日记忆文件（按日期组织）

### 🛠️ 自定义技能
- `skills/` - 所有自定义技能
  - `airbrush/` - Airbrush AI 文生图
  - `bookkeeping/` - 记账技能
  - `douban-movie/` - 豆瓣电影推荐
  - `obsidian-diary/` - Obsidian 日记
  - `weather-morning/` - 早晨天气提醒
  - `memory-backup/` - 自动备份到 GitHub
  - ... 以及更多

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
# 克隆仓库
git clone git@github.com:GeekMai90/clawdbot.git ~/clawd-restored

# 复制文件回 workspace
cp -r ~/clawd-restored/* /Users/geekmai/clawd/
```

## 📊 仓库统计

- 自定义技能：25+ 个
- 每日记忆：持续积累中
- 最后更新：自动备份

---

**灵瑶** 为麦先生服务 ✨
