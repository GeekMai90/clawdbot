#!/usr/bin/env node

/**
 * 批量创建 Vibe Coding 课程教案页面
 */

const fs = require('fs');
const https = require('https');

// Notion API 配置
const NOTION_KEY = fs.readFileSync('/Users/maimai/.config/notion/api_key', 'utf-8').trim();
const PARENT_PAGE_ID = '2f8b4958-904e-81a9-91ba-e2f873ce6608';
const COURSE_TITLE = 'Vibe Coding 零基础入门课程';

// Notion API 请求函数
function notionRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 添加内容块到页面
async function addBlocksToPage(pageId, children) {
  return notionRequest(`/v1/blocks/${pageId}/children`, 'PATCH', { children });
}

// 创建页面
async function createPage(title, parentId = PARENT_PAGE_ID) {
  const response = await notionRequest('/v1/pages', 'POST', {
    parent: { page_id: parentId },
    properties: {
      title: {
        title: [{ text: { content: title } }]
      }
    }
  });
  return response;
}

// 教案数据 - Day 2-30
const lessons = {
  'Day 2: 工具准备': {
    duration: '60-90 分钟',
    difficulty: '⭐ 简单',
    goal: '安装 Cursor，注册 GitHub，创建第一个项目文件夹',
    sections: [
      {
        title: '📖 第一部分：理论讲解（15 分钟）',
        content: [
          { type: 'heading_3', text: '1. Cursor 是什么？' },
          { type: 'paragraph', text: 'Cursor 是一个专为 AI 编程设计的编辑器，比普通代码编辑器更聪明。它内置了 AI 助手，可以直接帮你写代码、解释代码、修改代码。' },
          { type: 'paragraph', text: '和 ChatGPT 的区别：ChatGPT 是通用 AI，Cursor 是专门为编程优化的 AI，更懂代码！' },
          { type: 'heading_3', text: '2. GitHub 是什么？' },
          { type: 'paragraph', text: 'GitHub 是程序员的"朋友圈"和"云硬盘"。你可以：' },
          { type: 'bulleted_list_item', text: '保存代码（不怕丢失）' },
          { type: 'bulleted_list_item', text: '分享作品给朋友' },
          { type: 'bulleted_list_item', text: '看到别人的开源项目' },
          { type: 'bulleted_list_item', text: '用别人的代码（合法合规）' },
          { type: 'callout', text: '💡 简单理解：GitHub = 代码的云端备份 + 社交平台' }
        ]
      },
      {
        title: '🚀 第二部分：实战环节（45 分钟）',
        content: [
          { type: 'heading_3', text: '步骤 1：下载和安装 Cursor' },
          { type: 'numbered_list_item', text: '访问：https://cursor.sh' },
          { type: 'numbered_list_item', text: '点击"Download for Free"' },
          { type: 'numbered_list_item', text: '下载后打开安装（和安装微信一样简单）' },
          { type: 'numbered_list_item', text: '打开 Cursor，注册账号（可以用 Google/GitHub 账号）' },
          { type: 'callout', text: '💡 提示：Cursor 有 Pro 版（收费），但免费版足够学习使用！' },
          { type: 'heading_3', text: '步骤 2：注册 GitHub 账号' },
          { type: 'numbered_list_item', text: '访问：https://github.com' },
          { type: 'numbered_list_item', text: '点击"Sign up"' },
          { type: 'numbered_list_item', text: '填写：邮箱、密码、用户名（用户名会公开，选个好听的！）' },
          { type: 'numbered_list_item', text: '验证邮箱（去邮箱点击验证链接）' },
          { type: 'numbered_list_item', text: '完成！' },
          { type: 'callout', text: '🎉 GitHub 账号是程序员的"身份证"，一定要记好用户名和密码！' },
          { type: 'heading_3', text: '步骤 3：创建项目文件夹' },
          { type: 'paragraph', text: '在电脑合适的位置创建一个文件夹，比如：' },
          { type: 'code', text: '我的文档/VibeCoding/01-hello-web' },
          { type: 'paragraph', text: '这就是你的第一个编程项目！' },
          { type: 'heading_3', text: '步骤 4：用 Cursor 打开项目' },
          { type: 'numbered_list_item', text: '打开 Cursor' },
          { type: 'numbered_list_item', text: '点击"Open Folder"' },
          { type: 'numbered_list_item', text: '选择刚创建的文件夹' },
          { type: 'numbered_list_item', text: '项目打开了！现在可以开始编程了！' },
          { type: 'heading_3', text: '步骤 5：创建第一个文件' },
          { type: 'numbered_list_item', text: '在左侧文件列表上右键' },
          { type: 'numbered_list_item', text: '选择"New File"' },
          { type: 'numbered_list_item', text: '文件名输入：index.html' },
          { type: 'numbered_list_item', text: '文件创建成功！' },
          { type: 'heading_3', text: '步骤 6：让 AI 帮你写代码' },
          { type: 'paragraph', text: '按快捷键：Ctrl+K（Windows）或 Cmd+K（Mac）' },
          { type: 'paragraph', text: '在输入框中输入：' },
          { type: 'code', text: '创建一个简单的网页，粉色背景，标题写"我的第一个项目"' },
          { type: 'paragraph', text: 'AI 会立刻生成代码！按 Tab 键接受建议。' },
          { type: 'callout', text: '🎉 恭喜！你已经在 Cursor 中用 AI 写出第一个网页了！' }
        ]
      },
      {
        title: '❓ 常见问题解答',
        content: [
          { type: 'toggle', question: 'Q: Cursor 和 VS Code 有什么区别？', answer: 'A: Cursor 基于 VS Code，但内置了更强的 AI 功能。如果你之前用 VS Code，Cursor 更容易上手。' },
          { type: 'toggle', question: 'Q: GitHub 为什么要验证邮箱？', answer: 'A: 这是 GitHub 的安全机制。验证邮箱后才能正常使用所有功能。' },
          { type: 'toggle', question: 'Q: 我忘了 GitHub 密码怎么办？', answer: 'A: 在 GitHub 登录页点击"Forgot password"，用邮箱重置。' },
          { type: 'toggle', question: 'Q: Cursor 免费版够用吗？', answer: 'A: 够用！免费版每月有一定数量的 AI 请求，足够学习使用。如果不够可以升级 Pro。' }
        ]
      },
      {
        title: '📝 今日总结',
        content: [
          { type: 'paragraph', text: '✅ 学会了安装 Cursor' },
          { type: 'paragraph', text: '✅ 学会了注册 GitHub 账号' },
          { type: 'paragraph', text: '✅ 创建了第一个项目文件夹' },
          { type: 'paragraph', text: '✅ 用 Cursor + AI 写了第一个网页' }
        ]
      },
      {
        title: '🏠 课后作业',
        content: [
          { type: 'numbered_list_item', text: '（必做）在 Cursor 中创建 3 个新文件：index.html、style.css、script.js' },
          { type: 'numbered_list_item', text: '（必做）用 Ctrl+K 让 AI 帮你写一个自我介绍页面' },
          { type: 'numbered_list_item', text: '（选做）在 GitHub 上完善个人资料（头像、简介）' },
          { type: 'numbered_list_item', text: '（进阶）把今天的网页改成你喜欢的颜色和样式' }
        ]
      },
      {
        title: '🔮 下节预告：Day 3 - 如何与 AI 对话',
        content: [
          { type: 'paragraph', text: '明天我们会：' },
          { type: 'bulleted_list_item', text: '学习好的提示词怎么写' },
          { type: 'bulleted_list_item', text: '学会如何向 AI 提问' },
          { type: 'bulleted_list_item', text: '做出一个计数器网页' },
          { type: 'bulleted_list_item', text: '学会调试代码错误' },
          { type: 'callout', text: '💪 加油！你已经掌握了工具，明天学习"心法"！' }
        ]
      }
    ]
  },

  'Day 3: 如何与 AI 对话': {
    duration: '60-90 分钟',
    difficulty: '⭐⭐ 入门',
    goal: '学会写好提示词，掌握提问技巧，能让 AI 帮你做出计数器',
    sections: [
      {
        title: '📖 第一部分：理论讲解（20 分钟）',
        content: [
          { type: 'heading_3', text: '1. 什么是好的提示词？' },
          { type: 'paragraph', text: '提示词（Prompt）就是你给 AI 的指令。好提示词 = 具体 + 清晰 + 有上下文' },
          { type: 'heading_3', text: '2. 好提示词 vs 坏提示词' },
          { type: 'paragraph', text: '❌ 坏例子："做一个网页"' },
          { type: 'paragraph', text: '   问题：太模糊！AI 不知道做什么样的网页' },
          { type: 'paragraph', text: '' },
          { type: 'paragraph', text: '✅ 好例子："做一个网页，粉色渐变背景，中间有个大标题'计时器'，下面有个按钮显示'开始'，点击后数字会变化"' },
          { type: 'paragraph', text: '   优点：具体！AI 知道要做什么' },
          { type: 'callout', text: '💡 记住：AI 是你的助手，不是你肚子里的蛔虫！你要清楚告诉它你要什么！' },
          { type: 'heading_3', text: '3. 提问的四个原则' },
          { type: 'bulleted_list_item', text: '具体：不要说"好看"，要说"粉色背景、白色文字"' },
          { type: 'bulleted_list_item', text: '分步：一次做一件事，不要一次让 AI 做 10 件事' },
          { type: 'bulleted_list_item', text: '有上下文：告诉 AI 你想做什么用' },
          { type: 'bulleted_list_item', text: '检查：AI 做完要检查，不满意就让 AI 改' }
        ]
      },
      {
        title: '🚀 第二部分：实战环节（45 分钟）',
        content: [
          { type: 'heading_3', text: '项目：计数器网页' },
          { type: 'paragraph', text: '我们要做一个网页，上面显示一个数字，有"+"和"-"按钮，可以增加或减少数字。' },
          { type: 'heading_3', text: '步骤 1：打开 Cursor，创建文件' },
          { type: 'numbered_list_item', text: '打开 Cursor' },
          { type: 'numbered_list_item', text: '打开 Day 2 创建的项目文件夹' },
          { type: 'numbered_list_item', text: '在 index.html 中输入：html' },
          { type: 'numbered_list_item', text: '按 Tab 键接受建议，自动生成 HTML 模板' },
          { type: 'heading_3', text: '步骤 2：让 AI 帮你写计数器' },
          { type: 'paragraph', text: '按 Ctrl+K，输入：' },
          { type: 'code', text: '创建一个计数器网页，\n要求：\n1. 显示数字 0\n2. 有 "+" 按钮，点击数字 +1\n3. 有 "-" 按钮，点击数字 -1\n4. 有 "重置" 按钮，点击数字变回 0\n5. 粉色渐变背景\n6. 居中显示' },
          { type: 'numbered_list_item', text: 'AI 会生成代码' },
          { type: 'numbered_list_item', text: '按 Tab 接受建议' },
          { type: 'numbered_list_item', text: '看预览效果！' },
          { type: 'callout', text: '💡 如果效果不满意，可以继续按 Ctrl+K 提要求修改！' },
          { type: 'heading_3', text: '步骤 3：尝试修改（练习提问）' },
          { type: 'paragraph', text: '试着向 AI 提这些要求：' },
          { type: 'code', text: '把背景改成蓝色渐变' },
          { type: 'code', text: '把数字变大，变成 48px' },
          { type: 'code', text: '把按钮变成圆角' },
          { type: 'code', text: '给按钮加个hover效果' },
          { type: 'callout', text: '🎉 每一次提问都是练习！不要怕问错，AI 不会嘲笑你！' },
          { type: 'heading_3', text: '步骤 4：保存文件' },
          { type: 'paragraph', text: '按 Ctrl+S（Windows）或 Cmd+S（Mac）保存文件。' }
        ]
      },
      {
        title: '❓ 常见问题解答',
        content: [
          { type: 'toggle', question: 'Q: AI 给的代码有问题怎么办？', answer: 'A: 直接告诉 AI 哪里有问题！比如："有个 bug，数字会是负数，加个判断不能小于 0"。' },
          { type: 'toggle', question: 'Q: 我不知道该怎么描述需求？', answer: 'A: 试着把自己当成"产品经理"，想清楚要什么功能、什么样式。描述不出来就截图给 AI 看！' },
          { type: 'toggle', question: 'Q: AI 生成的代码看不懂怎么办？', answer: 'A: 选中代码，按 Ctrl+K，输入："解释这段代码"。AI 会一行一行解释给你听！' }
        ]
      },
      {
        title: '📝 今日总结',
        content: [
          { type: 'paragraph', text: '✅ 学会了什么是好的提示词' },
          { type: 'paragraph', text: '✅ 学会了提问的四个原则' },
          { type: 'paragraph', text: '✅ 做出了计数器网页' },
          { type: 'paragraph', text: '✅ 通过修改练习了与 AI 对话' }
        ]
      },
      {
        title: '🏠 课后作业',
        content: [
          { type: 'numbered_list_item', text: '（必做）修改计数器，至少改 3 个地方' },
          { type: 'numbered_list_item', text: '（必做）把计数器改成"倒计时"（从 10 开始减）' },
          { type: 'numbered_list_item', text: '（选做）尝试做一个"体重记录器"（不用写，先想清楚要什么功能）' }
        ]
      },
      {
        title: '🔮 下节预告：Day 4 - HTML 基础',
        content: [
          { type: 'paragraph', text: '明天我们会学习：' },
          { type: 'bulleted_list_item', text: 'HTML 是什么？（网页的骨架）' },
          { type: 'bulleted_list_item', text: '最常用的 10 个 HTML 标签' },
          { type: 'bulleted_list_item', text: '如何看懂 HTML 结构' },
          { type: 'bulleted_list_item', text: '做一个人个人介绍页面' },
          { type: 'callout', text: '💪 基础很重要！学会了 HTML，你就能自己看懂 AI 给的代码了！' }
        ]
      }
    ]
  },

  // Day 4-30 的教案数据太大了，这里先提供框架，实际执行时动态生成
};

// 由于内容太长，我们分批创建
async function main() {
  console.log('🚀 开始创建课程教案页面...\n');

  // 先创建 Day 2 和 Day 3
  const daysToCreate = ['Day 2: 工具准备', 'Day 3: 如何与 AI 对话'];

  for (const title of daysToCreate) {
    console.log(`📄 创建页面: ${title}`);
    try {
      const page = await createPage(title);
      console.log(`   ✅ 页面创建成功: ${page.id}`);

      // 添加内容
      const lesson = lessons[title];
      if (lesson) {
        let children = [];

        // 添加课程信息
        children.push({
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: `课程目标：${lesson.goal}` } }],
            icon: { type: 'emoji', emoji: '🎯' }
          }
        });

        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: `预计时长：${lesson.duration}` } }] }
        });

        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: `难度：${lesson.difficulty}` } }] }
        });

        children.push({ object: 'block', type: 'divider', divider: {} });

        // 添加各个部分
        for (const section of lesson.sections) {
          // 标题
          children.push({
            object: 'block',
            type: 'heading_2',
            heading_2: { rich_text: [{ type: 'text', text: { content: section.title } }] }
          });

          // 内容
          for (const item of section.content) {
            if (item.type === 'paragraph') {
              children.push({
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ type: 'text', text: { content: item.text } }] }
              });
            } else if (item.type === 'heading_3') {
              children.push({
                object: 'block',
                type: 'heading_3',
                heading_3: { rich_text: [{ type: 'text', text: { content: item.text } }] }
              });
            } else if (item.type === 'bulleted_list_item') {
              children.push({
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: { rich_text: [{ type: 'text', text: { content: item.text } }] }
              });
            } else if (item.type === 'numbered_list_item') {
              children.push({
                object: 'block',
                type: 'numbered_list_item',
                numbered_list_item: { rich_text: [{ type: 'text', text: { content: item.text } }] }
              });
            } else if (item.type === 'code') {
              children.push({
                object: 'block',
                type: 'code',
                code: { rich_text: [{ type: 'text', text: { content: item.text } }], language: 'plain text' }
              });
            } else if (item.type === 'callout') {
              children.push({
                object: 'block',
                type: 'callout',
                callout: { rich_text: [{ type: 'text', text: { content: item.text } }], icon: { type: 'emoji', emoji: '💡' } }
              });
            } else if (item.type === 'toggle') {
              children.push({
                object: 'block',
                type: 'toggle',
                toggle: {
                  rich_text: [{ type: 'text', text: { content: item.question } }],
                  children: [{
                    object: 'block',
                    type: 'paragraph',
                    paragraph: { rich_text: [{ type: 'text', text: { content: item.answer } }] }
                  }]
                }
              });
            }
          }

          children.push({ object: 'block', type: 'divider', divider: {} });
        }

        // 分批添加（Notion API 限制每次最多 100 个 blocks）
        const batchSize = 50;
        for (let i = 0; i < children.length; i += batchSize) {
          const batch = children.slice(i, i + batchSize);
          await addBlocksToPage(page.id, batch);
          console.log(`   📝 添加内容 ${i + 1}-${Math.min(i + batchSize, children.length)}...`);
        }

        console.log(`   ✅ 内容添加完成`);
      }
    } catch (error) {
      console.error(`   ❌ 错误: ${error.message}`);
    }
  }

  console.log('\n🎉 完成！创建了 2 个教案页面');
}

main().catch(console.error);
