---
name: openclaw-tutorial-writer
description: Draft publishable OpenClaw public tutorial/configuration docs in Markdown and save them into the user’s Obsidian vault. Use when the user asks to write an OpenClaw 教程/公开教程/配置教程, especially when they provide a reference article/link and want a new tutorial based on an existing OpenClaw skill (“XX技能”), with step-by-step, parameter explanations, and AI-agent-friendly structure.
---

# OpenClaw 公开教程撰写（配置类）

## 目标
把“参考教程（可选）+ 现有技能（XX 技能）+ 用户的具体场景”整合成一篇**可公开发布**的 OpenClaw 配置/使用教程，并**落到 Obsidian**。

## 你需要先向用户确认的最少信息（缺什么就问什么；一次最多问 3 个）
1) **教程主题/读者**：给谁看（新手/进阶/团队）？
2) **关联技能（XX 技能）**：
   - 技能名（folder/name）
   - 该技能解决的问题 + 典型触发句（用户会怎么说）
   - 输出/副作用（会写哪些文件、会发消息、会建 cron/提醒吗）
3) **参考来源（可选）**：链接/片段/要点；没有也可以写“从零教程”。

可选再问（若对公开发布有要求）：是否需要脱敏（账号/路径/Token/手机号）。

## 产出要求（强约束）
- **Markdown 可读**：清晰标题层级、列表、代码块；尽量避免大段散文。
- **AI Agent 友好**：每一步都有“目的/动作/预期结果/常见错误”。
- **内容完整**：覆盖必要参数、默认值、示例、验证方式、回滚/排错。
- **可公开**：默认脱敏（把个人邮箱/手机号/token/绝对路径改为占位符）。

## 统一文档结构（直接套模板）
按 `assets/tutorial-template.md` 的结构生成；必要时增删小节，但不要打乱主干。

## 写作流程（按顺序做）
1) **收集输入**：把用户给的信息整理成 10 行以内的“输入摘要”（只在脑内/草稿，不要塞进最终教程）。
2) **读取技能关键信息**（如果仓库内可读）：
   - `skills/<xx>/SKILL.md` 的 frontmatter + 关键步骤
   - 该技能相关的脚本/数据文件（仅提到必要部分，不要复制大段代码）
3) **生成教程正文**：
   - 用模板输出
   - 所有命令/配置给出可复制版本
   - 把“你应该看到什么结果”写清楚
4) **保存到 Obsidian**：
   - 默认目录：`OpenClaw教程/`
   - 文件名：`OpenClaw-<主题>-配置教程.md`（可根据用户偏好调整）
5) **交付**：
   - 回复用户：保存路径 + 1 段很短的“下一步建议”（如：要不要我再写进阶篇/FAQ）。

## Obsidian 落盘规则
- Vault：`GeekMaiOB`
- 路径：`OpenClaw教程/<文件名>.md`
- 若同名文件存在：
  - 默认在文末追加“更新记录”并覆盖正文（由用户决定）；不确定就先新建带日期后缀的文件。

## 脱敏规则（默认开启，强制）
**不要在教程中泄露任何隐私/敏感信息**。涉及以下内容一律使用占位符：
- 邮箱：`<YOUR_EMAIL>`
- chatId/群组 id：`<YOUR_CHAT_ID>`
- token/key/API Key：`<YOUR_TOKEN>` / `<YOUR_API_KEY>`
- appId / apiId / clientId / tenantId 等 ID：`<YOUR_APP_ID>` / `<YOUR_API_ID>` / `<YOUR_CLIENT_ID>` / `<YOUR_TENANT_ID>`
- webhook URL / 回调地址：`<YOUR_WEBHOOK_URL>`
- 本机绝对路径：用 `~/...` 或 `<PATH_TO_...>`
- 真实姓名/手机号/住址：一律不写

## 模板与参考
- 教程模板：`assets/tutorial-template.md`
- 写作检查清单：`references/checklist.md`
