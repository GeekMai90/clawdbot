# Airbrush AI 使用示例 🎨

## 已测试成功的示例

### 测试 1：可爱小猫 ✅
```bash
node scripts/airbrush.sh \
  "A cute cat sitting on a cloud, soft lighting, dreamy atmosphere"
```

**结果**：
- 引擎：stable-diffusion-xl-pro
- 尺寸：large
- 效果：非常可爱的小猫，蓝色大眼睛，坐在云朵上，柔和光线
- 耗时：~10 秒
- 消耗：1 点

### 测试 2：日式庭院 ✅
```bash
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  --size large \
  "A serene Japanese garden with cherry blossoms, koi pond, traditional architecture, soft morning light"
```

**结果**：
- 引擎：midjourney-v6
- 尺寸：large
- 效果：艺术感极强的日本庭院，樱花、锦鲤池、传统建筑，晨光柔和
- 耗时：~10 秒
- 消耗：1 点

## 推荐使用场景

### 1. 社交媒体配图

**博客封面**：
```bash
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  --size landscape \
  "Modern tech blog cover, abstract data visualization, blue and purple gradient, futuristic"
```

**小红书/BiliBili 封面**：
```bash
node scripts/airbrush.sh \
  --engine stable-diffusion-xl-pro \
  --size landscape \
  "YouTube thumbnail style, exciting tech review, vibrant colors, dynamic composition"
```

### 2. 产品设计参考

**软件界面灵感**：
```bash
node scripts/airbrush.sh \
  --engine stable-diffusion-xl-pro \
  --size landscape \
  "Modern note-taking app interface, minimalist design, clean UI, soft colors, professional"
```

**Logo 设计草图**：
```bash
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  --size small \
  "Minimalist logo design for AI assistant, modern, friendly, tech style"
```

### 3. 教学素材

**中医相关**：
```bash
node scripts/airbrush.sh \
  --engine realistic-vision-v2 \
  --size portrait \
  "Traditional Chinese medicine herbs, detailed texture, natural lighting, educational style"
```

**技术教程配图**：
```bash
node scripts/airbrush.sh \
  --engine stable-diffusion-xl-pro \
  --size landscape \
  "Developer workspace, dual monitors, clean desk, modern office, soft natural light"
```

### 4. 个人创作

**头像/肖像**：
```bash
node scripts/airbrush.sh \
  --engine realistic-vision-v2 \
  --size portrait \
  --negative "cartoon, anime, painting, blurry" \
  "Professional portrait, friendly expression, studio lighting, detailed face, photorealistic"
```

**艺术作品**：
```bash
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  --size xlarge \
  "Surreal dreamscape, floating islands, waterfall, vibrant sunset, fantasy art, highly detailed"
```

### 5. 家庭纪念

**女儿糖糖相关**：
```bash
node scripts/airbrush.sh \
  --engine anything-v6 \
  --size portrait \
  "Cute little girl with pigtails, happy smile, colorful dress, playing in garden, anime style"
```

**家庭场景**：
```bash
node scripts/airbrush.sh \
  --engine realistic-vision-v2 \
  --size landscape \
  "Cozy family living room, warm lighting, comfortable atmosphere, modern Chinese home"
```

## 不同引擎对比

### 同一提示词，不同引擎效果

**提示词**：`A beautiful mountain landscape at sunset`

```bash
# 写实风格
node scripts/airbrush.sh \
  --engine realistic-vision-v2 \
  "A beautiful mountain landscape at sunset"

# 艺术风格
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  "A beautiful mountain landscape at sunset"

# 通用高质量
node scripts/airbrush.sh \
  --engine stable-diffusion-xl-pro \
  "A beautiful mountain landscape at sunset"

# 新一代模型
node scripts/airbrush.sh \
  --engine flux \
  "A beautiful mountain landscape at sunset"
```

**建议**：
- 照片级写实 → `realistic-vision-v2`
- 艺术创作 → `midjourney-v6`
- 不确定/通用 → `stable-diffusion-xl-pro`
- 追求新技术 → `flux`

## 进阶技巧

### 1. 组合使用参数

```bash
node scripts/airbrush.sh \
  --engine midjourney-v6 \
  --size xlarge \
  --guidance 12 \
  --negative "blurry, low quality, amateur, deformed" \
  "Epic fantasy landscape, dragon flying over castle, dramatic sunset, cinematic lighting, highly detailed, masterpiece"
```

### 2. 批量生成

创建脚本批量生成：
```bash
#!/bin/bash
for style in "watercolor" "oil painting" "digital art" "photorealistic"; do
  node scripts/airbrush.sh \
    "A serene lake scene, $style style"
done
```

### 3. 使用 seed 保持一致性

```bash
# 第一次生成
node scripts/airbrush.sh --seed 12345 "A cute robot"

# 使用相同 seed 和不同提示词生成相似风格
node scripts/airbrush.sh --seed 12345 "A cute spaceship"
```

## 常见问题

### Q: 生成的图片质量不理想？
A: 尝试：
1. 添加更详细的描述
2. 使用负面提示词排除不想要的元素
3. 调整 `--guidance` 参数（推荐 7-15）
4. 更换引擎（midjourney-v6 通常质量更高）

### Q: 提示词应该用中文还是英文？
A: 英文通常效果更好，但中文也支持。建议关键词用英文。

### Q: 额度不够用怎么办？
A: 
1. 每月 500 点自动刷新
2. 优先使用 `small` 尺寸测试
3. 确定提示词后再用 `large` 或 `xlarge` 生成

### Q: 如何下载之前生成的图片？
A: 查看命令行输出的图片 URL，使用 `curl` 或浏览器下载：
```bash
curl -o my_image.jpg "https://dbuzz-assets.s3.amazonaws.com/..."
```

## 更多资源

- 详细文档：`skills/airbrush/SKILL.md`
- 快速参考：`skills/airbrush/README.md`
- 配置说明：`skills/airbrush/skill.json`
- 本地笔记：`TOOLS.md` → Airbrush AI 部分
