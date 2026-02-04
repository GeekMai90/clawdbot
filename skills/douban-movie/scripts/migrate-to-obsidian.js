#!/usr/bin/env node

/**
 * 迁移脚本：将现有 JSON 数据迁移到 Obsidian Markdown
 */

const fs = require('fs');
const path = require('path');

// JSON 数据路径
const DATA_DIR = path.join(__dirname, 'data');
const WATCHED_FILE = path.join(DATA_DIR, 'watched.json');
const WISHLIST_FILE = path.join(DATA_DIR, 'wishlist.json');
const REWATCHABLE_FILE = path.join(DATA_DIR, 'rewatchable.json');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');

// Obsidian 路径
const VAULT_PATH = '/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB';
const MOVIE_DIR = path.join(VAULT_PATH, '电影');

// 加载 JSON
function loadJSON(file) {
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
}

// 加载所有电影数据（用于查找详情）
const allMovies = loadJSON(MOVIES_FILE);

// 迁移观看记录
function migrateWatched() {
  const watched = loadJSON(WATCHED_FILE);
  
  if (watched.length === 0) {
    console.log('⚠️  没有观看记录需要迁移');
    return;
  }
  
  console.log(`\n🔄 迁移观看记录 (${watched.length} 条)...\n`);
  
  // 按年份分组
  const byYear = {};
  
  watched.forEach(item => {
    const date = new Date(item.watchedAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dateStr = date.toISOString().slice(0, 10);
    
    if (!byYear[year]) {
      byYear[year] = {};
    }
    
    if (!byYear[year][month]) {
      byYear[year][month] = [];
    }
    
    byYear[year][month].push({
      date: dateStr,
      ...item
    });
  });
  
  // 为每年创建文件
  Object.keys(byYear).forEach(year => {
    let content = `# ${year} 年观影记录\n\n`;
    
    // 按月份排序
    const months = Object.keys(byYear[year]).sort((a, b) => a - b);
    
    months.forEach(month => {
      content += `## ${month}月\n`;
      
      byYear[year][month].forEach(item => {
        // 查找电影详情
        const movie = allMovies.find(m => m.id === item.id);
        
        if (movie) {
          content += `### ${item.date} | ${item.title} ⭐ ${item.rating}\n`;
          content += `- 豆瓣ID：${item.id}\n`;
          if (item.note) {
            content += `- 备注：${item.note}\n`;
          }
          content += `- 豆瓣：${movie.link}\n\n`;
        } else {
          // 自定义影视作品
          content += `### ${item.date} | ${item.title}\n`;
          if (item.note) {
            content += `- 备注：${item.note}\n`;
          }
          content += '\n';
        }
      });
      
      content += '\n';
    });
    
    const filePath = path.join(MOVIE_DIR, `${year}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ 已创建: ${year}.md (${byYear[year][Object.keys(byYear[year]).length]} 个月)`);
  });
}

// 迁移想看清单
function migrateWishlist() {
  const wishlist = loadJSON(WISHLIST_FILE);
  
  if (wishlist.length === 0) {
    console.log('⚠️  没有想看清单需要迁移');
    return;
  }
  
  console.log(`\n🔄 迁移想看清单 (${wishlist.length} 条)...\n`);
  
  let content = '# 想看清单\n\n';
  
  // 按添加日期分组
  const byDate = {};
  
  wishlist.forEach(item => {
    const date = item.addedAt ? new Date(item.addedAt).toISOString().slice(0, 10) : '未知日期';
    
    if (!byDate[date]) {
      byDate[date] = [];
    }
    
    byDate[date].push(item);
  });
  
  // 按日期排序（最新的在前）
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  
  dates.forEach(date => {
    content += `## ${date}\n`;
    
    byDate[date].forEach(item => {
      content += `- 📺 ${item.title}`;
      if (item.rating) {
        content += ` ⭐ ${item.rating}`;
      }
      content += '\n';
      
      if (item.id) {
        content += `  - 豆瓣ID：${item.id}\n`;
      }
      
      if (item.note) {
        content += `  - 备注：${item.note}\n`;
      }
      
      if (item.link) {
        content += `  - 豆瓣：${item.link}\n`;
      }
      
      content += '\n';
    });
  });
  
  const filePath = path.join(MOVIE_DIR, '想看清单.md');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已创建: 想看清单.md`);
}

// 迁移可重看清单
function migrateRewatchable() {
  const rewatchable = loadJSON(REWATCHABLE_FILE);
  
  if (rewatchable.length === 0) {
    console.log('⚠️  没有可重看清单需要迁移');
    return;
  }
  
  console.log(`\n🔄 迁移可重看清单 (${rewatchable.length} 条)...\n`);
  
  let content = '# 可重看清单\n\n';
  
  rewatchable.forEach(id => {
    const movie = allMovies.find(m => m.id === id);
    if (movie) {
      content += `- ${movie.title} (${id}) ⭐ ${movie.rating}\n`;
    }
  });
  
  const filePath = path.join(MOVIE_DIR, '可重看清单.md');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已创建: 可重看清单.md`);
}

// 执行迁移
console.log('🚀 开始迁移数据到 Obsidian...\n');

migrateWatched();
migrateWishlist();
migrateRewatchable();

console.log('\n✅ 迁移完成！数据已保存到: GeekMaiOB/电影/');
console.log('\n💡 提示:');
console.log('   - 观影记录按年份分文件（如 2026.md）');
console.log('   - 想看清单在 想看清单.md');
console.log('   - 可重看清单在 可重看清单.md');
console.log('\n📁 原始 JSON 文件已保留在 data/ 目录（可以备份后删除）');
