---
name: rime-flypy
description: Manage Rime/Squirrel (鼠须管) 小鹤音形 dictionaries on macOS. Use when the user asks to add/update/delete a phrase or symbol in Rime 小鹤音形, adjust weights, pin a phrase to top priority, sanitize tab-separated txt dictionaries, or trigger Rime redeploy/build.
---

# Rime（鼠须管）小鹤音形：词库增删改 + 一键部署

## Paths (macOS)
- **Rime 用户目录**: `/Users/maimai/Library/Rime`
- **小鹤音形 txt 词库**:
  - `flypy_user.txt`：用户词库（默认新增写这里）
  - `flypy_top.txt`：置顶词库（需要优先于系统词时写这里）
  - `flypy_sys.txt`：系统次选词（可改/可删，谨慎）
- **部署工具**（鼠须管自带）:
  - `rime_deployer`: `/Library/Input Methods/Squirrel.app/Contents/MacOS/rime_deployer`
  - shared_data_dir: `/Library/Input Methods/Squirrel.app/Contents/SharedSupport`
  - staging_dir: `/Users/maimai/Library/Rime/build`

## Format rules
- 文件编码：**UTF-8**
- 词库每一条是：
  - `词条<TAB>编码` 或 `词条<TAB>编码<TAB>权重`
- **小鹤音形编码长度 ≤ 4**（脚本强校验）
- 默认权重：**0**（除非用户指定）
- **同词多码允许共存**（添加时不去重别的编码；仅避免重复的“同词+同码”）

## Commands
Run via:

```bash
python3 skills/rime-flypy/scripts/rime_flypy.py <command> [args...]
```

### Add a phrase
- 默认写入 `flypy_user.txt`:

```bash
python3 skills/rime-flypy/scripts/rime_flypy.py add \
  --text "OpenClaw" --code opcl --weight 0
```

- 置顶（优先于系统词）：

```bash
python3 skills/rime-flypy/scripts/rime_flypy.py add \
  --dict top --text "OpenClaw" --code opcl --weight 0
```

### Update (change code/weight)
```bash
python3 skills/rime-flypy/scripts/rime_flypy.py set \
  --dict user --text "OpenClaw" --code opcl --weight 5
```

If the same text has multiple codes, require `--code` to disambiguate.

### Delete
```bash
python3 skills/rime-flypy/scripts/rime_flypy.py delete --dict user --text "OpenClaw" --code opcl
```

### Find
```bash
python3 skills/rime-flypy/scripts/rime_flypy.py find --query "Open" 
python3 skills/rime-flypy/scripts/rime_flypy.py find --code opcl
```

### Sanitize
Normalize dictionary lines (tabs/weights), removing lines that cannot be fixed:

```bash
python3 skills/rime-flypy/scripts/rime_flypy.py sanitize --dict user
python3 skills/rime-flypy/scripts/rime_flypy.py sanitize --dict top --dry-run
```

### Deploy (重新部署)
```bash
python3 skills/rime-flypy/scripts/rime_flypy.py deploy
```

## Conversational mapping
- “添加词/短语 X 编码 abcd（权重可选）” → `add --dict user`
- “置顶/优先 X 编码 abcd” → `add --dict top`
- “把 X 的码改成 abcd / 权重改成 N” → `set`（同词多码时要求指定旧 code）
- “删除 X（编码 abcd）” → `delete`
- “重新部署/重新部署鼠须管” → `deploy`

## Safety
- Every write creates a timestamped backup in `/Users/maimai/Library/Rime/.backup/`.
