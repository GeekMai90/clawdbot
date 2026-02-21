#!/usr/bin/env node

/**
 * 豆瓣电影管理工具
 * - 推荐电影（参考库保持 JSON）
 * - 记录观看（用户数据改为 Obsidian Markdown）
 * - 管理重看清单（用户数据改为 Obsidian Markdown）
 */

const fs = require('fs');
const path = require('path');

// 参考库数据（保持 JSON）
const DATA_DIR = path.join(__dirname, 'data');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');
const TRENDING_FILE = path.join(DATA_DIR, 'trending.json');

// Obsidian vault 路径（用户数据改为 Markdown）
const VAULT_PATH = '/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB';
const MOVIE_DIR = path.join(VAULT_PATH, '30-运行记录/观影记录');

// 确保目录存在
if (!fs.existsSync(MOVIE_DIR)) {
  fs.mkdirSync(MOVIE_DIR, { recursive: true });
}

// ========== 参考库读取（JSON） ==========

// 加载 JSON 数据
function loadJSON(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (err) {
    console.error(`读取文件失败: ${file}`, err.message);
  }
  return defaultValue;
}

// 获取所有电影（TOP250）
function getAllMovies() {
  return loadJSON(MOVIES_FILE);
}

// 获取热门/最新影视数据
function getTrending() {
  const data = loadJSON(TRENDING_FILE, {});
  return data.data || {};
}

// 获取热门/最新影视更新时间
function getTrendingUpdatedAt() {
  const data = loadJSON(TRENDING_FILE, {});
  return data.updatedAt || null;
}

// ========== 用户数据读写（Markdown in Obsidian） ==========

/**
 * 读取观影记录文件（按年）
 */
function getWatchedFilePath(year = null) {
  if (!year) {
    year = new Date().getFullYear();
  }
  return path.join(MOVIE_DIR, `${year}.md`);
}

/**
 * 读取观影记录 Markdown
 */
function readWatchedFile(year = null) {
  const filePath = getWatchedFilePath(year);
  
  if (!fs.existsSync(filePath)) {
    const y = year || new Date().getFullYear();
    return `# ${y} 年观影记录\n\n`;
  }
  
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入观影记录 Markdown
 */
function writeWatchedFile(content, year = null) {
  const filePath = getWatchedFilePath(year);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 从观影记录 Markdown 中提取所有电影 ID
 */
function getWatchedIds() {
  const ids = [];
  
  // 读取所有年份的观影记录
  const files = fs.readdirSync(MOVIE_DIR).filter(f => /^\d{4}\.md$/.test(f));
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(MOVIE_DIR, file), 'utf-8');
    const matches = content.matchAll(/- 豆瓣ID：(\d+)/g);
    for (const match of matches) {
      ids.push(match[1]);
    }
  });
  
  return ids;
}

/**
 * 记录观看（追加到观影记录 Markdown）
 */
function markWatched(titleOrId, note = null) {
  const allMovies = getAllMovies();
  const movieById = allMovies.find(m => m.id === titleOrId);
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.toISOString().slice(0, 10);
  
  let content = readWatchedFile(year);
  
  // 检查月份标题是否存在
  const monthHeader = `## ${month}月`;
  if (!content.includes(monthHeader)) {
    // 在标题后添加月份
    content = content.replace(/^(# \d{4} 年观影记录\n\n)/, `$1${monthHeader}\n\n`);
  }
  
  let entry = '';
  
  if (movieById) {
    // 从 TOP250 找到了
    entry = `### ${date} | ${movieById.title} ⭐ ${movieById.rating}\n`;
    entry += `- 豆瓣ID：${titleOrId}\n`;
    if (note) {
      entry += `- 备注：${note}\n`;
    }
    entry += `- 豆瓣：${movieById.link}\n\n`;
  } else {
    // 自定义影视作品
    const title = titleOrId;
    entry = `### ${date} | ${title}\n`;
    if (note) {
      entry += `- 备注：${note}\n`;
    }
    entry += '\n';
  }
  
  // 在月份标题后添加条目
  content = content.replace(monthHeader + '\n', monthHeader + '\n' + entry);
  
  writeWatchedFile(content, year);
  
  const displayTitle = movieById ? movieById.title : titleOrId;
  console.log(`✅ 已记录观看: ${displayTitle}`);
  
  // 从想看清单中删除（如果存在）
  removeFromWishlist(titleOrId, true);
  
  return true;
}

/**
 * 读取想看清单文件
 */
function getWishlistFilePath() {
  return path.join(MOVIE_DIR, '想看清单.md');
}

/**
 * 读取想看清单 Markdown
 */
function readWishlistFile() {
  const filePath = getWishlistFilePath();
  
  if (!fs.existsSync(filePath)) {
    return '# 想看清单\n\n';
  }
  
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入想看清单 Markdown
 */
function writeWishlistFile(content) {
  const filePath = getWishlistFilePath();
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 添加到想看清单
 */
function addToWishlist(titleOrId, note = null) {
  const allMovies = getAllMovies();
  const movieById = allMovies.find(m => m.id === titleOrId);
  
  let content = readWishlistFile();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  
  let title = titleOrId;
  let rating = null;
  let link = null;
  
  if (movieById) {
    title = movieById.title;
    rating = movieById.rating;
    link = movieById.link;
    
    // 检查是否已在想看清单中（通过 ID 或标题）
    if (content.includes(`豆瓣ID：${titleOrId}`) || content.includes(`- 📺 ${title}\n`)) {
      console.log(`⚠️  《${title}》已在想看清单中`);
      return false;
    }
    
    // 检查是否已看过
    const watchedIds = getWatchedIds();
    if (watchedIds.includes(titleOrId)) {
      console.log(`⚠️  《${title}》已经看过了`);
      return false;
    }
  } else {
    // 自定义影视作品，检查标题是否重复
    if (content.includes(`- 📺 ${title}\n`)) {
      console.log(`⚠️  《${title}》已在想看清单中`);
      return false;
    }
  }
  
  // 创建日期分组标题（如果不存在）
  const dateHeader = `## ${date}`;
  if (!content.includes(dateHeader)) {
    // 在标题后添加日期分组
    content = content.replace(/^(# 想看清单\n\n)/, `$1${dateHeader}\n`);
  }
  
  let entry = `- 📺 ${title}`;
  if (rating) {
    entry += ` ⭐ ${rating}`;
  }
  entry += '\n';
  
  if (movieById && movieById.id) {
    entry += `  - 豆瓣ID：${movieById.id}\n`;
  }
  
  if (note) {
    entry += `  - 备注：${note}\n`;
  }
  
  if (link) {
    entry += `  - 豆瓣：${link}\n`;
  }
  
  entry += '\n';
  
  // 在日期标题后添加条目
  content = content.replace(dateHeader + '\n', dateHeader + '\n' + entry);
  
  writeWishlistFile(content);
  
  console.log(`✅ 已添加到想看清单: ${title}`);
  
  return true;
}

/**
 * 从想看清单中删除（支持ID或标题）
 */
function removeFromWishlist(idOrTitle, silent = false) {
  let content = readWishlistFile();
  const originalContent = content;
  
  // 构建正则表达式匹配整个条目（包括子项）
  let pattern;
  
  // 尝试按 ID 删除
  if (/^\d+$/.test(idOrTitle)) {
    pattern = new RegExp(`- 📺 [^\\n]+\\n(?:  - [^\\n]+\\n)*  - 豆瓣ID：${idOrTitle}\\n(?:  - [^\\n]+\\n)*\\n`, 'g');
    content = content.replace(pattern, '');
  }
  
  // 如果没删除成功，尝试按标题删除
  if (content === originalContent) {
    const escapedTitle = idOrTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pattern = new RegExp(`- 📺 ${escapedTitle}[^\\n]*\\n(?:  - [^\\n]+\\n)*\\n`, 'g');
    content = content.replace(pattern, '');
  }
  
  if (content === originalContent) {
    if (!silent) {
      console.log(`⚠️  想看清单中没有这部电影`);
    }
    return false;
  }
  
  writeWishlistFile(content);
  
  if (!silent) {
    console.log(`✅ 已从想看清单删除: ${idOrTitle}`);
  }
  
  return true;
}

/**
 * 查看想看清单（解析为结构化数据）
 */
function getWishlist() {
  const content = readWishlistFile();
  const items = [];
  
  // 解析每个条目
  const entries = content.split(/^- 📺 /m).slice(1);
  
  entries.forEach(entry => {
    const lines = entry.trim().split('\n');
    const firstLine = lines[0];
    
    // 提取标题和评分
    const titleMatch = firstLine.match(/^([^⭐]+)(⭐ ([\d.]+))?/);
    if (!titleMatch) return;
    
    const title = titleMatch[1].trim();
    const rating = titleMatch[3] || null;
    
    // 提取其他信息
    let id = null;
    let note = null;
    let link = null;
    let addedAt = null;
    
    lines.slice(1).forEach(line => {
      if (line.includes('豆瓣ID：')) {
        id = line.match(/豆瓣ID：(\d+)/)?.[1];
      } else if (line.includes('备注：')) {
        note = line.replace(/.*备注：/, '').trim();
      } else if (line.includes('豆瓣：')) {
        link = line.replace(/.*豆瓣：/, '').trim();
      }
    });
    
    // 从标题上方找日期（## YYYY-MM-DD）
    const dateMatch = content.match(new RegExp(`## (\\d{4}-\\d{2}-\\d{2})\\n[^]*?- 📺 ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    if (dateMatch) {
      addedAt = new Date(dateMatch[1]).toISOString();
    }
    
    items.push({
      id,
      title,
      rating: rating ? parseFloat(rating) : null,
      link,
      addedAt,
      note
    });
  });
  
  return items;
}

/**
 * 读取可重看清单文件
 */
function getRewatchableFilePath() {
  return path.join(MOVIE_DIR, '可重看清单.md');
}

/**
 * 读取可重看清单 Markdown
 */
function readRewatchableFile() {
  const filePath = getRewatchableFilePath();
  
  if (!fs.existsSync(filePath)) {
    return '# 可重看清单\n\n';
  }
  
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入可重看清单 Markdown
 */
function writeRewatchableFile(content) {
  const filePath = getRewatchableFilePath();
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 获取可重看的电影 ID 列表
 */
function getRewatchableIds() {
  const content = readRewatchableFile();
  const ids = [];
  
  const matches = content.matchAll(/\((\d+)\)/g);
  for (const match of matches) {
    ids.push(match[1]);
  }
  
  return ids;
}

/**
 * 标记为可重看
 */
function markRewatchable(movieId) {
  const allMovies = getAllMovies();
  const movie = allMovies.find(m => m.id === movieId);
  
  if (!movie) {
    console.log(`❌ 找不到电影 ID: ${movieId}`);
    return false;
  }
  
  let content = readRewatchableFile();
  
  // 检查是否已在可重看清单中
  if (content.includes(`(${movieId})`)) {
    console.log(`⚠️  电影《${movie.title}》已在重看列表中`);
    return false;
  }
  
  const entry = `- ${movie.title} (${movieId}) ⭐ ${movie.rating}\n`;
  content += entry;
  
  writeRewatchableFile(content);
  
  console.log(`✅ 已标记为可重看: ${movie.title}`);
  
  // 同时记录到观看历史（如果还没记录）
  const watchedIds = getWatchedIds();
  if (!watchedIds.includes(movieId)) {
    markWatched(movieId, '值得反复看');
  }
  
  return true;
}

// ========== 推荐逻辑 ==========

// 推荐电影（TOP250）
function recommend(options = {}) {
  const {
    count = 5,
    genre = null,
    minRating = null,
    director = null,
    year = null,
    includeRewatchable = true
  } = options;
  
  const allMovies = getAllMovies();
  const watchedIds = getWatchedIds();
  const rewatchableIds = getRewatchableIds();
  
  if (allMovies.length === 0) {
    console.log('❌ 电影数据为空，请先运行: node fetch-top250.js');
    return [];
  }
  
  // 筛选可推荐的电影
  let candidates = allMovies.filter(movie => {
    // 未看过的，或者在重看列表中的
    const isUnwatched = !watchedIds.includes(movie.id);
    const isRewatchable = includeRewatchable && rewatchableIds.includes(movie.id);
    
    if (!isUnwatched && !isRewatchable) {
      return false;
    }
    
    // 类型筛选
    if (genre && movie.genres) {
      const hasGenre = movie.genres.some(g => g.includes(genre));
      if (!hasGenre) return false;
    }
    
    // 评分筛选
    if (minRating && movie.rating < minRating) {
      return false;
    }
    
    // 导演筛选
    if (director && movie.director && !movie.director.includes(director)) {
      return false;
    }
    
    // 年份筛选
    if (year) {
      if (typeof year === 'number' && movie.year !== year) {
        return false;
      }
      if (Array.isArray(year) && !year.includes(movie.year)) {
        return false;
      }
    }
    
    return true;
  });
  
  // 随机打乱
  candidates = candidates.sort(() => Math.random() - 0.5);
  
  // 返回指定数量
  return candidates.slice(0, count);
}

// 搜索电影
function search(keyword) {
  const allMovies = getAllMovies();
  return allMovies.filter(movie => {
    const searchText = [
      movie.title,
      movie.other,
      movie.director,
      ...(movie.actors || []),
      movie.quote
    ].join(' ').toLowerCase();
    
    return searchText.includes(keyword.toLowerCase());
  });
}

// 获取电影详情
function getMovie(movieId) {
  const allMovies = getAllMovies();
  return allMovies.find(m => m.id === movieId);
}

// 统计信息
function stats() {
  const allMovies = getAllMovies();
  const watchedIds = getWatchedIds();
  const rewatchableIds = getRewatchableIds();
  const wishlist = getWishlist();
  
  // 统计观影记录总数（包括自定义影视作品）
  let totalWatched = 0;
  const files = fs.readdirSync(MOVIE_DIR).filter(f => /^\d{4}\.md$/.test(f));
  files.forEach(file => {
    const content = fs.readFileSync(path.join(MOVIE_DIR, file), 'utf-8');
    // 统计 ### 标题（每条观影记录）
    const matches = content.match(/^### /gm);
    if (matches) {
      totalWatched += matches.length;
    }
  });
  
  return {
    total: allMovies.length,
    watched: totalWatched,
    rewatchable: rewatchableIds.length,
    wishlist: wishlist.length,
    unwatched: allMovies.length - watchedIds.length
  };
}

// 推荐热门电影
function recommendHotMovies(count = 10) {
  const trending = getTrending();
  const movies = trending['movie_热门'] || [];
  return movies.slice(0, count);
}

// 推荐最新电影
function recommendNewMovies(count = 10) {
  const trending = getTrending();
  const movies = trending['movie_最新'] || [];
  return movies.slice(0, count);
}

// 推荐热门剧集
function recommendHotTV(count = 10) {
  const trending = getTrending();
  const tvs = trending['tv_热门'] || [];
  return tvs.slice(0, count);
}

// 推荐最新剧集
function recommendNewTV(count = 10) {
  const trending = getTrending();
  const tvs = trending['tv_最新'] || [];
  return tvs.slice(0, count);
}

// ========== 格式化输出 ==========

// 格式化热门/最新影视信息
function formatTrending(item, showDetail = true) {
  const lines = [];
  
  const newBadge = item.isNew ? ' 🆕' : '';
  const playBadge = item.playable ? ' ▶️' : '';
  
  lines.push(`🎬 ${item.title}${newBadge}${playBadge}`);
  
  if (item.rating) {
    lines.push(`   ⭐ 评分: ${item.rating}`);
  } else {
    lines.push(`   ⭐ 暂无评分`);
  }
  
  if (showDetail) {
    if (item.episodes) {
      lines.push(`   📺 ${item.episodes}`);
    }
    lines.push(`   🔗 ${item.url}`);
  }
  
  return lines.join('\n');
}

// 格式化想看清单条目
function formatWishlistItem(item, showDetail = true) {
  const lines = [];
  
  lines.push(`🎬 ${item.title}`);
  
  if (item.rating) {
    lines.push(`   ⭐ 评分: ${item.rating}`);
  }
  
  if (showDetail) {
    if (item.addedAt) {
      const addedDate = new Date(item.addedAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
      lines.push(`   📅 添加时间: ${addedDate}`);
    }
    
    if (item.note) {
      lines.push(`   💬 备注: ${item.note}`);
    }
    
    if (item.link) {
      lines.push(`   🔗 ${item.link}`);
    }
  }
  
  return lines.join('\n');
}

// 格式化电影信息
function formatMovie(movie, showDetail = false) {
  const lines = [];
  
  lines.push(`🎬 ${movie.title} ${movie.other || ''}`);
  lines.push(`   ⭐ 评分: ${movie.rating} (${movie.people}人)`);
  
  if (showDetail) {
    lines.push(`   🎭 导演: ${movie.director || '未知'}`);
    if (movie.actors && movie.actors.length > 0) {
      lines.push(`   👥 主演: ${movie.actors.slice(0, 3).join(' / ')}`);
    }
    lines.push(`   📅 年份: ${movie.year || '未知'}`);
    if (movie.genres && movie.genres.length > 0) {
      lines.push(`   🏷️  类型: ${movie.genres.join(' / ')}`);
    }
    if (movie.quote) {
      lines.push(`   💬 ${movie.quote}`);
    }
    lines.push(`   🔗 ${movie.link}`);
  }
  
  return lines.join('\n');
}

// ========== 命令行接口 ==========

function cli() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help') {
    console.log(`
🎬 豆瓣电影管理工具（数据存储：Obsidian Markdown）

用法:
  node movie.js <命令> [选项]

命令:
  【📺 发现模块 - 找新片看什么】
  
  TOP250 经典推荐:
    recommend [count]              推荐电影 (默认 5 部)
    recommend --genre 类型         按类型推荐 (如: 剧情、喜剧、科幻)
    recommend --rating 评分        按最低评分推荐 (如: 9.0)
    recommend --director 导演      按导演推荐
  
  热门和最新:
    hot [count]                    推荐热门电影 (默认 10 部)
    new [count]                    推荐最新电影 (默认 10 部)
    hot-tv [count]                 推荐热门剧集 (默认 10 部)
    new-tv [count]                 推荐最新剧集 (默认 10 部)
  
  【📝 观影记录模块 - 管理自己的观影】
  
  想看清单:
    wish <标题或ID> [备注]         添加到想看清单
    wishlist                       查看想看清单
    unwish <标题或ID>              从想看清单删除
  
  观看记录:
    watched <标题或ID> [备注]      标记已观看（自动从想看清单删除）
    rewatchable <电影ID>           标记为可重看
  
  【🔍 其他】
  search <关键词>                搜索电影
  movie <电影ID>                 查看电影详情
  stats                          查看统计信息
  help                           显示此帮助信息

数据存储位置:
  参考库（JSON）:  skills/douban-movie/data/
  用户数据（MD）:  GeekMaiOB/30-运行记录/观影记录/

示例:
  node movie.js hot 5
  node movie.js wish "爱、死亡与机器人" "Netflix 科幻剧集"
  node movie.js wishlist
  node movie.js watched "爱、死亡与机器人" "非常震撼"
`);
    return;
  }
  
  switch (command) {
    case 'recommend': {
      const count = parseInt(args[1]) || 5;
      const options = { count };
      
      // 解析选项
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--genre' && args[i + 1]) {
          options.genre = args[i + 1];
        }
        if (args[i] === '--rating' && args[i + 1]) {
          options.minRating = parseFloat(args[i + 1]);
        }
        if (args[i] === '--director' && args[i + 1]) {
          options.director = args[i + 1];
        }
      }
      
      const movies = recommend(options);
      
      if (movies.length === 0) {
        console.log('😔 没有找到符合条件的电影');
      } else {
        console.log(`\n🎯 为你推荐 ${movies.length} 部电影:\n`);
        movies.forEach((movie, i) => {
          console.log(`${i + 1}. ${formatMovie(movie, true)}\n`);
        });
      }
      break;
    }
    
    case 'search': {
      const keyword = args[1];
      if (!keyword) {
        console.log('❌ 请提供搜索关键词');
        break;
      }
      
      const movies = search(keyword);
      
      if (movies.length === 0) {
        console.log(`😔 没有找到包含"${keyword}"的电影`);
      } else {
        console.log(`\n🔍 找到 ${movies.length} 部电影:\n`);
        movies.forEach((movie, i) => {
          console.log(`${i + 1}. ${formatMovie(movie, true)}\n`);
        });
      }
      break;
    }
    
    case 'watched': {
      const titleOrId = args[1];
      const note = args.slice(2).join(' ');
      
      if (!titleOrId) {
        console.log('❌ 请提供电影标题或 ID');
        break;
      }
      
      markWatched(titleOrId, note || null);
      break;
    }
    
    case 'rewatchable': {
      const movieId = args[1];
      
      if (!movieId) {
        console.log('❌ 请提供电影 ID');
        break;
      }
      
      markRewatchable(movieId);
      break;
    }
    
    case 'movie': {
      const movieId = args[1];
      
      if (!movieId) {
        console.log('❌ 请提供电影 ID');
        break;
      }
      
      const movie = getMovie(movieId);
      
      if (!movie) {
        console.log(`❌ 找不到电影 ID: ${movieId}`);
      } else {
        console.log(`\n${formatMovie(movie, true)}\n`);
      }
      break;
    }
    
    case 'stats': {
      const s = stats();
      console.log(`
📊 统计信息:

【📺 发现模块】
   📚 豆瓣 TOP250: ${s.total} 部
   📝 未观看: ${s.unwatched} 部

【📝 观影记录模块】
   💭 想看清单: ${s.wishlist} 部
   ✅ 已观看: ${s.watched} 部
   ⭐ 可重看: ${s.rewatchable} 部
   🎯 观看进度: ${((s.watched / s.total) * 100).toFixed(1)}%
`);
      break;
    }
    
    case 'wish': {
      const titleOrId = args[1];
      const note = args.slice(2).join(' ');
      
      if (!titleOrId) {
        console.log('❌ 请提供电影标题或 ID');
        break;
      }
      
      addToWishlist(titleOrId, note || null);
      break;
    }
    
    case 'wishlist': {
      const wishlist = getWishlist();
      
      if (wishlist.length === 0) {
        console.log('📭 想看清单为空');
      } else {
        console.log(`\n💭 想看清单 (${wishlist.length} 部):\n`);
        wishlist.forEach((item, i) => {
          console.log(`${i + 1}. ${formatWishlistItem(item, true)}\n`);
        });
      }
      break;
    }
    
    case 'unwish': {
      const idOrTitle = args.slice(1).join(' ');
      
      if (!idOrTitle) {
        console.log('❌ 请提供电影标题或 ID');
        break;
      }
      
      removeFromWishlist(idOrTitle);
      break;
    }
    
    case 'hot': {
      const count = parseInt(args[1]) || 10;
      const movies = recommendHotMovies(count);
      const updatedAt = getTrendingUpdatedAt();
      
      if (movies.length === 0) {
        console.log('😔 暂无热门电影数据，请先运行: node fetch-trending.js');
      } else {
        console.log(`\n🔥 热门电影推荐 (${movies.length} 部):\n`);
        movies.forEach((movie, i) => {
          console.log(`${i + 1}. ${formatTrending(movie, true)}\n`);
        });
        
        if (updatedAt) {
          const updateTime = new Date(updatedAt).toLocaleString('zh-CN');
          console.log(`📅 数据更新时间: ${updateTime}`);
        }
      }
      break;
    }
    
    case 'new': {
      const count = parseInt(args[1]) || 10;
      const movies = recommendNewMovies(count);
      const updatedAt = getTrendingUpdatedAt();
      
      if (movies.length === 0) {
        console.log('😔 暂无最新电影数据，请先运行: node fetch-trending.js');
      } else {
        console.log(`\n🆕 最新电影推荐 (${movies.length} 部):\n`);
        movies.forEach((movie, i) => {
          console.log(`${i + 1}. ${formatTrending(movie, true)}\n`);
        });
        
        if (updatedAt) {
          const updateTime = new Date(updatedAt).toLocaleString('zh-CN');
          console.log(`📅 数据更新时间: ${updateTime}`);
        }
      }
      break;
    }
    
    case 'hot-tv': {
      const count = parseInt(args[1]) || 10;
      const tvs = recommendHotTV(count);
      const updatedAt = getTrendingUpdatedAt();
      
      if (tvs.length === 0) {
        console.log('😔 暂无热门剧集数据，请先运行: node fetch-trending.js');
      } else {
        console.log(`\n🔥 热门剧集推荐 (${tvs.length} 部):\n`);
        tvs.forEach((tv, i) => {
          console.log(`${i + 1}. ${formatTrending(tv, true)}\n`);
        });
        
        if (updatedAt) {
          const updateTime = new Date(updatedAt).toLocaleString('zh-CN');
          console.log(`📅 数据更新时间: ${updateTime}`);
        }
      }
      break;
    }
    
    case 'new-tv': {
      const count = parseInt(args[1]) || 10;
      const tvs = recommendNewTV(count);
      const updatedAt = getTrendingUpdatedAt();
      
      if (tvs.length === 0) {
        console.log('😔 暂无最新剧集数据，请先运行: node fetch-trending.js');
      } else {
        console.log(`\n🆕 最新剧集推荐 (${tvs.length} 部):\n`);
        tvs.forEach((tv, i) => {
          console.log(`${i + 1}. ${formatTrending(tv, true)}\n`);
        });
        
        if (updatedAt) {
          const updateTime = new Date(updatedAt).toLocaleString('zh-CN');
          console.log(`📅 数据更新时间: ${updateTime}`);
        }
      }
      break;
    }
    
    default:
      console.log(`❌ 未知命令: ${command}`);
      console.log('使用 "node movie.js help" 查看帮助');
  }
}

// 如果直接运行，启动命令行
if (require.main === module) {
  cli();
}

// 导出函数供其他模块使用
module.exports = {
  recommend,
  markWatched,
  markRewatchable,
  search,
  getMovie,
  stats,
  formatMovie,
  recommendHotMovies,
  recommendNewMovies,
  recommendHotTV,
  recommendNewTV,
  formatTrending,
  getTrendingUpdatedAt,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  formatWishlistItem
};
