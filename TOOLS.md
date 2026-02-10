# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Apple Notes (memo)

**常用命令：**
- 列出所有笔记：`memo notes`
- 按文件夹筛选：`memo notes -f "文件夹名"`
- 列出文件夹：`memo notes -fl`

**创建笔记（推荐用 AppleScript）：**
```bash
osascript -e 'tell application "Notes"
    tell account "iCloud"
        tell folder "Notes"
            make new note with properties {name:"标题", body:"内容"}
        end tell
    end tell
end tell'
```

**技巧：**
- `memo notes | grep "关键词"` 快速查找笔记
- 麦先生的笔记主要在 iCloud 的 Notes 文件夹
- 一共有多个分类：Anteey开发、Docker、Github、Nas相关、游戏相关、SwiftUI、网络相关等

---

## Apple Reminders (remindctl)

**常用命令：**
- 查看所有待办：`remindctl all`
- 查看今天：`remindctl today`
- 查看过期：`remindctl overdue`
- 查看列表：`remindctl list`

**创建提醒：**
```bash
remindctl add --title "标题" --list "工作" --due "2026-01-30 09:00" --notes "备注内容"
```

**完成提醒：**
```bash
remindctl complete [id]
```

**技巧：**
- 日期格式：`YYYY-MM-DD HH:mm`
- 常用列表：工作、收件箱、个人
- 麦先生说"提醒我"、"创建待办"时，就用 remindctl 创建
- 会自动同步到所有 Apple 设备

---

## Apple Calendar（Calendar.app）

**创建日程（推荐，直接 AppleScript）：**
```bash
osascript <<'APPLESCRIPT'
tell application "Calendar"
    tell calendar "日历"
        set s to current date
        set year of s to 2026
        set month of s to January
        set day of s to 28
        set time of s to (14 * hours)

        set e to current date
        set year of e to 2026
        set month of e to January
        set day of e to 28
        set time of e to (15 * hours)

        make new event with properties {summary:"日程标题", start date:s, end date:e, description:"详细描述"}
    end tell
end tell
APPLESCRIPT
```

**查看某个日历里的近期事件：**
```bash
osascript <<'APPLESCRIPT'
tell application "Calendar"
    tell calendar "日历"
        set theEvents to (every event whose start date ≥ (current date) and start date ≤ ((current date) + 7 * days))
        repeat with ev in theEvents
            log ((summary of ev) as text)
        end repeat
    end tell
end tell
APPLESCRIPT
```

**技巧：**
- 默认使用 Apple Calendar（iCloud 同步）
- 常见日历名：`日历`、`家庭`、`工作`（先确认本机实际名称）
- 时间统一按 Asia/Shanghai 理解与表达
- 麦先生说"创建日程"、"添加日历"时，优先用 Calendar.app 创建，避免走 Google Calendar

---

## Rime / 鼠须管（Hamster3）

- **Rime 用户配置路径（iCloud 同步）**：`/Users/geekmai/Library/Mobile Documents/iCloud~com~ihsiao~apps~Hamster3/Documents/RimeUserData/RimeMac`

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Notion

**API Key 存储位置**: `~/.config/notion/api_key`
**格式**: 以 `ntn_` 开头
**获取方式**: https://notion.so/my-integrations
**页面权限**: 需要在 Notion 中点击 "..." → "Connect to" 分享给 integration

**常用操作：**

```bash
# 读取 API Key
NOTION_KEY=$(cat ~/.config/notion/api_key)

# 搜索页面
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -d '{"query": "关键词", "page_size": 20}'

# 获取页面内容
curl "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"

# 添加内容块（段落）
curl -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"children": [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "内容"}}]}}]}'

# 添加待办
curl -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -d '{"children": [{"object": "block", "type": "to_do", "to_do": {"rich_text": [{"text": {"content": "任务"}}], "checked": false}}]}'

# 创建页面
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -d '{"parent": {"page_id": "父ID"}, "properties": {"title": {"title": [{"text": {"content": "标题"}}]}}}'

# 查询数据库
curl -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -d '{"filter": {"property": "Status", "select": {"equals": "Todo"}}}'
```

**属性类型格式：**
- 标题: `{"title": [{"text": {"content": "标题"}}]}`
- 富文本: `{"rich_text": [{"text": {"content": "文本"}}]}`
- 选择: `{"select": {"name": "选项"}}`
- 多选: `{"multi_select": [{"name": "A"}, {"name": "B"}]}`
- 日期: `{"date": {"start": "2024-01-15"}}`
- 复选框: `{"checkbox": true}`
- 数字: `{"number": 42}`
- URL: `{"url": "https://..."}`

**重要提示：**
- API 版本: `2025-09-03`（必须）
- 数据库现在叫 "data sources"
- 有 `database_id` 和 `data_source_id` 两个 ID
- 速率限制: ~3 请求/秒

---

## Obsidian

**麦先生的 Vault**: `GeekMaiOB`
**Vault 路径**: `/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB`
**工具**: `obsidian-cli` (已安装)

**常用命令：**

```bash
# 设置默认 vault
obsidian-cli set-default "GeekMaiOB"

# 查看默认 vault 路径
obsidian-cli print-default --path-only

# 搜索笔记名称
obsidian-cli search "关键词"

# 搜索笔记内容
obsidian-cli search-content "关键词"

# 创建新笔记
obsidian-cli create "文件夹/笔记名" --content "内容" --open

# 移动/重命名笔记（会自动更新所有链接！）
obsidian-cli move "旧路径/笔记" "新路径/笔记"

# 删除笔记
obsidian-cli delete "路径/笔记"
```

**直接文件操作（推荐）：**

```bash
# Vault 路径变量
VAULT="/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"

# 列出所有笔记
find "$VAULT" -name "*.md" -type f | grep -v "\.obsidian"

# 读取笔记
cat "$VAULT/笔记路径.md"

# 编辑笔记（直接修改 .md 文件，Obsidian 会自动检测）
echo "新内容" >> "$VAULT/笔记路径.md"
```

**笔记结构：**
- `00-收件箱/` - 临时存放，定期整理
- `01-日记/私人日记/` - 月度个人日记（格式：YYYY-MM.md）
- `01-日记/每日笔记/` - Daily Note 每日流水账
- `04-资源/Readwise/` - Readwise 同步划线
- `04-资源/网络收藏/` - URL reader 网页收藏
- `04-资源/闪念笔记/` - 闪念笔记
- `06-创作/` - 内容生产系统
- `04-学习/中医/` - 中医学习笔记
- `02-生活/电影/` - 观影记录
- `02-生活/记账/` - 记账数据
- `07-工具/OpenClaw教程/` - OpenClaw 教程
- `90-草稿纸/` - 草稿和临时笔记
- `copilot/` - Copilot 插件自动管理
- `Excalidraw/` - 绘图模板

**📔 日记功能（自动触发）：**

**触发方式：** 麦先生发送以"日记"开头的消息（第二行开始是日记内容）

**自动操作流程：**
1. 定位到 `01-日记/私人日记/YYYY-MM.md`（当月日记文件，不存在则创建）
2. 在文件末尾追加格式化内容：
   ```
   
   
   ---
   YYYY-MM-DD HH:MM
   
   日记内容
   ```
3. 给麦先生一个温暖的正向反馈

**示例：**
```bash
# 追加日记到当月文件
VAULT="/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"
MONTH=$(date '+%Y-%m')
DIARY_FILE="$VAULT/01-日记/私人日记/$MONTH.md"

# 如果文件不存在，先创建
[ ! -f "$DIARY_FILE" ] && echo "# $MONTH" > "$DIARY_FILE"

# 追加日记
cat >> "$DIARY_FILE" << EOF
---
$(date '+%Y-%m-%d %H:%M')

日记内容在这里
EOF
```

**重要提示：**
- Obsidian vault 就是普通的文件夹，笔记是纯 Markdown 文件
- 可以直接用任何编辑器修改 `.md` 文件，Obsidian 会自动同步
- 使用 `obsidian-cli move` 而不是 `mv`，可以自动更新所有 wikilinks
- 避免在 `.obsidian/` 文件夹中操作
- Vault 存储在 iCloud，会自动同步

---

## Airbrush AI - 文生图 🎨

**麦先生的账号**：zbqlovewxq@gmail.com  
**永久会员**：每月 500 点额度  
**配置文件**：`~/.config/airbrush/credentials.json`  
**脚本位置**：`skills/airbrush/airbrush.sh`  
**图片存储**：
- 专用文件夹：`/Users/geekmai/AI-Images/`
- 下载文件夹：`~/Downloads/`（自动复制一份）

### 🌟 智能增强功能

**1️⃣ 中文自动翻译**
- 麦先生用中文描述，我自动翻译成优化的英文提示词
- 中文提示词效果不佳，所以我会先翻译再调用 API

**2️⃣ 吉卜力风格预设**（麦先生最爱 ✨）
- 关键词：说"吉卜力风格"或"宫崎骏风格"
- 自动应用完整风格模板：
  - `Studio Ghibli style, Hayao Miyazaki inspired`
  - `soft watercolor palette, hand-drawn animation aesthetic`
  - `warm sunlight, detailed natural environment`
  - `clear blue sky with fluffy white clouds, vibrant colors`
  - `high-quality, cinematic lighting, 4K, detailed textures`
- 推荐引擎：`midjourney-v6`

**使用示例**（麦先生只需这样说）：
```
"生成吉卜力风格，一位老爷爷和小女孩在森林小屋前喝茶"

→ 我会自动翻译+应用风格模板+生成
```

**📤 生成后自动发送：**
- ✅ 提供在线URL（可直接查看）
- ✅ 提供本地文件路径（`file:///` 格式，点击可打开）
- ✅ Telegram 对话时，直接发送图片文件到手机

### ⚙️ 直接命令行使用：

```bash
# 基础生成（默认使用 stable-diffusion-xl-pro，large 尺寸）
# 图片会自动保存到 /Users/geekmai/AI-Images/
skills/airbrush/airbrush.sh "A beautiful sunset over the ocean"

# 指定引擎和尺寸
skills/airbrush/airbrush.sh \
  --engine midjourney-v6 \
  --size large \
  "A serene Japanese garden with cherry blossoms"

# 使用负面提示词（避免不想要的元素）
skills/airbrush/airbrush.sh \
  --negative "blurry, low quality, cartoon" \
  "A professional headshot photo"

# 完整参数示例
skills/airbrush/airbrush.sh \
  --engine realistic-vision-v2 \
  --size portrait \
  --guidance 12 \
  --negative "cartoon, anime, painting" \
  "Professional business portrait, studio lighting"
```

**可用引擎（ai_engine）：**

| 引擎 | 适用场景 | 推荐度 |
|------|---------|--------|
| `stable-diffusion-xl-pro` | 通用高质量，各种风格 | ⭐⭐⭐⭐⭐ |
| `midjourney-v6` | 艺术创作，细节丰富 | ⭐⭐⭐⭐⭐ |
| `flux` | 新一代高质量模型 | ⭐⭐⭐⭐⭐ |
| `realistic-vision-v2` | 写实照片、人像 | ⭐⭐⭐⭐ |
| `anything-v6` | 二次元、动漫角色 | ⭐⭐⭐⭐ |
| `wifu-diffusion` | 动漫风格 | ⭐⭐⭐ |
| `3d-animation-diffusion` | 3D 动画风格 | ⭐⭐⭐ |
| `analog-diffusion` | 模拟胶片质感 | ⭐⭐⭐ |

**图片尺寸（image_dimensions）：**
- `small` - 小尺寸（快速生成）
- `large` - 大尺寸（⭐ 推荐，性价比高）
- `xlarge` - 超大尺寸（最高质量）
- `portrait` - 竖版（适合人像）
- `landscape` - 横版（适合风景）

**提示词技巧：**

好的提示词 = 主体 + 细节 + 风格 + 光线 + 氛围

```
示例：
"A majestic lion, detailed fur texture, realistic style, 
golden hour lighting, dramatic and powerful atmosphere"
```

**常用修饰词：**
- 质量：`high quality, detailed, sharp, professional, 8k`
- 光线：`soft lighting, golden hour, studio lighting, dramatic light`
- 风格：`realistic, artistic, cinematic, fantasy, photorealistic`
- 氛围：`peaceful, dramatic, mysterious, cheerful, serene`

**负面提示词（--negative）：**
```
blurry, low quality, deformed, cartoon, ugly, 
duplicate, mutated, poorly drawn, watermark
```

**实用场景：**

```bash
# 1. 写实人像照片
skills/airbrush/airbrush.sh \
  --engine realistic-vision-v2 \
  --size portrait \
  --negative "cartoon, anime, painting, blurry" \
  "Professional headshot, business attire, studio lighting, detailed face"

# 2. 艺术风格景观
skills/airbrush/airbrush.sh \
  --engine midjourney-v6 \
  --size landscape \
  "Surreal landscape with floating islands, waterfall, vibrant colors, fantasy art"

# 3. 动漫角色
skills/airbrush/airbrush.sh \
  --engine anything-v6 \
  --size portrait \
  "Anime girl with long blue hair, beautiful detailed eyes, soft lighting"

# 4. 产品设计
skills/airbrush/airbrush.sh \
  --engine stable-diffusion-xl-pro \
  --size large \
  "Minimalist product design, modern smartphone, white background, studio lighting"
```

**输出信息：**
- 生成的图片会自动下载到当前目录
- 文件名格式：`airbrush_YYYYMMDD_HHMMSS.jpg`
- 命令行会显示：
  - 图片 URL
  - 剩余额度
  - 本月调用次数

**技巧：**
- 英文提示词效果通常更好（但中文也支持）
- 使用 `--guidance` 参数控制对提示词的遵循程度（7-15 推荐）
- 生成后的图片 URL 会保留一段时间，可直接访问
- 每次生成消耗 1 点额度
- 可以用 `--help` 查看完整参数说明

**查看帮助：**
```bash
skills/airbrush/airbrush.sh --help
```

**相关文件：**
- 技能文档：`skills/airbrush/SKILL.md`
- 使用说明：`skills/airbrush/README.md`
- 配置文件：`skills/airbrush/skill.json`

---

## 豆瓣电影推荐 🎬

**技能位置**: `skills/douban-movie/`

**数据存储（混合方案）：**
- 📚 **参考库**（JSON）：`skills/douban-movie/data/` - TOP250 和热门数据
- 📝 **用户数据**（Markdown）：`GeekMaiOB/02-生活/电影/` - Obsidian 中的观影记录

**文件说明：**
- `2026.md` / `2027.md` - 按年份分的观影记录
- `想看清单.md` - 想看的电影/剧集
- `可重看清单.md` - 值得反复看的经典

### 🏗️ 系统架构（重要！）

**📺 发现模块 - 我不知道看什么，你帮我推荐**
- 数据来源：豆瓣 TOP250、热门电影/剧集、最新电影/剧集
- 作用：从数据库中推荐电影给麦先生
- 操作：搜索、筛选、推荐

**📝 观影记录模块 - 我知道想看什么，直接记录**
- 💭 想看清单 - 麦先生想看什么，直接记录，**不搜索不验证**
- ✅ 已看清单 - 看完了什么，直接记录
- ⭐ 可重看清单 - 值得反复看的

**关键区别：**
- 发现模块 = 从数据库推荐 → 需要搜索查询
- 观影记录 = 直接记录麦先生说的 → **不需要搜索验证**

### ⚠️ 核心理解（非常重要！）

**发现模块（推荐）：**
- 麦先生："推荐几部科幻片" / "最近有什么新电影？"
- 我的操作：从豆瓣数据库搜索、筛选、推荐
- 特点：需要查询数据库

**观影记录模块（记录）：**
- 麦先生："我想看《爱、死亡与机器人》" / "我看完了《XXX》"
- 我的操作：**直接记录标题**，不搜索，不验证，不查豆瓣
- 特点：简单记录，任何影视作品都可以

**记住：** 观影记录模块就像记笔记，麦先生说什么我就记什么，不需要验证！

### 🎯 麦先生说这些话时，我就知道要做什么

**📺 发现模块 - 推荐热门/最新（优先）：**
- "最近有什么新电影？" → `node movie.js new 5`
- "推荐几部热门电影" → `node movie.js hot 5`
- "最近有什么好看的电视剧？" → `node movie.js hot-tv 5`
- "有什么新剧吗？" → `node movie.js new-tv 5`

**📺 发现模块 - 推荐经典电影（TOP250）：**
- "推荐几部经典电影" → `node movie.js recommend 5`
- "想看科幻片" → `node movie.js recommend --genre 科幻`
- "推荐高分电影" → `node movie.js recommend --rating 9.0`
- "推荐宫崎骏的电影" → `node movie.js recommend --director 宫崎骏`

**📝 观影记录模块 - 想看清单：** ⚠️ **直接记录，不搜索！**
- "我想看《爱、死亡与机器人》" → `node movie.js wish "爱、死亡与机器人" "备注"`
- "我想看XXX" → 直接 `node movie.js wish "XXX"`，**不需要搜索 ID**
- "我的想看清单有什么？" → `node movie.js wishlist`

**📝 观影记录模块 - 观看记录：** ⚠️ **直接记录，不搜索！**
- "我看完了《爱、死亡与机器人》" → `node movie.js watched "爱、死亡与机器人" "备注"`
- "《XXX》值得反复看" → `node movie.js rewatchable <ID>`（仅支持 TOP250）

**📊 统计：**
- "我看了多少 TOP250 电影了" → `node movie.js stats`
- "统计一下观影进度" → `node movie.js stats`

**🔧 维护：**
- 每周五晚上，主动更新热门数据：`node fetch-trending.js`

### 🛠️ 常用命令

```bash
# 工作目录
cd skills/douban-movie

# 【热门和最新 🆕】
# 推荐热门电影
node movie.js hot 5

# 推荐最新电影
node movie.js new 5

# 推荐热门剧集
node movie.js hot-tv 5

# 推荐最新剧集
node movie.js new-tv 5

# 更新热门/最新数据（建议每周更新）
node fetch-trending.js

# 【经典推荐 TOP250】
# 推荐 5 部电影（默认）
node movie.js recommend

# 推荐 10 部电影
node movie.js recommend 10

# 按类型推荐
node movie.js recommend --genre 科幻
node movie.js recommend --genre 剧情
node movie.js recommend --genre 喜剧

# 按评分推荐（高分）
node movie.js recommend --rating 9.0

# 按导演推荐
node movie.js recommend --director 宫崎骏
node movie.js recommend --director 诺兰

# 【搜索】（发现模块用）
# 搜索 TOP250 电影（获取 ID 用于推荐）
node movie.js search 肖申克
node movie.js search 千与千寻

# 【观影记录模块】⚠️ 直接记录，不搜索！
# 想看清单
node movie.js wish "爱、死亡与机器人" "Netflix 科幻剧集"
node movie.js wishlist

# 记录观看（直接用标题）
node movie.js watched "爱、死亡与机器人" "非常震撼"

# 标记可重看（仅限 TOP250 ID）
node movie.js rewatchable 1292052

# 查看统计
node movie.js stats
```

### 📝 工作流程示例

**场景 1：麦先生问最近有什么新电影 🆕**

麦先生: "最近有什么新电影？"

```bash
cd skills/douban-movie
node movie.js new 5
```

然后整理推荐结果，用温暖的语气发给他：
```
麦先生，最近新上的电影推荐：

🎬 《超时空辉夜姬！》🆕 ⭐ 8.5
   https://movie.douban.com/subject/37825206/

🎬 《热带夜晚》🆕 ⭐ 6.6
   https://movie.douban.com/subject/37287455/

...
```

---

**场景 2：麦先生问热门剧集 🆕**

麦先生: "推荐几部热门电视剧"

```bash
cd skills/douban-movie
node movie.js hot-tv 5
```

然后整理推荐结果：
```
麦先生，最近热播的剧集：

📺 《太平年》🆕 更新至18集 ▶️可在线看
   https://movie.douban.com/subject/36317421/

📺 《爱情怎么翻译？》⭐ 8.5
   https://movie.douban.com/subject/36363991/

...
```

---

**场景 3：麦先生想看经典科幻片**

麦先生: "推荐几部经典科幻片"

```bash
cd skills/douban-movie
node movie.js recommend --genre 科幻
```

然后整理推荐结果，用温暖的语气发给他：
```
麦先生，给你推荐 3 部经典科幻片：

🚀 《盗梦空间》⭐ 9.4
   诺兰的烧脑神作，梦境与现实交织
   https://movie.douban.com/subject/3541415/

🤖 《黑客帝国》⭐ 9.1
   "红药丸还是蓝药丸？"
   https://movie.douban.com/subject/1291843/

🌌 《星际穿越》⭐ 9.4
   爱是唯一能穿越时空的东西
   https://movie.douban.com/subject/1889243/
```

---

**场景 4：麦先生想看某部电影 🆕** ⚠️ **直接记录，不搜索！**

麦先生: "我想看《爱、死亡与机器人》"

```bash
cd skills/douban-movie

# ✅ 直接记录，不需要搜索！
node movie.js wish "爱、死亡与机器人" "Netflix 科幻剧集"
```

然后回复：
```
已加入想看清单！《爱、死亡与机器人》是 Netflix 的经典科幻剧集 ✨
记下了，有时间就可以看~
```

**重要：** 不需要搜索豆瓣、不需要验证是否存在，直接记录麦先生说的标题即可！

---

**场景 5：查看想看清单 🆕**

麦先生: "我的想看清单里有什么？"

```bash
cd skills/douban-movie
node movie.js wishlist
```

整理后回复：
```
麦先生的想看清单（2 部）：

1. 🎬 《盗梦空间》⭐ 9.4
   备注：周末看诺兰的烧脑神作
   添加时间：2026/1/30

2. 🎬 《星际穿越》⭐ 9.4
   备注：诺兰的科幻巨作
   添加时间：2026/1/30
```

---

**场景 6：麦先生看完电影** ⚠️ **直接记录，不搜索！**

麦先生: "我看完了《爱、死亡与机器人》，非常震撼"

```bash
cd skills/douban-movie

# ✅ 直接记录观看（会自动从想看清单删除）
node movie.js watched "爱、死亡与机器人" "非常震撼，每集都是精品"
```

然后回复：
```
已记录！《爱、死亡与机器人》确实是神作 ✨
已自动从想看清单移除~
```

**重要：** 不需要搜索 ID，直接用麦先生说的标题记录即可！

---

**场景 7：查询统计**

麦先生: "我看了多少 TOP250 电影了？"

```bash
cd skills/douban-movie
node movie.js stats
```

整理后回复：
```
📊 麦先生的观影统计：

📚 豆瓣 TOP250: 250 部
✅ 已观看: 15 部
⭐ 可重看: 3 部
📝 未观看: 235 部
🎯 观看进度: 6.0%

还有好多经典等着你呢！要不要推荐几部？
```

### 🎨 回复话术参考

**📺 发现模块 - 推荐热门/最新时：**
- "麦先生，最近新上了这几部电影："
- "找到 X 部热门剧集，都在热播中："
- "这部是新片 🆕，评分不错，可以看看！"
- "这部可以在线看 ▶️，很方便！"
- "《XXX》更新至XX集，追剧好时机！"

**📺 发现模块 - 推荐经典时：**
- "麦先生，周末来了！给你推荐几部经典电影放松一下："
- "找到 X 部高分XXX片，都是经典："
- "这几部都是豆瓣 TOP250 的精品，保证不会失望："

**📝 观影记录模块 - 想看清单：** 🆕
- "已加入想看清单！《XXX》确实是经典之作 🎬"
- "好的，《XXX》已记录，周末有时间就可以看了~"
- "你的想看清单里现在有 X 部电影，慢慢看~"
- "《XXX》已自动从想看清单移除（看完了）"

**📝 观影记录模块 - 观看记录：**
- "已记录！《XXX》真的是经典 ✨"
- "好眼光！这部已经加入你的观影记录了~"
- "《XXX》已标记为可重看，以后还可以推荐给你！"

**📊 统计时：**
- "麦先生的观影进度不错，已经看了 X% 的 TOP250！"
- "想看清单里有 X 部电影，要不要先看完这些？"
- "还有好多经典等着你呢！要不要推荐几部？"

### 📋 常见类型

- **剧情** - 经典故事，深度内容
- **喜剧** - 轻松欢乐，适合放松
- **科幻** - 脑洞大开，未来世界
- **动作** - 刺激紧张，肾上腺素
- **爱情** - 浪漫温馨
- **动画** - 适合全家，童心未泯
- **悬疑** - 烧脑推理
- **犯罪** - 黑暗现实
- **战争** - 历史震撼

### 🔧 维护

```bash
# 首次使用或更新数据
cd skills/douban-movie
node fetch-top250.js

# 备份观看记录
cp data/watched.json data/watched.backup.json
cp data/rewatchable.json data/rewatchable.backup.json
```

### 💡 技巧

**📺 发现模块 - 热门和最新优先：**
- 麦先生问"最近""新""热门"时，优先用 `hot`/`new`/`hot-tv`/`new-tv` 命令
- 每周五晚上主动更新一次热门数据：`node fetch-trending.js`
- 推荐热门/最新时，标注 🆕 新片 和 ▶️ 可在线看
- 电视剧要说明集数信息（如"更新至18集"）

**📺 发现模块 - 经典推荐：**
- 推荐时优先未看过的，除非在 rewatchable 列表中
- 推荐时可以加上电影的一句话简介（如果有）
- 定期（如周末）可以主动问问要不要推荐电影

**📝 观影记录模块 - 核心原则：** ⚠️ **直接记录，不搜索不验证！**
- 麦先生说"我想看XXX"时 → **直接用标题记录**，不搜索豆瓣，不验证是否存在
- 麦先生说"我看完了XXX"时 → **直接用标题记录**，自动从想看清单删除
- 可以添加备注记录原因（如"朋友推荐"、"周末看"、"非常精彩"）
- 定期（如周末）可以提醒："想看清单里有 X 部电影，要不要看完再推荐新的？"

**📝 观影记录模块 - 命令格式：**
- `wish "标题" "备注"` - 标题用引号括起来（支持中文、英文、特殊字符）
- `watched "标题" "备注"` - 同上
- `unwish "标题"` - 手动删除
- 如果麦先生说"值得反复看"，标记 rewatchable（仅限 TOP250 ID）

**🔧 数据维护：**
- TOP250 数据：抓取一次即可，很少变化
- 热门/最新数据：建议每周更新一次（周末前）
- trending.json 包含 updatedAt 时间，推荐时可以提醒"数据更新于X天前"
- wishlist/watched/rewatchable 都是 JSON 文件，可以直接编辑

---

## 记账技能（bookkeeping）🧾（Obsidian 存储）

**代码位置**: `skills/bookkeeping/`
**数据位置（Obsidian）**: `GeekMaiOB/02-生活/记账/`
- 月账单：`YYYY-MM.md`
- 待报销：`待报销.md`
- 订阅：`订阅管理.md`
- 备份：`_backup/YYYY-MM-DD/`

### 🧠 需求/规则（不要忘）

三大模块：
1) **记账模块**：记录收入/支出（支出分类先用常用的，后续可增减），按月一个文件。
2) **报销模块**：记录“待报销”项目；麦先生说“整理报销单”就输出纯文字；麦先生说“报销完了”就清空（删除待报销文件）。
3) **订阅模块**：记录订阅；提醒规则：提前 **3 天 / 1 天 / 当天**；续费后更新下次续费日期。

### ⏰ 订阅提醒 cron
- job: `bookkeeping_subscription_reminder_0900`
- 每天 09:00（Asia/Shanghai）检查 `subscribe-check`
- 有提醒才发消息，无提醒不打扰

### 🛠️ 常用命令

```bash
cd /Users/geekmai/clawd/skills/bookkeeping

# 记账
node bookkeeping.js expense 15 餐饮 羊汤牛肉馅饼
node bookkeeping.js income 10000 月薪
node bookkeeping.js stats

# 报销
node bookkeeping.js reimburse 200 办公用品
node bookkeeping.js reimburse-list
node bookkeeping.js reimburse-clear

# 订阅
node bookkeeping.js subscribe "Claude Pro" "20美元/月" 月 2026-02-28
node bookkeeping.js subscribe-renew "Claude Pro" 2026-03-28
node bookkeeping.js subscribe-check

# 备份
node bookkeeping.js backup
```

---

Add whatever helps you do your job. This is your cheat sheet.
