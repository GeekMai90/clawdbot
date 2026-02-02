---
name: getnote-kb
description: Use Get笔记知识库 OpenAPI as an external knowledge base for search/recall and Q&A. Trigger on Chinese phrases like “搜Get/查Get/Get里找/去Get笔记搜” (default recall mode) or “问答Get/问答Get笔记/用Get回答” (Q&A mode). Supports returning top-k recalled note snippets, and optionally asking the knowledge base to answer with multi-turn history.
---

# Get 笔记知识库（OpenAPI）技能

## 交互规则（强约束）
- **默认召回模式**：当用户说 **“搜Get / 查Get / Get里找 / 去Get笔记里搜”** 之类表达时，走 **召回**（`/knowledge/search/recall`）。
- **问答模式**：当用户句子里明确出现 **“问答Get / 问答Get笔记 / 用Get回答”**（含“问答”关键词）时，走 **问答**（`/knowledge/search`）。

> 任何情况下：不要在回复里泄露 api-key、topic_id、个人路径等敏感信息；对外展示用占位符。

## 执行流程

### A) 召回模式（默认）
1) 从用户话里提取：`question`、可选 `top_k`（若用户没说默认 5）。
2) 确定 `topic_id/topic_ids`：
   - 如果用户明确指定（例如“搜Get（知识库=自学中医）”），按用户指定映射。
   - 否则使用默认 topic（本机已配置默认：`麦先生说`）。
3) 调用脚本：
   - `python3 skills/getnote-kb/scripts/getnote_kb.py recall --question "..." --top-k 5`
4) 输出给用户：
   - 精简列出 top-k 片段（标题 + 片段摘要 + 分数）
   - 用户如果说“不要总结/只给原文”，就不做二次归纳。

### B) 问答模式
1) 从用户话里提取：`question`、可选 `deep_seek`（默认 true）。
2) 将最近 3–8 轮对话压缩为 `history`（role=user/assistant），避免塞太长。
3) 调用脚本：
   - `python3 skills/getnote-kb/scripts/getnote_kb.py qa --question "..." --deep-seek true`
4) 输出给用户：
   - 先给“结论/答案”
   - 如果返回了引用（refs），再附上“引用片段（可选）”。

## 本地配置（不要写进公开内容）
脚本读取环境变量（推荐）：
- `GETNOTE_API_KEY=<YOUR_API_KEY>`
- `GETNOTE_TOPIC_IDS=<YOUR_TOPIC_IDS>`
  - 多个用英文逗号分隔，例如：`id1,id2,id3`

也支持命令行显式传参（不推荐，容易泄露到 shell history）。

## 示例话术（用户 → 你要做什么）

- 用户：`搜Get：Anteey 灵感` → 召回模式
- 用户：`查Get里我写过的“卡片盒”想法，top 10` → 召回模式 top_k=10
- 用户：`问答Get：我之前为什么想做 Anteey？` → 问答模式（带多轮 history）
- 用户：`问答Get笔记：帮我把“卡片盒笔记法”用一句话讲清楚` → 问答模式

## 失败与兜底
- 如果 API 报错/风控/返回空：
  - 先解释“Get OpenAPI 公测期可能不稳定”，然后建议换问法（更具体关键词/缩短问题）。
  - 或者切回召回模式（更稳）。
- 如果用户没有配置 topic_id：
  - 直接问用户去 Get Web 的“API 设置”里把 topic_id/topic_ids 发我（或截图），再继续。
