---
name: weekly-system-healthcheck
description: 每周自动体检 OpenClaw 系统，检查 cron jobs 健康、文件体积、路径存在性、技能脚本完整性、GitHub 备份状态，自动归档旧日志，发 Telegram 报告。
---

# weekly-system-healthcheck

每周六 10:00 自动运行，发 Telegram 体检报告给麦先生。

## 触发方式

- **自动**：cron `0 10 * * 6`（每周六 10:00 Asia/Shanghai）
- **手动**：说"跑一次系统体检"或"system healthcheck"

## 检查项目（7 项）

| # | 检查项 | 自动修复 |
|---|--------|---------|
| 1 | Cron jobs：wakeMode / nextRunAtMs | ❌ 报告（涉及重建） |
| 2 | 关键文件体积（core.md / MEMORY.md 等） | ❌ 报告 |
| 3 | memory/ 旧日志归档（> 30 天） | ✅ 自动归档 |
| 4 | GitHub 备份状态（最近提交 / 待提交数） | ❌ 报告 |
| 5 | Workspace 总大小 | ❌ 报告 |
| 6 | 关键路径存在性（Vault / skills / memory 等） | ❌ 报告 |
| 7 | 技能关键脚本存在性 | ❌ 报告 |

## 执行步骤

```bash
cd /Users/geekmai/clawd
python3 skills/weekly-system-healthcheck/scripts/healthcheck.py
```

输出 JSON，包含四个字段：
- `issues`：🔴 需要人工处理的问题
- `warnings`：🟡 异常但不紧急
- `auto_fixed`：✅ 已自动修复的项目
- `ok`：🟢 正常项目

## Telegram 报告格式

将 JSON 输出格式化为一条 Telegram 消息发给麦先生（chatId: 5233110346）：

**全绿时**（简洁版）：
```
🟢 系统体检通过 2026-02-28
13 个 cron 任务正常，所有路径存在，GitHub 备份正常。
```

**有问题时**（详细版）：
```
🔧 系统体检报告 2026-02-28

🔴 需处理（X 项）：
• [问题描述]

🟡 注意（X 项）：
• [警告描述]

✅ 已自动修复：
• [自动修复项]

🟢 正常：共 X 项通过
```

发送完成后只输出 NO_REPLY。
