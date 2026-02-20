---
name: flashnote-capsule-sync
description: 将 Obsidian 的“04-资源/闪念笔记/dinox”和“voicenotes”中新增加的 Markdown 笔记提取主要内容，并按“闪念胶囊.md”格式追加。用于每日定时归档闪念、手动补跑同步、或排查是否有漏同步。
---

# flashnote-capsule-sync

使用这个技能把新增闪念自动汇总到 `闪念胶囊.md`。

## 路径约定

- 来源目录：
  - `/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB/04-资源/闪念笔记/dinox`
  - `/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB/04-资源/闪念笔记/voicenotes`
- 目标文件：
  - `/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB/04-资源/闪念笔记/闪念胶囊.md`
- 已处理状态：
  - `/Users/geekmai/clawd/skills/flashnote-capsule-sync/data/processed-files.json`

## 执行命令

先在工作区执行：

```bash
cd /Users/geekmai/clawd
```

### 1) 首次初始化（只建立“已处理清单”，不写入胶囊）

```bash
node skills/flashnote-capsule-sync/scripts/sync.js --bootstrap
```

### 2) 日常同步（只处理新增）

```bash
node skills/flashnote-capsule-sync/scripts/sync.js
```

如果要给自动化任务读取统计信息：

```bash
node skills/flashnote-capsule-sync/scripts/sync.js --report-json
```

### 3) 历史回填（可选，会把所有未记录文件写入胶囊）

```bash
node skills/flashnote-capsule-sync/scripts/sync.js --backfill
```

## 输出格式

追加到 `闪念胶囊.md` 时，保持：

1. 一行日期时间标题（`YYYY年M月D日 HH:mm`）
2. 下一行主要内容
3. 条目之间空一行

## 故障处理

- 如果提示 `No new notes found.`，代表本次没有新增笔记。
- 如果需要重建状态（谨慎），删除 `processed-files.json` 后重新 `--bootstrap`。
- 不要直接清空 `闪念胶囊.md`，避免历史闪念丢失。
