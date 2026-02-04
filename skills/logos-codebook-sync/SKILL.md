---
name: logos-codebook-sync
description: Sync and edit 落格输入法 (LogOS) custom codebook/码表 files across the Mac local path and the iCloud Drive path used for phone sync. Use when the user says they want to add a word/phrase, change a code/weight, delete an entry, or ensure the Mac codebook and the iCloud-synced codebook stay identical.
---

# 落格输入法 码表自动维护（Mac 本地 → iCloud 同步）

## Files
- **Mac 本地码表（source of truth）**：`/Users/geekmai/Documents/落格输入法/小麦音形 1.2.txt`
- **iCloud 同步码表（给手机端用）**：`/Users/geekmai/Library/Mobile Documents/com~apple~CloudDocs/Documents/落格输入法/小麦音形 1.2.txt`

Both are **UTF-16LE** text with tab-separated fields.

你使用的是 **小鹤音形**：编码长度 **最多 4 位**（脚本会做校验，超过 4 会拒绝写入）。

```
词条<TAB>编码<TAB>权重
```

## Golden rules
1) **永远先改 Mac 本地文件**，再把修改后的文件复制覆盖到 iCloud 路径。
2) 每次改动前都要自动备份（同目录下 `.backup/`）。
3) 写回时保持 **UTF-16LE + BOM**，不改变其他行的顺序（除非用户要求排序）。

## Common operations
Use the script:

```bash
python3 skills/logos-codebook-sync/scripts/update_codebook.py \
  --mac "/Users/geekmai/Documents/落格输入法/小麦音形 1.2.txt" \
  --icloud "/Users/geekmai/Library/Mobile Documents/com~apple~CloudDocs/Documents/落格输入法/小麦音形 1.2.txt" \
  <command> [args...]
```

### Add (append if not exists)
```bash
python3 ... add --text "张宝权" --code "zbq" --weight 0
```

### Update (by text; update code/weight)
```bash
python3 ... set --text "张宝权" --code "zbq" --weight 1
```

### Delete (by text + optional code)
```bash
python3 ... delete --text "张宝权" --code "zbq"
```

### Find / preview
```bash
python3 ... find --query "张宝权"
python3 ... find --code "zbq"
```

## Conversational mapping (how to interpret the user)
- 用户说：**“添加词：X，码：abc（权重可选）”** → `add`
- 用户说：**“把 X 的码改成 abc / 权重改成 1”** → `set`
- 用户说：**“删除 X（或删除 X 对应的 abc 码）”** → `delete`
- 用户说：**“查一下 X / 查一下 abc”** → `find`

If the user’s instruction is ambiguous (e.g., the same text exists with multiple codes), ask one clarification: which code to modify/delete.
