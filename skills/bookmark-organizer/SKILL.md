---
name: bookmark-organizer
description: "整理 Obsidian 书签文件（bookmarks.md）：将「99 收集箱」中的书签自动分类、补全 alias 和 tags。触发方式：用户说「整理书签」「整理收集箱」时使用。"
---

# bookmark-organizer

## 文件路径

- **主文件**：`/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB/50-资源资料/书签/bookmarks.md`
- **分类说明**：`...书签/书签系统 · 分类结构（推荐版本）.md`
- **Tag 清单**：`...书签/书签系统 · 核心 Tag 清单.md`
- **Tag 原则**：`...书签/书签系统 · Tag 使用原则（AI 可读规范）.md`

## 书签格式（DataView 内联字段）

```markdown
- name:: 网站名称
  alias:: 简短别名
  url:: https://example.com/
  tags:: 工具, AI, 参考
  saved:: 2026-02-24
```

## 分类结构（12个，按编号）

```
00 常用        - 高频访问
01 项目与工作  - 项目/业务相关
02 学习与课程  - 课程/教程/训练
03 开发与技术  - 代码/文档/开发
04 AI 与自动化 - AI工具/产品
05 内容创作    - 写作/视频/设计工具
06 资源素材    - 图片/字体/音效/模板
07 资讯与阅读  - 新闻/博客/研究
08 效率工具    - 在线小工具
09 社区与平台  - 社区/论坛
10 生活服务    - 购物/地图/娱乐
99 收集箱      - 待整理
```

## 核心 Tag（30个，只能用这30个）

内容类型：工具、课程、文档、文章、视频、社区、资源、平台、项目
领域：AI、编程、设计、效率、写作、商业、产品、数据、运营、教育
用途：学习、参考、资讯、灵感、素材、收藏
技术类：API、自动化、开源、插件、工作流

## 执行流程

```bash
cd /Users/geekmai/clawd

# 1. 查看待整理条目
node skills/bookmark-organizer/scripts/organize.js --list-inbox

# 2. 批量整理（AI 逐条分类 + 补全 alias/tags）
node skills/bookmark-organizer/scripts/organize.js --apply \
  --move "条目名" --to "03 开发与技术" \
  --alias "github.com" --tags "平台, 编程, 开源"

# 3. 查看所有分类
node skills/bookmark-organizer/scripts/organize.js --list-sections
```

## 整理原则

1. **分类优先复用**：能放现有分类就不新建
2. **alias 要有意义**：域名 or 功能描述（2-10字），不要为空
3. **tags 严格限制**：只用30个核心 tag，每条 2-4 个
4. **格式保持一致**：不改动已有字段格式

## 定时任务

每周日 10:00 自动检查收集箱，有内容才整理 + 发 Telegram 汇报。
