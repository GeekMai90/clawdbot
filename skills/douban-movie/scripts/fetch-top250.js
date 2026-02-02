#!/usr/bin/env node

/**
 * 抓取豆瓣电影 TOP250
 * 保存到 data/movies.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');

// 豆瓣 TOP250 分页（每页 25 部，共 10 页）
const BASE_URL = 'https://movie.douban.com/top250';

// 模拟浏览器请求
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

/**
 * 获取页面 HTML
 */
function fetchPage(start = 0) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}?start=${start}`;
    
    https.get(url, { headers }, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        resolve(html);
      });
    }).on('error', reject);
  });
}

/**
 * 解析电影信息
 */
function parseMovies(html) {
  const movies = [];
  
  // 正则匹配电影条目
  const itemRegex = /<li>[\s\S]*?<div class="item">[\s\S]*?<\/li>/g;
  const items = html.match(itemRegex) || [];
  
  items.forEach(item => {
    try {
      // 排名
      const rankMatch = item.match(/<em class="">(\d+)<\/em>/);
      const rank = rankMatch ? parseInt(rankMatch[1]) : null;
      
      // 电影链接
      const linkMatch = item.match(/<a href="(https:\/\/movie\.douban\.com\/subject\/\d+\/)"/);
      const link = linkMatch ? linkMatch[1] : null;
      
      // 电影 ID
      const id = link ? link.match(/subject\/(\d+)/)[1] : null;
      
      // 标题
      const titleMatch = item.match(/<span class="title">([^<]+)<\/span>/);
      const title = titleMatch ? titleMatch[1] : null;
      
      // 其他标题（英文名等）
      const otherMatch = item.match(/<span class="other">([^<]+)<\/span>/);
      const other = otherMatch ? otherMatch[1].replace(/&nbsp;/g, ' ').trim() : null;
      
      // 评分
      const ratingMatch = item.match(/<span class="rating_num"[^>]*>([^<]+)<\/span>/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
      
      // 评价人数
      const peopleMatch = item.match(/<span>(\d+)人评价<\/span>/);
      const people = peopleMatch ? parseInt(peopleMatch[1]) : null;
      
      // 简介（导演、演员、年份、类型等）
      const bdMatch = item.match(/<p class="">[\s\S]*?<br>([\s\S]*?)<\/p>/);
      let director = null;
      let actors = null;
      let year = null;
      let country = null;
      let genres = null;
      
      if (bdMatch) {
        const info = bdMatch[1].trim();
        
        // 导演
        const directorMatch = info.match(/导演:\s*([^\s]+)/);
        director = directorMatch ? directorMatch[1] : null;
        
        // 主演
        const actorsMatch = info.match(/主演:\s*([^\n]+)/);
        actors = actorsMatch ? actorsMatch[1].trim().split('/').map(a => a.trim()) : null;
        
        // 年份
        const yearMatch = info.match(/(\d{4})/);
        year = yearMatch ? parseInt(yearMatch[1]) : null;
        
        // 国家/地区
        const parts = info.split(/\s+/);
        if (parts.length > 1) {
          country = parts[1];
        }
        
        // 类型
        const genreMatch = info.match(/\s+([^\d\n]+)$/);
        if (genreMatch) {
          genres = genreMatch[1].trim().split(/\s+/);
        }
      }
      
      // 一句话简介
      const quoteMatch = item.match(/<span class="inq">([^<]+)<\/span>/);
      const quote = quoteMatch ? quoteMatch[1] : null;
      
      if (id && title) {
        movies.push({
          id,
          rank,
          title,
          other,
          director,
          actors,
          year,
          country,
          genres,
          rating,
          people,
          quote,
          link
        });
      }
    } catch (err) {
      console.error('解析电影信息失败:', err.message);
    }
  });
  
  return movies;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎬 开始抓取豆瓣电影 TOP250...\n');
  
  const allMovies = [];
  
  // 抓取 10 页（每页 25 部）
  for (let page = 0; page < 10; page++) {
    const start = page * 25;
    console.log(`📄 抓取第 ${page + 1}/10 页 (start=${start})...`);
    
    try {
      const html = await fetchPage(start);
      const movies = parseMovies(html);
      allMovies.push(...movies);
      
      console.log(`   ✅ 成功解析 ${movies.length} 部电影`);
      
      // 延迟 1 秒，避免请求过快
      if (page < 9) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`   ❌ 抓取失败: ${err.message}`);
    }
  }
  
  // 保存到文件
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  fs.writeFileSync(MOVIES_FILE, JSON.stringify(allMovies, null, 2), 'utf-8');
  
  console.log(`\n✨ 完成！共抓取 ${allMovies.length} 部电影`);
  console.log(`📁 数据已保存到: ${MOVIES_FILE}`);
}

main().catch(err => {
  console.error('❌ 发生错误:', err);
  process.exit(1);
});
