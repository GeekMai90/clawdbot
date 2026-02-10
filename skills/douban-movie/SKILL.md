---
name: douban-movie
description: 豆瓣电影推荐系统：智能推荐经典/热门/最新电影和剧集，记录观影历史。使用场景：(1) 从豆瓣 TOP250/热门/最新中推荐电影和剧集 (2) 记录想看清单和观看历史 (3) 标记可重看的经典电影 (4) 统计观影进度
---

# 豆瓣电影推荐系统 🎬

**为麦先生推荐经典电影，记录观看历史，永远不缺好片看！**

**数据存储（混合方案）：**
- 📚 **参考库**（JSON）：`skills/douban-movie/data/` - TOP250 和热门数据
- 📝 **用户数据**（Markdown）：`GeekMaiOB/02-生活/电影/` - Obsidian 中的观影记录

---

## 系统架构

本系统分为两大模块：

### 📺 发现模块 - 我不知道看什么，你帮我推荐
- 数据来源：豆瓣 TOP250、热门/最新电影剧集
- 作用：从数据库中推荐电影
- 操作：搜索、筛选、推荐

### 📝 观影记录模块 - 我知道想看什么，直接记录
- 作用：记录个人的观影计划和历史
- 操作：**直接记录**，不搜索，不验证
- 特点：支持记录任何影视作品（电影/剧集/动画/纪录片等）

**关键区别：**
- 发现 = 从数据库推荐 → 需要查询
- 记录 = 直接记录麦先生说的 → **不需要验证**

---

## 功能特性

### 📺 发现模块

✨ **智能推荐（TOP250 经典）**
- 从豆瓣电影 TOP250 中推荐未看过的电影
- 支持按类型、评分、导演、年份筛选
- 随机推荐，每次都有新发现

🔥 **热门和最新（实时更新）**
- 推荐热门电影和剧集
- 推荐最新上映的电影和剧集
- 自动标记新片 🆕 和可在线播放 ▶️
- 支持电视剧集数信息

🔍 **搜索查询**
- 按标题、导演、演员搜索
- 查看详细信息和豆瓣链接
- 快速找到想看的电影

### 📝 观影记录模块

💭 **想看清单** 🆕
- 记录想看的任何影视作品（**不限于豆瓣数据库**）
- 直接记录标题，不搜索，不验证
- 添加备注和计划
- 看完后自动从清单删除

📝 **观看记录**
- 记录看过的电影和观看时间
- 添加个人备注和评价
- 统计观看进度

⭐ **重看清单**
- 标记"值得反复看"的电影
- 即使看过也可以再次推荐
- 经典永远值得回味

---

## 快速开始

### 1️⃣ 首次使用：抓取数据

```bash
cd skills/douban-movie

# 抓取豆瓣 TOP250（经典电影）
node scripts/fetch-top250.js

# 抓取热门和最新影视（推荐定期更新）
node scripts/fetch-trending.js
```

**建议：**
- TOP250 只需抓取一次（经典清单变化不大）
- 热门/最新数据建议每周更新一次

### 2️⃣ 推荐热门和最新 🔥 🆕

```bash
# 推荐热门电影
node scripts/movie.js hot 10

# 推荐最新电影
node scripts/movie.js new 10

# 推荐热门剧集
node scripts/movie.js hot-tv 10

# 推荐最新剧集
node scripts/movie.js new-tv 10
```

### 3️⃣ 推荐经典电影（TOP250）

```bash
# 推荐 5 部电影（默认）
node scripts/movie.js recommend

# 推荐 10 部电影
node scripts/movie.js recommend 10

# 推荐剧情片
node scripts/movie.js recommend --genre 剧情

# 推荐高分电影（9.0+）
node scripts/movie.js recommend --rating 9.0

# 推荐某位导演的作品
node scripts/movie.js recommend --director 宫崎骏
```

### 4️⃣ 搜索电影

```bash
# 搜索《肖申克的救赎》
node scripts/movie.js search 肖申克

# 搜索导演作品
node scripts/movie.js search 诺兰
```

### 5️⃣ 想看清单 🆕

```bash
# ⚠️ 直接记录标题，不需要搜索 ID
# 添加到想看清单（任何影视作品）
node scripts/movie.js wish "爱、死亡与机器人" "Netflix 科幻剧集"
node scripts/movie.js wish "怪奇物语" "朋友推荐"

# 查看想看清单
node scripts/movie.js wishlist

# 手动删除（不常用，看完后会自动删除）
node scripts/movie.js unwish "爱、死亡与机器人"
```

**重要：** 想看清单支持记录任何影视作品，不限于豆瓣数据库。直接用标题记录即可，不需要搜索 ID。

### 6️⃣ 记录观看

```bash
# 标记已观看（需要电影 ID）
# ✨ 会自动从想看清单中删除
node scripts/movie.js watched 1292052 "非常震撼"

# 标记为可重看（经典必看）
node scripts/movie.js rewatchable 1292052
```

**如何获取电影 ID？**
- 搜索或推荐时会显示电影详情，其中包含豆瓣链接
- ID 就是链接中的数字，如 `https://movie.douban.com/subject/1292052/` → ID 是 `1292052`

### 7️⃣ 查看统计

```bash
node scripts/movie.js stats
```

---

## 使用示例

### 场景 1：想看最新电影 🆕

**麦先生:** "最近有什么新电影？"

**我的操作:**
```bash
cd skills/douban-movie
node scripts/movie.js new 5
```

然后整理推荐结果发给他：
```
麦先生，最近新上的电影推荐：

1. 🎬 《超时空辉夜姬！》🆕 ⭐ 8.5
   https://movie.douban.com/subject/37825206/

2. ...
```

---

### 场景 2：想看热门剧集 🔥

**麦先生:** "推荐几部热门电视剧"

**我的操作:**
```bash
cd skills/douban-movie
node scripts/movie.js hot-tv 5
```

然后整理后发给他：
```
麦先生，最近热播的剧集：

📺 《太平年》🆕 更新至18集 ▶️可在线看
   https://movie.douban.com/subject/36317421/

📺 《爱情怎么翻译？》⭐ 8.5
   https://movie.douban.com/subject/36363991/

...
```

---

### 场景 3：周末想看经典电影

**麦先生:** "推荐几部经典电影"

**我的操作:**
```bash
cd skills/douban-movie
node scripts/movie.js recommend 5
```

然后把推荐结果整理后发给麦先生。

---

### 场景 4：想看科幻片

**麦先生:** "推荐几部科幻片"

**我的操作:**
```bash
node scripts/movie.js recommend --genre 科幻
```

---

### 场景 5：想看电影 🆕

**麦先生:** "我想看《爱、死亡与机器人》"

**我的操作:**
```bash
# ⚠️ 直接记录标题，不需要搜索！
node scripts/movie.js wish "爱、死亡与机器人" "Netflix 科幻剧集"
```

然后回复：
```
已加入想看清单！《爱、死亡与机器人》是 Netflix 的经典科幻剧集 ✨
记下了，有时间就可以看~
```

**重要：** 不需要搜索豆瓣、不需要获取 ID，直接用麦先生说的标题记录即可！

---

### 场景 6：查看想看清单 🆕

**麦先生:** "我的想看清单里有什么？"

**我的操作:**
```bash
node scripts/movie.js wishlist
```

然后整理后回复：
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

### 场景 7：看完电影

**麦先生:** "我看完了《爱、死亡与机器人》，非常精彩"

**我的操作:**
```bash
# ⚠️ 直接记录标题，会自动从想看清单删除
node scripts/movie.js watched "爱、死亡与机器人" "非常精彩，每集都是精品"
```

然后回复：
```
已记录！《爱、死亡与机器人》确实是神作 ✨
已自动从想看清单移除~
```

**重要：** 不需要搜索 ID，直接用标题记录即可！

---

### 场景 8：查询统计

**麦先生:** "我看了多少部 TOP250 的电影了？"

**我的操作:**
```bash
node scripts/movie.js stats
```

---

## 数据文件

所有数据存储在 `data/` 目录：

```
data/
├── movies.json         # 📺 豆瓣 TOP250 完整数据（发现模块）
├── trending.json       # 📺 热门和最新影视数据（发现模块）
├── wishlist.json       # 📝 想看清单（观影记录模块）🆕
├── watched.json        # 📝 已看清单（观影记录模块）
└── rewatchable.json    # 📝 可重看清单（观影记录模块）
```

### movies.json 结构

```json
{
  "id": "1292052",
  "rank": 1,
  "title": "肖申克的救赎",
  "other": "/ The Shawshank Redemption",
  "director": "弗兰克·德拉邦特",
  "actors": ["蒂姆·罗宾斯", "摩根·弗里曼"],
  "year": 1994,
  "country": "美国",
  "genres": ["剧情", "犯罪"],
  "rating": 9.7,
  "people": 3155654,
  "quote": "希望让人自由。",
  "link": "https://movie.douban.com/subject/1292052/"
}
```

### wishlist.json 结构 🆕

```json
{
  "id": "3541415",
  "title": "盗梦空间",
  "rating": 9.4,
  "addedAt": "2026-01-30T08:00:00.000Z",
  "note": "周末想看诺兰的烧脑神作"
}
```

### watched.json 结构

```json
{
  "id": "1292052",
  "title": "肖申克的救赎",
  "rating": 9.7,
  "watchedAt": "2026-01-30T08:00:00.000Z",
  "note": "非常震撼"
}
```

### rewatchable.json 结构

```json
["1292052", "1291546", "1292720"]
```

### trending.json 结构 🆕

```json
{
  "updatedAt": "2026-01-30T07:24:24.801Z",
  "data": {
    "movie_热门": [...],
    "movie_最新": [...],
    "tv_热门": [...],
    "tv_最新": [...]
  }
}
```

每部影视作品包含：
```json
{
  "id": "37825206",
  "title": "超时空辉夜姬！",
  "rating": "8.5",
  "cover": "https://...",
  "url": "https://movie.douban.com/subject/37825206/",
  "isNew": true,
  "playable": false,
  "episodes": "更新至18集"
}
```

---

## 命令速查

### 📺 发现模块

**热门和最新：**

| 命令 | 说明 | 示例 |
|------|------|------|
| `hot [count]` | 推荐热门电影 | `hot 10` |
| `new [count]` | 推荐最新电影 | `new 10` |
| `hot-tv [count]` | 推荐热门剧集 | `hot-tv 10` |
| `new-tv [count]` | 推荐最新剧集 | `new-tv 10` |

**经典推荐（TOP250）：**

| 命令 | 说明 | 示例 |
|------|------|------|
| `recommend [count]` | 推荐电影 | `recommend 10` |
| `recommend --genre` | 按类型推荐 | `recommend --genre 科幻` |
| `recommend --rating` | 按评分推荐 | `recommend --rating 9.0` |
| `recommend --director` | 按导演推荐 | `recommend --director 宫崎骏` |

**搜索：**

| 命令 | 说明 | 示例 |
|------|------|------|
| `search <关键词>` | 搜索电影 | `search 肖申克` |
| `movie <ID>` | 查看详情 | `movie 1292052` |

### 📝 观影记录模块

**想看清单：** 🆕 ⚠️ 直接记录，不需要搜索！

| 命令 | 说明 | 示例 |
|------|------|------|
| `wish "标题" [备注]` | 添加到想看清单（任何影视作品） | `wish "爱、死亡与机器人" Netflix剧` |
| `wishlist` | 查看想看清单 | `wishlist` |
| `unwish "标题"` | 从想看清单删除 | `unwish "爱、死亡与机器人"` |

**观看记录：** ⚠️ 直接记录，不需要搜索！

| 命令 | 说明 | 示例 |
|------|------|------|
| `watched "标题" [备注]` | 记录观看（自动从想看清单删除） | `watched "爱、死亡与机器人" 很棒` |
| `rewatchable <ID>` | 标记可重看（仅限TOP250） | `rewatchable 1292052` |

**统计：**

| 命令 | 说明 | 示例 |
|------|------|------|
| `stats` | 查看统计信息 | `stats` |

---

## 推荐策略

### 推荐逻辑
1. 优先推荐**未看过**的电影
2. 如果在**重看清单**中，即使看过也可以推荐
3. 按筛选条件（类型、评分、导演等）过滤
4. 随机打乱顺序，避免总是推荐排名靠前的

### 常见类型
- 剧情、喜剧、爱情、科幻、动作
- 犯罪、惊悚、悬疑、奇幻、冒险
- 动画、家庭、传记、历史、战争

### 推荐技巧
- **周末放松**: `--genre 喜剧`
- **深度观影**: `--genre 剧情 --rating 9.0`
- **带孩子看**: `--genre 动画`
- **科幻迷**: `--genre 科幻`
- **大师作品**: `--director 克里斯托弗·诺兰`

---

## 维护

### 更新热门/最新数据 🆕

热门和最新影视每天都在变化，建议定期更新：

```bash
cd skills/douban-movie
node scripts/fetch-trending.js
```

**建议频率：**
- 每周更新一次（周末前更新，方便推荐）
- 或者在麦先生问"最近有什么新片"时现场更新

**注意**: trending.json 会被覆盖，但不会影响观看记录。

### 更新 TOP250 数据

豆瓣 TOP250 偶尔会有变化，可以重新抓取：

```bash
cd skills/douban-movie
node scripts/fetch-top250.js
```

**注意**: 这会覆盖 `movies.json`，但不会影响观看记录。TOP250 变化不大，不需要频繁更新。

### 备份数据

```bash
# 备份观看记录
cp data/watched.json data/watched.backup.json
cp data/rewatchable.json data/rewatchable.backup.json

# 或者整个 data 目录
cp -r data data.backup
```

---

## 常见问题

### Q: 推荐的电影太少怎么办？
A: 可能是筛选条件太严格，或者已经看过大部分电影了。试试放宽条件，或者查看统计 `node scripts/movie.js stats`。

### Q: 如何取消"已观看"标记？
A: 直接编辑 `data/watched.json`，删除对应的记录。

### Q: 电影 ID 在哪里？
A: 推荐或搜索时会显示豆瓣链接，ID 就是链接中的数字。也可以直接在豆瓣网站上复制链接。

### Q: 可以添加 TOP250 之外的电影吗？
A: 当前版本只支持 TOP250。如果需要，可以手动编辑 `movies.json` 添加电影数据。

---

## 使用提示（给灵瑶自己看 😊）

### 推荐电影时的话术

**周末推荐：**
```
麦先生，周末来了！给你推荐几部经典电影放松一下：

1. 《肖申克的救赎》⭐ 9.7
   希望让人自由。
   https://movie.douban.com/subject/1292052/

2. ...
```

**按需推荐：**
```
找到 3 部高分科幻片：

🚀 《盗梦空间》⭐ 9.4
   诺兰的烧脑神作
   
🤖 《黑客帝国》⭐ 9.1
   ...
```

### 记录观看时

麦先生说"我看完了《XXX》"时：
1. 先搜索: `node scripts/movie.js search XXX`
2. 找到 ID
3. 记录: `node scripts/movie.js watched <ID> "麦先生的评价"`

如果说"值得反复看"：
4. 标记: `node scripts/movie.js rewatchable <ID>`

### 定期主动推荐（可选）

在 heartbeat 时，如果距离上次推荐超过一周，可以主动问问：
- "麦先生，好久没推荐电影了，需要我推荐几部吗？"
- "周末到了，要不要看部经典电影？"

---

## 技术细节

### 依赖
- Node.js >= 14（使用原生 https 和 fs 模块，无外部依赖）

### 数据来源
- 豆瓣电影 TOP250: https://movie.douban.com/top250

### 限制
- 抓取时每页间隔 1 秒，避免请求过快
- 数据为静态快照，不会实时更新（除非手动重新抓取）

---

## 数据文件说明

### 📚 参考库数据（JSON，保持不变）

存储位置：`skills/douban-movie/data/`

- **movies.json** (86KB) - 豆瓣 TOP250 电影数据  
  格式：`[{id, title, rating, genres, director, actors, year, link, ...}]`

- **trending.json** (50KB) - 热门和最新影视数据  
  格式：`{data: {movie_热门: [], movie_最新: [], tv_热门: [], tv_最新: []}, updatedAt: ...}`

### 📝 用户数据（Markdown，存储在 Obsidian）

存储位置：`GeekMaiOB/02-生活/电影/`

**1️⃣ 观影记录（按年分文件）**

文件：`2026.md`、`2027.md` ...

```markdown
# 2026 年观影记录

## 1月
### 2026-01-30 | 肖申克的救赎 ⭐ 9.7
- 豆瓣ID：1292052
- 备注：经典之作，非常震撼
- 豆瓣：https://movie.douban.com/subject/1292052/

### 2026-01-30 | 爱、死亡与机器人
- 备注：Netflix 科幻剧集，非常震撼
```

**2️⃣ 想看清单**

文件：`想看清单.md`

```markdown
# 想看清单

## 2026-01-30
- 📺 怪奇物语 ⭐ 9.0
  - 豆瓣ID：26654184
  - 备注：朋友推荐
  - 豆瓣：https://movie.douban.com/subject/26654184/

- 📺 爱、死亡与机器人
  - 备注：Netflix 经典科幻动画剧集
```

**3️⃣ 可重看清单**

文件：`可重看清单.md`

```markdown
# 可重看清单

- 肖申克的救赎 (1292052) ⭐ 9.7
- 盗梦空间 (3541415) ⭐ 9.4
```

### 🔄 迁移说明

如果从旧版本（纯 JSON）迁移：

```bash
cd skills/douban-movie
node migrate-to-obsidian.js
```

迁移完成后，原 JSON 文件会保留在 `data/` 目录（可备份后删除 watched.json / wishlist.json / rewatchable.json）。

---

🎬 **让麦先生永远不缺好电影看！**
