# Discord 翻译快捷指令

## 📋 方案1：剪贴板文字翻译（推荐）

### 快捷指令步骤

1. **获取剪贴板**
   - 添加操作：`获取剪贴板`

2. **调用 API 翻译**
   - 添加操作：`获取 URL 的内容`
   - 方法：`POST`
   - URL：`{API_ENDPOINT}` （👈 填你的 Alter API 端点）
   - 请求头（Headers）：
     ```
     Content-Type: application/json
     Authorization: Bearer {YOUR_API_KEY}
     ```
   - 请求体（Request Body - JSON）：
     ```json
     {
       "model": "{MODEL_NAME}",
       "messages": [
         {
           "role": "system",
           "content": "你是专业的翻译助手，将英文准确翻译成中文，保持原文语气和格式。"
         },
         {
           "role": "user",
           "content": "请翻译以下内容：\n\n剪贴板"
         }
       ],
       "temperature": 0.3,
       "max_tokens": 2000
     }
     ```
   - ⚠️ 注意：`"content"` 中的 `剪贴板` 需要用快捷指令的变量替换（选择上一步的"剪贴板"变量）

3. **解析响应**
   - 添加操作：`从输入中获取`
   - 类型：`字典值`
   - 键路径：`choices[0].message.content`
   - （这会提取 OpenAI 格式返回的翻译结果）

4. **显示结果**
   - 添加操作：`显示通知` 或 `显示结果`
   - 标题：Discord 翻译
   - 正文：选择上一步的结果

---

## 📸 方案2：截屏视觉翻译

### 快捷指令步骤

1. **截取屏幕**
   - 添加操作：`截屏`（会弹出截屏工具）

2. **转换图片为 Base64**
   - 添加操作：`对图像进行编码`
   - 格式：`Base64`

3. **调用 Vision API**
   - 添加操作：`获取 URL 的内容`
   - 方法：`POST`
   - URL：`{API_ENDPOINT}` （👈 同上）
   - 请求头：
     ```
     Content-Type: application/json
     Authorization: Bearer {YOUR_API_KEY}
     ```
   - 请求体：
     ```json
     {
       "model": "{VISION_MODEL_NAME}",
       "messages": [
         {
           "role": "user",
           "content": [
             {
               "type": "text",
               "text": "这是 Discord 的截图，请翻译所有英文内容为中文，保持对话格式和结构。"
             },
             {
               "type": "image_url",
               "image_url": {
                 "url": "data:image/png;base64,编码后的图像"
               }
             }
           ]
         }
       ],
       "max_tokens": 3000
     }
     ```
   - ⚠️ `"url"` 中的 `编码后的图像` 替换为第2步的 Base64 结果

4. **解析并显示**
   - 同方案1的步骤 3-4

---

## 🔧 配置参数（明天填写）

### 方案1（文字翻译）
```
API_ENDPOINT = _______________（如：https://api.alter.com/v1/chat/completions）
MODEL_NAME = _______________（如：gpt-4o-mini）
YOUR_API_KEY = _______________
```

### 方案2（视觉翻译）
```
API_ENDPOINT = _______________（同上）
VISION_MODEL_NAME = _______________（如：gpt-4o、claude-3-5-sonnet-20241022）
YOUR_API_KEY = _______________（同上）
```

---

## 💡 使用技巧

### 方案1进阶：添加到分享菜单
1. 在快捷指令设置中，打开"在共享表单中显示"
2. 接受类型：`文本`
3. 这样在 Discord 里可以：长按文字 → 共享 → 选择"翻译"快捷指令

### 设置 Siri 语音触发
1. 编辑快捷指令 → 点击右上角 `···`
2. 添加到主屏幕 / 设置 Siri 短语（如："翻译这个"）

### 优化响应速度
- `temperature` 设为 `0.3`（更稳定）
- `max_tokens` 根据需要调整（一般 2000 够用）

---

## 🎯 推荐配置

**日常使用**：方案1（快 + 省钱）
- 绝大多数 Discord 文字聊天场景
- 1-2秒响应
- Token 消耗少

**复杂场景**：方案2（准确 + 全面）
- 图文混排
- 长对话截图
- 表情包带字
- 需要视觉模型（稍贵）

---

## 📦 文件说明

- `README.md` - 本文档（配置说明）
- `config-template.json` - API 配置模板
- `shortcut-steps-text.md` - 方案1详细步骤截图说明
- `shortcut-steps-vision.md` - 方案2详细步骤截图说明

---

**创建日期**：2026-02-09  
**适用场景**：Discord / Telegram / 任何英文应用翻译
