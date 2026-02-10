# Discord 翻译快捷指令

## 概述
为 iPhone/iPad 创建的苹果快捷指令，用于快速翻译 Discord（或其他应用）的英文内容。支持两种模式：剪贴板文字翻译（推荐日常）和截屏视觉翻译（复杂场景）。

## 使用场景
- Discord 英文频道快速翻译
- Telegram 外文消息理解
- 任何需要快速翻译的场景

## 核心功能
1. **剪贴板翻译**：复制文字 → 运行快捷指令 → 看翻译（1-2秒）
2. **截屏翻译**：运行快捷指令 → 自动截屏 → AI识别翻译（适合图文混排）

## 配置要求
- 支持 OpenAI 格式的 API 端点（麦先生用 Alter API）
- API Key
- 模型名称（文字翻译用 gpt-4o-mini，视觉翻译用 gpt-4o）

## 文件结构
```
skills/discord-translator/
├── SKILL.md                    # 本文件
├── README.md                   # 完整使用说明
├── config-template.json        # API 配置模板
├── shortcut-steps-text.md      # 方案1详细步骤
└── shortcut-steps-vision.md    # 方案2详细步骤（待创建）
```

## 快速开始
1. 阅读 `README.md` 了解两种方案
2. 查看 `config-template.json` 准备 API 配置
3. 按照 `shortcut-steps-text.md` 创建快捷指令
4. 测试并优化

## 技巧
- 推荐添加到分享菜单：Discord 内长按消息 → 共享 → 翻译
- 可设置 Siri 短语："翻译这个"
- 可添加到主屏幕作为 App 图标

## 维护记录
- 2026-02-09：初始创建，麦先生要求兼容 Alter API
