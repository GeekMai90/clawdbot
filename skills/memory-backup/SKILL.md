# memory-backup - 定期备份记忆到 GitHub

## 目的

定期自动将 OpenClaw 的永久记忆文件备份到 GitHub 仓库，防止意外丢失。

## 备份内容

- `MEMORY.md` - 长期记忆（主会话专用）
- `memory/YYYY-MM-DD.md` - 每日记忆文件
- `AGENTS.md` / `SOUL.md` / `USER.md` / `TOOLS.md` 等核心文件

## 使用方法

### 1. 初次设置（一次性）

```bash
# 进入 OpenClaw workspace
cd /Users/geekmai/clawd

# 确认已经是 Git 仓库（如果不是，先初始化）
git status

# 如果提示"不是 git 仓库"，则初始化：
git init
git remote add origin https://github.com/麦先生的用户名/仓库名.git

# 配置 Git 用户信息（如果还没配置）
git config user.name "麦先生"
git config user.email "zbqlovewxq@gmail.com"
```

### 2. 手动备份（测试用）

```bash
# 进入技能目录
cd skills/memory-backup

# 运行备份脚本
bash backup.sh
```

### 3. 自动定时备份（推荐）

使用 OpenClaw 的 cron 功能，设置定期任务：

**方式 1：每天凌晨 3 点备份**

```json
{
  "name": "每日记忆备份",
  "schedule": {
    "kind": "cron",
    "expr": "0 3 * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "systemEvent",
    "text": "定时任务：备份记忆到 GitHub"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

**方式 2：每小时备份一次**

```json
{
  "name": "每小时记忆备份",
  "schedule": {
    "kind": "cron",
    "expr": "0 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "systemEvent",
    "text": "定时任务：备份记忆到 GitHub"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

## 工作流程

1. **检测变化**：脚本检查 `MEMORY.md` 和 `memory/*.md` 是否有改动
2. **自动提交**：如果有变化，自动 `git add` + `git commit`
3. **推送到远程**：`git push` 到 GitHub 仓库
4. **静默运行**：无变化时不产生输出，有备份时简短确认

## 备份脚本说明

`backup.sh` 核心逻辑：

```bash
#!/bin/bash
# 切换到 workspace 根目录
cd "$(dirname "$0")/../.." || exit 1

# 检查是否有变化
if git diff --quiet MEMORY.md memory/; then
  # 无变化，静默退出
  exit 0
fi

# 有变化，执行备份
git add MEMORY.md memory/ AGENTS.md SOUL.md USER.md TOOLS.md HEARTBEAT.md IDENTITY.md
git commit -m "自动备份记忆 $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# 输出确认
echo "✅ 记忆已备份到 GitHub ($(date '+%Y-%m-%d %H:%M:%S'))"
```

## 注意事项

⚠️ **隐私与安全**

1. **私有仓库**：确保 GitHub 仓库是 **Private（私有）**，不要公开个人记忆
2. **敏感信息**：MEMORY.md 中避免写明文密码、API Key、私密信息
3. **访问控制**：只给必要的人授权访问仓库

⚠️ **Git 认证**

- **推荐使用 SSH Key**：避免每次都输入密码
- 或使用 **Personal Access Token**（GitHub Settings > Developer settings > Personal access tokens）

设置 SSH Key：
```bash
# 生成 SSH Key（如果还没有）
ssh-keygen -t ed25519 -C "zbqlovewxq@gmail.com"

# 添加到 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 然后粘贴到 GitHub Settings > SSH and GPG keys
```

## 故障排查

### 问题 1：git push 需要输入密码

**解决**：改用 SSH URL

```bash
# 查看当前 remote
git remote -v

# 如果是 https://，改成 SSH
git remote set-url origin git@github.com:用户名/仓库名.git
```

### 问题 2：提示 "nothing to commit"

**原因**：没有新的改动，这是正常的（脚本会自动跳过）

### 问题 3：提示 "permission denied"

**解决**：检查 SSH Key 是否正确添加到 GitHub

```bash
# 测试 SSH 连接
ssh -T git@github.com
# 应该看到：Hi 用户名! You've successfully authenticated...
```

## 恢复记忆（万一本地丢失）

```bash
# 1. 克隆仓库
git clone git@github.com:用户名/仓库名.git ~/clawd-restored

# 2. 检查记忆文件
ls -la ~/clawd-restored/memory/
cat ~/clawd-restored/MEMORY.md

# 3. 复制回 workspace（如果需要）
cp ~/clawd-restored/MEMORY.md /Users/geekmai/clawd/
cp -r ~/clawd-restored/memory/* /Users/geekmai/clawd/memory/
```

## 监控备份状态

定期检查 GitHub 仓库的 commits：

- 访问：`https://github.com/用户名/仓库名/commits/main`
- 确认自动提交正常运行
- 查看最新备份时间

## 优化建议

1. **备份频率**：根据使用频率调整
   - 重度使用：每小时备份
   - 日常使用：每天 1-2 次
   - 轻度使用：每天 1 次

2. **.gitignore**：排除不需要备份的文件
   ```
   # .gitignore
   node_modules/
   .DS_Store
   *.log
   ```

3. **分支策略**：可以创建备份专用分支
   ```bash
   git checkout -b memory-backup
   git push -u origin memory-backup
   ```

## 相关资源

- OpenClaw Cron 文档：`/docs/features/cron.md`
- GitHub SSH Key 设置：https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Git 基础教程：https://git-scm.com/book/zh/v2

---

**建议：** 初次设置后，手动运行一次 `bash backup.sh` 测试是否正常，确认能成功推送到 GitHub 后再启用 cron 定时任务。
