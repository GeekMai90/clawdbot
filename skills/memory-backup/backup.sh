#!/bin/bash
#
# memory-backup.sh - 自动备份 OpenClaw 记忆到 GitHub
#
# 用途：定期将 MEMORY.md 和 memory/*.md 推送到 GitHub 仓库
# 触发：由 OpenClaw cron 定时调用，或手动运行
#

set -euo pipefail

# 切换到 workspace 根目录（脚本在 skills/memory-backup/）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT" || exit 1

# 检查是否是 Git 仓库
if [ ! -d ".git" ]; then
  echo "❌ 错误：当前目录不是 Git 仓库"
  echo "请先运行：git init && git remote add origin <仓库URL>"
  exit 1
fi

# 检查是否配置了 private remote（私有仓库）
if ! git remote get-url private &>/dev/null; then
  echo "❌ 错误：未配置 private remote"
  echo "请先运行：git remote add private <私有仓库URL>"
  exit 1
fi

# 需要备份的文件列表
FILES_TO_BACKUP=(
  # 核心配置文件
  "AGENTS.md"
  "SOUL.md"
  "USER.md"
  "TOOLS.md"
  "HEARTBEAT.md"
  "IDENTITY.md"
  
  # 记忆文件
  "MEMORY.md"
  "memory/"
  
  # 自定义技能（所有技能目录）
  "skills/"
  
  # 其他重要文件
  ".gitignore"
  "README.md"
)

# 检查是否有变化（包括新文件和修改）
if git diff --quiet HEAD -- "${FILES_TO_BACKUP[@]}" 2>/dev/null && \
   [ -z "$(git ls-files --others --exclude-standard "${FILES_TO_BACKUP[@]}" 2>/dev/null)" ]; then
  # 无变化，静默退出
  exit 0
fi

# 有变化，执行备份
echo "🔄 检测到记忆变化，开始备份..."

# 添加文件到暂存区
git add "${FILES_TO_BACKUP[@]}" 2>/dev/null || true

# 检查是否有内容需要提交
if git diff --cached --quiet; then
  echo "✅ 无新内容需要提交"
  exit 0
fi

# 提交（带时间戳）
COMMIT_MSG="自动备份记忆 $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" --quiet

# 推送到私有仓库（使用当前分支）
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📤 推送到 GitHub 私有仓库 ($CURRENT_BRANCH)..."

if git push private "$CURRENT_BRANCH" --quiet 2>&1; then
  echo "✅ 记忆已成功备份到 GitHub 私有仓库"
  echo "   仓库: clawd-private"
  echo "   分支: $CURRENT_BRANCH"
  echo "   时间: $(date '+%Y-%m-%d %H:%M:%S')"
else
  echo "❌ 推送失败，请检查网络和 Git 认证"
  exit 1
fi
