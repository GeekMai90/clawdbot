#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const NOTION_KEY = fs.readFileSync('/Users/geekmai/.config/notion/api_key', 'utf-8').trim();
const PARENT = '2f8b4958-904e-81a9-91ba-e2f873ce6608';

function req(path, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com', path, method,
      headers: { 'Authorization': `Bearer ${NOTION_KEY}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🚀 开始创建 Day 2-30 课程页面...\n');

  const days = [
    ['Day 2: 工具准备', '安装 Cursor，注册 GitHub，创建第一个项目文件夹'],
    ['Day 3: 如何与 AI 对话', '学会写好提示词，掌握提问技巧'],
    ['Day 4: HTML 基础', '学习 HTML 标签，做个人介绍页面'],
    ['Day 5: CSS 样式', '学习 CSS 选择器和布局，美化网页'],
    ['Day 6: JavaScript 交互', '让网页动起来，添加交互功能'],
    ['Day 7: 开发者工具', '学会调试代码，找出问题'],
    ['Day 8: Git 基础', '学会版本控制，保存代码历史'],
    ['Day 9-10: 项目 1 - 天气应用', '实战：开发一个天气查询 Web 应用'],
    ['Day 11-12: 项目 2 - 番茄钟', '实战：开发一个番茄钟计时器'],
    ['Day 13-15: 项目 3 - 书签管理', '实战：开发个人书签管理器'],
    ['Day 16-17: Electron 入门', '学习用 Electron 做桌面应用'],
    ['Day 18-19: 桌面特性', '学习系统托盘、菜单栏等桌面功能'],
    ['Day 20-22: 项目 4 - 桌面笔记', '实战：开发桌面笔记应用'],
    ['Day 23-25: 项目 5 - 自选项目', '根据兴趣选择开发项目'],
    ['Day 26-27: 进阶技巧', '学习更多高级技巧'],
    ['Day 28-29: 社区与分享', '参与开源社区，分享作品'],
    ['Day 30: 总结与展望', '回顾学习历程，规划下一步']
  ];

  for (const [title, goal] of days) {
    console.log(`📄 ${title}`);
    try {
      const page = await req('/v1/pages', 'POST', {
        parent: { page_id: PARENT },
        properties: { title: { title: [{ text: { content: title } }] } }
      });

      await req(`/v1/blocks/${page.id}/children`, 'PATCH', {
        children: [
          { object: 'block', type: 'callout', callout: { rich_text: [{ type: 'text', text: { content: `课程目标：${goal}` } }], icon: { type: 'emoji', emoji: '🎯' } } },
          { object: 'block', type: 'divider', divider: {} },
          { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: '详细内容整理中...' } }] } }
        ]
      });

      console.log(`   ✅ ${page.url}\n`);
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`   ❌ ${e.message}\n`);
    }
  }

  console.log('🎉 完成！');
}

main().catch(console.error);
