#!/usr/bin/env node

/**
 * 记账技能 - 基于 Obsidian Markdown 存储
 * 
 * 三大模块：
 * 1. 记账模块 - 个人收入支出
 * 2. 报销模块 - 公司报销管理
 * 3. 订阅模块 - 订阅服务管理与提醒
 */

const fs = require('fs');
const path = require('path');

// Obsidian vault 路径
const VAULT_PATH = '/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB';
const BOOKKEEPING_DIR = path.join(VAULT_PATH, '02-生活/记账');

// 确保目录存在
if (!fs.existsSync(BOOKKEEPING_DIR)) {
  fs.mkdirSync(BOOKKEEPING_DIR, { recursive: true });
}

// 支出分类（可扩展）
const CATEGORIES = [
  '餐饮', '交通', '购物', '娱乐', '医疗',
  '教育', '住房', '通讯', '数码', '其他'
];

// 备份目录（在 Obsidian 内，方便同步）
const BACKUP_DIR = path.join(BOOKKEEPING_DIR, '_backup');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * 获取当前月份的账单文件路径
 */
function getMonthlyFilePath(yearMonth = null) {
  if (!yearMonth) {
    const now = new Date();
    yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return path.join(BOOKKEEPING_DIR, `${yearMonth}.md`);
}

/**
 * 读取月度账单文件
 */
function readMonthlyFile(yearMonth = null) {
  const filePath = getMonthlyFilePath(yearMonth);
  
  if (!fs.existsSync(filePath)) {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = ym.split('-');
    const content = `# ${year}年${parseInt(month)}月记账\n\n## 收入\n\n## 支出\n\n`;
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入月度账单文件
 */
function writeMonthlyFile(content, yearMonth = null) {
  const filePath = getMonthlyFilePath(yearMonth);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 记录收入
 */
function recordIncome(amount, note = '') {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const yearMonth = date.slice(0, 7);
  
  let content = readMonthlyFile(yearMonth);
  
  const incomeEntry = `- ${date} | ${amount} | ${note}\n`;
  
  // 在 "## 收入" 后添加
  content = content.replace('## 收入\n', `## 收入\n${incomeEntry}`);
  
  writeMonthlyFile(content, yearMonth);
  
  console.log(`✅ 已记录收入: ${amount} 元 - ${note}`);
  return true;
}

/**
 * 记录支出
 */
function recordExpense(amount, category, note = '') {
  // 验证分类
  if (!CATEGORIES.includes(category)) {
    console.log(`⚠️  未知分类: ${category}`);
    console.log(`💡 可用分类: ${CATEGORIES.join('、')}`);
    console.log(`💡 如需添加新分类，请告诉麦先生`);
  }
  
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const yearMonth = date.slice(0, 7);
  
  let content = readMonthlyFile(yearMonth);
  
  const expenseEntry = `- ${date} | ${category} | ${amount} | ${note}\n`;
  
  // 在 "## 支出" 后添加
  content = content.replace('## 支出\n', `## 支出\n${expenseEntry}`);
  
  writeMonthlyFile(content, yearMonth);
  
  console.log(`✅ 已记录支出: ${amount} 元 - ${category} - ${note}`);
  return true;
}

/**
 * 查看月度账单
 */
function viewMonthly(yearMonth = null) {
  const content = readMonthlyFile(yearMonth);
  console.log(content);
}

/**
 * 月度统计
 */
function monthlyStats(yearMonth = null) {
  const content = readMonthlyFile(yearMonth);
  
  // 解析收入
  const incomeMatches = content.match(/## 收入\n([\s\S]*?)(?=\n## |$)/);
  let totalIncome = 0;
  let incomeCount = 0;
  
  if (incomeMatches) {
    const incomeLines = incomeMatches[1].trim().split('\n');
    incomeLines.forEach(line => {
      const match = line.match(/- \d{4}-\d{2}-\d{2} \| ([\d.]+) \|/);
      if (match) {
        totalIncome += parseFloat(match[1]);
        incomeCount++;
      }
    });
  }
  
  // 解析支出
  const expenseMatches = content.match(/## 支出\n([\s\S]*?)(?=\n## |$)/);
  let totalExpense = 0;
  let expenseCount = 0;
  const categoryExpense = {};
  
  if (expenseMatches) {
    const expenseLines = expenseMatches[1].trim().split('\n');
    expenseLines.forEach(line => {
      const match = line.match(/- \d{4}-\d{2}-\d{2} \| ([^|]+) \| ([\d.]+) \|/);
      if (match) {
        const category = match[1].trim();
        const amount = parseFloat(match[2]);
        totalExpense += amount;
        expenseCount++;
        categoryExpense[category] = (categoryExpense[category] || 0) + amount;
      }
    });
  }
  
  const ym = yearMonth || new Date().toISOString().slice(0, 7);
  const [year, month] = ym.split('-');
  
  console.log(`\n📊 ${year}年${parseInt(month)}月账单统计:\n`);
  console.log(`💰 总收入: ${totalIncome.toFixed(2)} 元 (${incomeCount} 笔)`);
  console.log(`💸 总支出: ${totalExpense.toFixed(2)} 元 (${expenseCount} 笔)`);
  console.log(`💵 结余: ${(totalIncome - totalExpense).toFixed(2)} 元\n`);
  
  if (Object.keys(categoryExpense).length > 0) {
    console.log(`📂 支出分类明细:`);
    Object.entries(categoryExpense)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amt]) => {
        const percent = ((amt / totalExpense) * 100).toFixed(1);
        console.log(`   ${cat}: ${amt.toFixed(2)} 元 (${percent}%)`);
      });
  }
}

/**
 * 添加待报销项目
 */
function addReimbursement(amount, reason) {
  const reimburseFile = path.join(BOOKKEEPING_DIR, '待报销.md');
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  
  let content = '';
  if (fs.existsSync(reimburseFile)) {
    content = fs.readFileSync(reimburseFile, 'utf-8');
  } else {
    content = '# 待报销项目\n\n';
  }
  
  const entry = `- ${date} | ${amount} | ${reason}\n`;
  content += entry;
  
  fs.writeFileSync(reimburseFile, content, 'utf-8');
  
  console.log(`✅ 已添加待报销: ${amount} 元 - ${reason}`);
  return true;
}

/**
 * 查看待报销列表
 */
function viewReimbursement() {
  const reimburseFile = path.join(BOOKKEEPING_DIR, '待报销.md');
  
  if (!fs.existsSync(reimburseFile)) {
    console.log('📭 暂无待报销项目');
    return;
  }
  
  const content = fs.readFileSync(reimburseFile, 'utf-8');
  
  // 计算总金额
  const lines = content.split('\n').filter(l => l.startsWith('- '));
  let total = 0;
  lines.forEach(line => {
    const match = line.match(/\| ([\d.]+) \|/);
    if (match) {
      total += parseFloat(match[1]);
    }
  });
  
  console.log(content);
  console.log(`\n💰 待报销总计: ${total.toFixed(2)} 元`);
}

/**
 * 清空已报销项目
 */
function clearReimbursement() {
  const reimburseFile = path.join(BOOKKEEPING_DIR, '待报销.md');
  
  if (fs.existsSync(reimburseFile)) {
    fs.unlinkSync(reimburseFile);
    console.log('✅ 已清空报销记录');
  } else {
    console.log('📭 暂无待报销项目');
  }
}

/**
 * 添加订阅
 */
function addSubscription(name, amount, cycle, nextDate) {
  const subscribeFile = path.join(BOOKKEEPING_DIR, '订阅管理.md');
  
  let content = '';
  if (fs.existsSync(subscribeFile)) {
    content = fs.readFileSync(subscribeFile, 'utf-8');
  } else {
    content = '# 订阅管理\n\n## 月订阅\n\n## 年订阅\n\n';
  }
  
  const entry = `- ${name} | ${amount} | 下次续费：${nextDate}\n`;
  
  if (cycle === '月' || cycle === 'month') {
    content = content.replace('## 月订阅\n', `## 月订阅\n${entry}`);
  } else if (cycle === '年' || cycle === 'year') {
    content = content.replace('## 年订阅\n', `## 年订阅\n${entry}`);
  } else {
    console.log('❌ 周期必须是 "月" 或 "年"');
    return false;
  }
  
  fs.writeFileSync(subscribeFile, content, 'utf-8');
  
  console.log(`✅ 已添加订阅: ${name} - ${amount} (${cycle}订阅)`);
  return true;
}

/**
 * 查看订阅列表
 */
function viewSubscriptions() {
  const subscribeFile = path.join(BOOKKEEPING_DIR, '订阅管理.md');
  
  if (!fs.existsSync(subscribeFile)) {
    console.log('📭 暂无订阅记录');
    return;
  }
  
  const content = fs.readFileSync(subscribeFile, 'utf-8');
  console.log(content);
}

/**
 * 更新订阅续费日期
 */
function renewSubscription(name, newDate) {
  const subscribeFile = path.join(BOOKKEEPING_DIR, '订阅管理.md');
  
  if (!fs.existsSync(subscribeFile)) {
    console.log('❌ 订阅文件不存在');
    return false;
  }
  
  let content = fs.readFileSync(subscribeFile, 'utf-8');
  
  // 查找并更新
  const regex = new RegExp(`- ${name} \\| ([^|]+) \\| 下次续费：\\d{4}-\\d{2}-\\d{2}`, 'g');
  const newContent = content.replace(regex, `- ${name} | $1 | 下次续费：${newDate}`);
  
  if (newContent === content) {
    console.log(`❌ 找不到订阅: ${name}`);
    return false;
  }
  
  fs.writeFileSync(subscribeFile, newContent, 'utf-8');
  
  console.log(`✅ 已更新订阅 ${name} 的续费日期: ${newDate}`);
  return true;
}

/**
 * 删除订阅
 */
function removeSubscription(name) {
  const subscribeFile = path.join(BOOKKEEPING_DIR, '订阅管理.md');
  
  if (!fs.existsSync(subscribeFile)) {
    console.log('❌ 订阅文件不存在');
    return false;
  }
  
  let content = fs.readFileSync(subscribeFile, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter(line => !line.includes(`- ${name} |`));
  
  if (lines.length === filtered.length) {
    console.log(`❌ 找不到订阅: ${name}`);
    return false;
  }
  
  fs.writeFileSync(subscribeFile, filtered.join('\n'), 'utf-8');
  
  console.log(`✅ 已删除订阅: ${name}`);
  return true;
}

/**
 * 备份文件到 Obsidian/02-生活/记账/_backup/YYYY-MM-DD/
 */
function backupFiles(opts = {}) {
  const { yearMonth = null, includeReimburse = true, includeSubscriptions = true } = opts;
  const stamp = new Date().toISOString().slice(0, 10);
  const destDir = path.join(BACKUP_DIR, stamp);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const copied = [];

  // 月度账单
  if (yearMonth) {
    const src = getMonthlyFilePath(yearMonth);
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, path.basename(src));
      fs.copyFileSync(src, dest);
      copied.push(dest);
    }
  } else {
    // 备份所有 YYYY-MM.md
    const files = fs.readdirSync(BOOKKEEPING_DIR)
      .filter(f => /^\d{4}-\d{2}\.md$/.test(f))
      .map(f => path.join(BOOKKEEPING_DIR, f));
    files.forEach(src => {
      const dest = path.join(destDir, path.basename(src));
      fs.copyFileSync(src, dest);
      copied.push(dest);
    });
  }

  if (includeReimburse) {
    const src = path.join(BOOKKEEPING_DIR, '待报销.md');
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, '待报销.md');
      fs.copyFileSync(src, dest);
      copied.push(dest);
    }
  }

  if (includeSubscriptions) {
    const src = path.join(BOOKKEEPING_DIR, '订阅管理.md');
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, '订阅管理.md');
      fs.copyFileSync(src, dest);
      copied.push(dest);
    }
  }

  return { destDir, copied };
}

/**
 * 检查即将到期的订阅
 */
function checkSubscriptions() {
  const subscribeFile = path.join(BOOKKEEPING_DIR, '订阅管理.md');
  
  if (!fs.existsSync(subscribeFile)) {
    return [];
  }
  
  const content = fs.readFileSync(subscribeFile, 'utf-8');
  const lines = content.split('\n').filter(l => l.startsWith('- '));
  
  const today = new Date();
  const alerts = [];
  
  lines.forEach(line => {
    const match = line.match(/- ([^|]+) \| ([^|]+) \| 下次续费：(\d{4}-\d{2}-\d{2})/);
    if (match) {
      const name = match[1].trim();
      const amount = match[2].trim();
      const nextDate = new Date(match[3]);
      
      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // 提前3天、提前1天、当天提醒
      if (diffDays === 3) {
        alerts.push(`⚠️  ${name} (${amount}) 将在 3 天后续费 (${match[3]})`);
      } else if (diffDays === 1) {
        alerts.push(`⚠️  ${name} (${amount}) 明天续费 (${match[3]})`);
      } else if (diffDays === 0) {
        alerts.push(`🔴 ${name} (${amount}) 今天续费 (${match[3]})`);
      } else if (diffDays < 0) {
        alerts.push(`❗ ${name} (${amount}) 已过期 ${-diffDays} 天 (${match[3]})`);
      }
    }
  });
  
  return alerts;
}

/**
 * 命令行接口
 */
function cli() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help') {
    console.log(`
🧾 记账技能 - 基于 Obsidian

用法: node bookkeeping.js <命令> [参数]

【1️⃣ 记账模块】
  income <金额> <备注>              记录收入
  expense <金额> <分类> <备注>      记录支出
  monthly [YYYY-MM]                查看月度账单
  stats [YYYY-MM]                  月度统计

  可用分类: ${CATEGORIES.join('、')}

【2️⃣ 报销模块】
  reimburse <金额> <事由>          添加待报销项目
  reimburse-list                   查看待报销列表
  reimburse-clear                  清空已报销项目

【3️⃣ 订阅模块】
  subscribe <名称> <金额> <周期> <下次续费日期>    添加订阅 (周期: 月/年)
  subscribe-list                                    查看订阅列表
  subscribe-renew <名称> <新日期>                   更新续费日期
  subscribe-remove <名称>                           删除订阅
  subscribe-check                                   检查到期提醒

【4️⃣ 备份】
  backup [YYYY-MM]                                 备份（不传则备份所有月份 + 订阅 + 待报销）

示例:
  node bookkeeping.js income 10000 月薪
  node bookkeeping.js expense 30 餐饮 午餐
  node bookkeeping.js reimburse 200 办公用品
  node bookkeeping.js subscribe "ChatGPT Plus" "20美元/月" 月 2026-02-15
`);
    return;
  }
  
  switch (command) {
    case 'income': {
      const amount = parseFloat(args[1]);
      const note = args.slice(2).join(' ');
      
      if (!amount) {
        console.log('❌ 请提供金额');
        break;
      }
      
      recordIncome(amount, note);
      break;
    }
    
    case 'expense': {
      const amount = parseFloat(args[1]);
      const category = args[2];
      const note = args.slice(3).join(' ');
      
      if (!amount || !category) {
        console.log('❌ 请提供金额和分类');
        break;
      }
      
      recordExpense(amount, category, note);
      break;
    }
    
    case 'monthly': {
      const yearMonth = args[1];
      viewMonthly(yearMonth);
      break;
    }
    
    case 'stats': {
      const yearMonth = args[1];
      monthlyStats(yearMonth);
      break;
    }
    
    case 'reimburse': {
      const amount = parseFloat(args[1]);
      const reason = args.slice(2).join(' ');
      
      if (!amount || !reason) {
        console.log('❌ 请提供金额和事由');
        break;
      }
      
      addReimbursement(amount, reason);
      break;
    }
    
    case 'reimburse-list': {
      viewReimbursement();
      break;
    }
    
    case 'reimburse-clear': {
      clearReimbursement();
      break;
    }
    
    case 'subscribe': {
      const name = args[1];
      const amount = args[2];
      const cycle = args[3];
      const nextDate = args[4];
      
      if (!name || !amount || !cycle || !nextDate) {
        console.log('❌ 请提供: 名称 金额 周期(月/年) 下次续费日期(YYYY-MM-DD)');
        break;
      }
      
      addSubscription(name, amount, cycle, nextDate);
      break;
    }
    
    case 'subscribe-list': {
      viewSubscriptions();
      break;
    }
    
    case 'subscribe-renew': {
      const name = args[1];
      const newDate = args[2];
      
      if (!name || !newDate) {
        console.log('❌ 请提供: 名称 新日期(YYYY-MM-DD)');
        break;
      }
      
      renewSubscription(name, newDate);
      break;
    }
    
    case 'subscribe-remove': {
      const name = args[1];
      
      if (!name) {
        console.log('❌ 请提供订阅名称');
        break;
      }
      
      removeSubscription(name);
      break;
    }
    
    case 'subscribe-check': {
      const alerts = checkSubscriptions();
      
      if (alerts.length === 0) {
        console.log('✅ 暂无即将到期的订阅');
      } else {
        console.log('\n📅 订阅续费提醒:\n');
        alerts.forEach(alert => console.log(alert));
      }
      break;
    }

    case 'backup': {
      const yearMonth = args[1] || null;
      const { destDir, copied } = backupFiles({ yearMonth });
      console.log(`✅ 备份完成：${copied.length} 个文件`);
      console.log(`📁 备份目录：${destDir}`);
      break;
    }
    
    default:
      console.log(`❌ 未知命令: ${command}`);
      console.log('使用 "node bookkeeping.js help" 查看帮助');
  }
}

// 如果直接运行，启动命令行
if (require.main === module) {
  cli();
}

// 导出函数供其他模块使用
module.exports = {
  recordIncome,
  recordExpense,
  viewMonthly,
  monthlyStats,
  addReimbursement,
  viewReimbursement,
  clearReimbursement,
  addSubscription,
  viewSubscriptions,
  renewSubscription,
  removeSubscription,
  checkSubscriptions,
  backupFiles
};
