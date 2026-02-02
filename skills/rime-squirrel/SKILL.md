---
name: rime-squirrel
description: Manage macOS 鼠须管 (Rime/Squirrel) configuration for 小鹤音形 (flypy), including custom phrases (flypy_user/top/sys txt), punctuation behavior (punctuator half_shape/full_shape, ascii_punct), key bindings, and safe backups + redeploy via rime_deployer. Use when the user asks to set or restore a punctuation key (/, [], \\), add or pin a custom word/phrase with a code, adjust ordering, or redeploy/sync their Rime folder.
---

# Rime 鼠须管（macOS）- 小鹤音形维护手册（给“另一个我”用）

## Paths
- **Rime 用户目录（优先）**：`~/Library/Rime`
  - 注意：这里可能是一个 symlink（用户用 iCloud 同步），照样当作用户目录用。
- **常见关键文件**（以用户当前 flypy 配置为例）：
  - `flypy.schema.yaml`：方案本体（不建议直接改，升级/覆盖风险高）
  - `flypy.custom.yaml`：方案补丁（建议所有定制都写这里）
  - `default.custom.yaml`：全局补丁（方案列表、Shift 切换策略等）
  - `squirrel.custom.yaml`：外观/应用默认输入等
  - `flypy_user.txt` / `flypy_top.txt` / `flypy_sys.txt`：小鹤音形 txt 词库（UTF-8，TAB 分隔）
  - `build/`：部署生成物（不要当作“唯一真相”去长期手改；必要时仅用于临时救火）

## Safety（必须做）
1) 改任何东西前先备份：
   - 推荐：把要改的文件复制一份 `*.bak-YYYYMMDD-HHMMSS`
   - 或者复制整个 `~/Library/Rime` 到 `~/Library/Rime.bak-...`
2) 改动后再部署：
   - GUI：鼠须管菜单 → 重新部署
   - CLI：用本技能脚本 `scripts/rime_squirrel.py deploy`

## 任务 1：把某个标点键改成“只输出一个符号（不出候选列表）”

Rime 标点候选来自 `punctuator`。
最稳做法：在 `flypy.custom.yaml` 里 patch：
- `punctuator/half_shape`：更偏“英文/半角标点”
- `punctuator/full_shape`：更偏“中文/全角标点”

### 例：让 `/` 永远只输出 `/`
在 `flypy.custom.yaml` 写入：
```yaml
patch:
  punctuator/half_shape:
    "/": { commit: "/" }
  punctuator/full_shape:
    "/": { commit: "/" }
```

### 恢复默认（回到候选列表）
删除 `flypy.custom.yaml` 里对应 key 的覆盖即可。

> 提醒：Shift 切换的是 `ascii_mode`（中英文），但标点是否“中/英”通常由 `ascii_punct` 开关决定，两者可能不联动。用户如果说“中文也变成英文标点了”，优先检查/切换 `ascii_punct`。

## 任务 2：新增/置顶自定义词（小鹤音形 txt 词库）

- 默认新增：写 `flypy_user.txt`
- 需要压过系统词：写 `flypy_top.txt`

格式（UTF-8，TAB 分隔）：
- `词条<TAB>编码` 或 `词条<TAB>编码<TAB>权重`

部署后生效。

## CLI 工具
- 标点键：
  - `python3 skills/rime-squirrel/scripts/rime_squirrel.py punct-set --schema flypy --key / --half / --full /`
  - `python3 skills/rime-squirrel/scripts/rime_squirrel.py punct-unset --schema flypy --key /`
- 自定义词（写入 **flypy_user.txt**）：
  - `python3 skills/rime-squirrel/scripts/rime_squirrel.py phrase-add --text "Anteey" --code ante --weight 0`
  - 置顶：`python3 skills/rime-squirrel/scripts/rime_squirrel.py phrase-add --dict top --text "Anteey" --code ante --weight 10`
- 部署：
  - `python3 skills/rime-squirrel/scripts/rime_squirrel.py deploy`

脚本会：
- 自动定位 `~/Library/Rime`（跟随 symlink）
- 写入/更新 `<schema>.custom.yaml`（如 `flypy.custom.yaml`）
- 自动备份被修改文件
