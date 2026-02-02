#!/usr/bin/env node

/**
 * 抓取豆瓣热门和最新电影/电视剧
 * 支持多种标签：热门、最新、经典等
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const TRENDING_FILE = path.join(DATA_DIR, 'trending.json');

// 豆瓣搜索 API
const API_BASE = 'https://movie.douban.com/j/search_subjects';

// 请求头
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://movie.douban.com/'
};

/**
 * 获取数据
 */
function fetchData(type, tag, limit = 50) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${limit}&page_start=0`;
    
    https.get(url, { headers }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.subjects || []);
        } catch (err) {
          reject(new Error(`解析 JSON 失败: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * 获取详细信息（可选，需要额外请求）
 */
async function enrichMovieData(movie) {
  // 基础数据已经足够，暂不实现详细信息抓取
  // 如果需要导演、演员等信息，需要额外请求每部电影的页面
  return {
    id: movie.id,
    title: movie.title,
    rating: movie.rate || null,
    cover: movie.cover,
    url: movie.url,
    isNew: movie.is_new || false,
    playable: movie.playable || false,
    episodes: movie.episodes_info || null
  };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 默认抓取所有类型
  const types = [
    { type: 'movie', tag: '热门', name: '热门电影' },
    { type: 'movie', tag: '最新', name: '最新电影' },
    { type: 'tv', tag: '热门', name: '热门剧集' },
    { type: 'tv', tag: '最新', name: '最新剧集' }
  ];
  
  console.log('🎬 开始抓取豆瓣热门/最新影视...\n');
  
  const result = {
    updatedAt: new Date().toISOString(),
    data: {}
  };
  
  for (const { type, tag, name } of types) {
    console.log(`📄 抓取 ${name}...`);
    
    try {
      const subjects = await fetchData(type, tag, 50);
      const enriched = await Promise.all(subjects.map(enrichMovieData));
      
      result.data[`${type}_${tag}`] = enriched;
      
      console.log(`   ✅ 成功获取 ${enriched.length} 部作品`);
      
      // 延迟 0.5 秒
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`   ❌ 抓取失败: ${err.message}`);
      result.data[`${type}_${tag}`] = [];
    }
  }
  
  // 保存到文件
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  fs.writeFileSync(TRENDING_FILE, JSON.stringify(result, null, 2), 'utf-8');
  
  // 统计
  const total = Object.values(result.data).reduce((sum, arr) => sum + arr.length, 0);
  
  console.log(`\n✨ 完成！共抓取 ${total} 部影视作品`);
  console.log(`📁 数据已保存到: ${TRENDING_FILE}`);
  console.log(`🕐 更新时间: ${result.updatedAt}`);
}

main().catch(err => {
  console.error('❌ 发生错误:', err);
  process.exit(1);
});
