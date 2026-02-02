# Clawdbot 机器人头像设置教程

## 前置准备

1. **GitHub 账号**
2. **Git 客户端**（或直接在 GitHub 网页操作）

## 步骤一：将头像图片上传到 GitHub

### 方法 A：通过网页上传（推荐）

1. 打开 Clawdbot 仓库：https://github.com/GeekMai90/clawdbot
2. 进入 `avatars/` 文件夹
3. 点击 **Add file** → **Upload files**
4. 将你的头像图片拖拽上传（如 `lingyao.png`）
5. 填写 commit 信息，如 "添加机器人头像"
6. 点击 **Commit changes**

### 方法 B：通过 Git 命令行

```bash
# 克隆仓库（如果还没克隆）
git clone https://github.com/GeekMai90/clawdbot.git
cd clawdbot

# 将图片放入 avatars/ 文件夹
cp /path/to/your/avatar.png avatars/your-name.png

# 提交并推送
git add avatars/your-name.png
git commit -m "添加机器人头像"
git push
```

## 步骤二：获取图片的 Raw 链接

上传成功后，图片的访问链接格式为：

```
https://raw.githubusercontent.com/GeekMai90/clawdbot/main/avatars/图片文件名.png
```

**示例：**
```
https://raw.githubusercontent.com/GeekMai90/clawdbot/main/avatars/lingyao.png
```

> ⚠️ 注意：不要使用 GitHub 的 blob 页面链接（如 `github.com/.../blob/main/...`），那是 HTML 页面，不是图片本身。

## 步骤三：修改 IDENTITY.md

在 Clawdbot 工作目录找到 `IDENTITY.md` 文件，修改头像路径：

```markdown
## IDENTITY.md - Who Am I?

- **Name:** 灵瑶
- **Avatar:** `avatars/lingyao.png`
```

**对于 Web 端**，直接将 `avatars/lingyao.png` 替换为完整的 Raw 链接：

```markdown
- **Avatar:** `https://raw.githubusercontent.com/GeekMai90/clawdbot/main/avatars/lingyao.png`
```

## 验证

重启 Clawdbot 后，Web 端应该能正常显示头像了！

## 常见问题

**Q: 头像还是显示不出来？**
A: 检查链接是否是 `raw.githubusercontent.com` 开头的，而不是 `github.com` 开头的。

**Q: 图片格式有什么要求？**
A: 建议使用 PNG 或 JPG，大小控制在 1MB 以内，正方形比例最佳。

---

*创建时间：2026-01-28*
