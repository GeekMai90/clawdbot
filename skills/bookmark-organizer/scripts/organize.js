#!/usr/bin/env node
/**
 * Bookmark Organizer - 自动整理 Obsidian 书签
 * 合并版：Claude Code 分析逻辑 + 文件读写操作
 *
 * 用法：
 *   --list-inbox            列出 99 收集箱中的条目
 *   --list-sections         列出所有分类及条目数
 *   --auto                  自动整理收集箱（分类+补全alias/tags），写入文件
 *   --dry-run               预览自动整理结果，不写入
 *   --apply --move "名" --to "分类" [--alias "x"] [--tags "x, y"]
 *                           手动移动单条并补全字段
 *   --add-entry "名|别名|分类|URL|标签"
 *                           直接新增一条书签
 */

const fs = require('fs');
const path = require('path');

// ─── 配置 ────────────────────────────────────────────────────────────────────

const VAULT = '/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB';
const BOOKMARK_FILE = path.join(VAULT, '50-资源资料/书签/bookmarks.md');
const INBOX_SECTION = '收集箱';
const TODAY = new Date().toISOString().slice(0, 10);

// 11 个分类结构
const CATEGORIES = {
  '00': '常用', '01': '项目与工作', '02': '学习与课程', '03': '开发与技术',
  '04': 'AI 与自动化', '05': '内容创作', '06': '资源素材', '07': '资讯与阅读',
  '08': '效率工具', '09': '社区与平台', '10': '生活服务', '99': '收集箱'
};

// 核心 Tag 清单（30个，分组）
const CORE_TAGS = {
  contentType: ['工具', '课程', '文档', '文章', '视频', '社区', '资源', '平台', '项目'],
  domain:      ['AI', '编程', '设计', '效率', '写作', '商业', '产品', '数据', '运营', '教育'],
  purpose:     ['学习', '参考', '资讯', '灵感', '素材', '收藏'],
  technical:   ['API', '自动化', '开源', '插件', '工作流']
};
const ALL_TAGS = Object.values(CORE_TAGS).flat();

// 分类判断关键词（按优先级，顺序很重要）
const CATEGORY_KEYWORDS = {
  '04': ['ai', 'gpt', 'chatgpt', 'claude', 'gemini', 'midjourney', '人工智能', 'llm', 'openai', 'airbrush', 'notebooklm'],
  '03': ['github', 'api', '开发', '代码', '技术文档', 'docs', 'developer', '编程', 'mongodb', 'vue', 'react', 'bootstrap', 'css', 'html', 'js', 'node'],
  '06': ['pixabay', 'pexels', 'unsplash', '素材', '字体', '图标', 'iconfont', 'flaticon', 'iconpark', 'font awesome', '图片素材', '矢量'],
  '02': ['课程', '教程', 'udemy', 'coursera', '学习平台', 'training', '教学', '慕课', '网易云课堂'],
  '05': ['公众号', '写作', '剪辑', '设计工具', '内容创作', '视频编辑', '封面', '排版'],
  '07': ['博客', '新闻', '资讯', '研究', 'blog', 'news', 'rss', '电子书', '阅读'],
  '08': ['转换', '在线编辑', '小工具', 'tool', 'converter', 'snippet', '正则', '代码片段'],
  '09': ['论坛', '社区', 'reddit', 'discord', '贴吧', 'forum', 'community', '掘金', 'bilibili', 'b站', 'youtube'],
  '01': ['公司', '项目', '管理系统', '后台', '企业', '业务', '飞书', 'notion', '工作流'],
  '10': ['购物', '地图', '天气', '旅游', '娱乐', '生活']
};

// Tag 识别关键词
const TAG_KEYWORDS = {
  '工具':  ['工具', 'tool', '在线', 'online', 'app', 'generator', '生成器'],
  '课程':  ['课程', 'course', '教程', 'tutorial', '培训', '学习视频'],
  '文档':  ['文档', 'docs', 'documentation', '手册', 'reference', 'mdn'],
  '文章':  ['博客', 'blog', 'article', '文章', 'post'],
  '视频':  ['视频', 'video', 'youtube', 'bilibili', 'b站'],
  '社区':  ['社区', 'community', '论坛', 'forum', 'discord', '掘金'],
  '资源':  ['素材', '资源', 'resource', '下载', '模板'],
  '平台':  ['平台', 'platform', '服务', 'service', '网盘'],
  '项目':  ['项目', 'project', 'github', '开源项目'],
  'AI':    ['ai', 'gpt', 'claude', 'gemini', '人工智能', 'llm', 'openai', 'chatgpt'],
  '编程':  ['编程', '代码', 'code', 'github', '开发', 'programming', 'javascript', 'python'],
  '设计':  ['设计', 'design', 'ui', 'ux', '图片', '图标', '字体', '配色', '矢量'],
  '效率':  ['效率', '生产力', 'productivity', '工作流', 'keyboard maestro', '自动化'],
  '写作':  ['写作', 'writing', '公众号', '文章', '内容创作', '笔记'],
  '商业':  ['商业', '赚钱', '模式', 'business', 'appsumo'],
  '产品':  ['产品', 'product', '产品设计'],
  '数据':  ['数据', 'data', '分析', 'analytics'],
  '运营':  ['运营', '增长', '流量', 'growth', 'marketing', 'seo'],
  '教育':  ['教育', '学习', '教学', 'education', '课程'],
  '学习':  ['学习', 'learn', '课程', '教程', '教学'],
  '参考':  ['参考', 'reference', '文档', '手册', '工具'],
  '资讯':  ['资讯', '新闻', 'news', '行业', '博客', 'rss'],
  '灵感':  ['灵感', 'inspiration', '创意', '设计参考'],
  '素材':  ['素材', 'material', '图片', '字体', '资源', '音效'],
  '收藏':  ['收藏', 'bookmark'],
  'API':   ['api', '接口', 'sdk', 'restful'],
  '自动化':['自动化', 'automation', '自动', 'workflow', 'zapier'],
  '开源':  ['开源', 'open source', 'github', 'opensource'],
  '插件':  ['插件', 'plugin', 'extension', '扩展'],
  '工作流':['工作流', 'workflow', '流程', 'pipeline']
};

// ─── 自动分析逻辑 ─────────────────────────────────────────────────────────────

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function generateAlias(bookmark) {
  if (bookmark.alias && bookmark.alias.trim()) return bookmark.alias;
  const domain = extractDomain(bookmark.url);
  return domain || bookmark.name.substring(0, 20);
}

function matchTags(text, maxTags = 4) {
  const lower = text.toLowerCase();
  const matched = [];
  const order = [...CORE_TAGS.contentType, ...CORE_TAGS.domain, ...CORE_TAGS.purpose, ...CORE_TAGS.technical];
  for (const tag of order) {
    if (matched.length >= maxTags) break;
    const kws = TAG_KEYWORDS[tag] || [];
    if (kws.some(k => lower.includes(k.toLowerCase()))) matched.push(tag);
  }
  if (matched.length === 0) matched.push('收藏');
  if (matched.length === 1) matched.push('参考');
  return matched.slice(0, maxTags);
}

function validateTags(tags) {
  if (!tags || !tags.trim()) return false;
  const list = tags.split(',').map(t => t.trim()).filter(Boolean);
  return list.length >= 2 && list.length <= 4 && list.every(t => ALL_TAGS.includes(t));
}

function determineCategory(bookmark) {
  const text = `${bookmark.name} ${bookmark.url} ${bookmark.alias || ''}`.toLowerCase();
  for (const [id, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return `${id} ${CATEGORIES[id]}`;
  }
  return null; // 无法判断，保持在收集箱
}

// ─── 文件解析 ─────────────────────────────────────────────────────────────────

function parseBookmarks(content) {
  const lines = content.split('\n');
  const result = { header: [], sections: [] };
  let i = 0;

  while (i < lines.length && !lines[i].startsWith('## ')) {
    result.header.push(lines[i]);
    i++;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      const section = { heading: line.slice(3).trim(), entries: [] };
      i++;
      while (i < lines.length && !lines[i].startsWith('## ')) {
        const l = lines[i];
        if (l.match(/^- name::/)) {
          const entry = { name: l.replace(/^- name::/, '').trim() };
          i++;
          while (i < lines.length) {
            const fl = lines[i];
            if (fl.match(/^- name::/) || fl.startsWith('## ')) break;
            if (fl.trim() === '') { i++; break; }
            const fm = fl.match(/^\s+(alias|url|tags|saved)::\s*(.*)$/);
            if (fm) entry[fm[1]] = fm[2].trim();
            i++;
          }
          if (entry.name || entry.url) section.entries.push(entry);
          continue;
        }
        i++;
      }
      result.sections.push(section);
      continue;
    }
    i++;
  }
  return result;
}

function serializeEntry(e) {
  return [
    `- name:: ${e.name || ''}`,
    `  alias:: ${e.alias || ''}`,
    `  url:: ${e.url || ''}`,
    `  tags:: ${e.tags || ''}`,
    `  saved:: ${e.saved || TODAY}`,
  ].join('\n');
}

function serialize(parsed) {
  const parts = [];
  const header = parsed.header.join('\n').trimEnd();
  if (header) { parts.push(header); parts.push(''); }
  for (const section of parsed.sections) {
    parts.push(`## ${section.heading}`);
    parts.push('');
    for (const entry of section.entries) {
      parts.push(serializeEntry(entry));
      parts.push('');
    }
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : null;
}

const content = fs.readFileSync(BOOKMARK_FILE, 'utf8');
const parsed = parseBookmarks(content);

// --list-sections
if (args.includes('--list-sections')) {
  console.log('📂 当前分类：');
  for (const s of parsed.sections)
    console.log(`  ${s.heading.padEnd(18)} (${s.entries.length} 条)`);
  process.exit(0);
}

// --list-inbox
if (args.includes('--list-inbox')) {
  const inbox = parsed.sections.find(s => s.heading === INBOX_SECTION);
  if (!inbox || !inbox.entries.length) { console.log('✅ 收集箱为空。'); process.exit(0); }
  console.log(`📥 [${INBOX_SECTION}] (${inbox.entries.length} 条)\n`);
  for (const e of inbox.entries) {
    console.log(`  名称：${e.name}`);
    console.log(`  URL ：${e.url}`);
    console.log(`  alias：${e.alias || '（空）'}`);
    console.log(`  tags ：${e.tags || '（空）'}`);
    console.log('');
  }
  process.exit(0);
}

// --auto 或 --dry-run：自动整理收集箱
if (args.includes('--auto') || args.includes('--dry-run')) {
  const dryRun = args.includes('--dry-run');
  const inbox = parsed.sections.find(s => s.heading === INBOX_SECTION);

  if (!inbox || !inbox.entries.length) {
    console.log('✅ 收集箱为空，无需整理。');
    process.exit(0);
  }

  console.log(`${dryRun ? '🔍 预览' : '🔧 执行'}整理（${inbox.entries.length} 条）\n`);

  const toMove = []; // { entry, targetSection }
  const report = [];

  for (const entry of [...inbox.entries]) {
    const changes = [];

    // 补全 alias
    if (!entry.alias || !entry.alias.trim()) {
      const newAlias = generateAlias(entry);
      changes.push(`alias: （空） → ${newAlias}`);
      if (!dryRun) entry.alias = newAlias;
    }

    // 补全/修复 tags
    if (!validateTags(entry.tags)) {
      const text = `${entry.name} ${entry.alias || ''} ${entry.url}`;
      const newTags = matchTags(text).join(', ');
      changes.push(`tags: ${entry.tags || '（空）'} → ${newTags}`);
      if (!dryRun) entry.tags = newTags;
    }

    if (!entry.saved) { if (!dryRun) entry.saved = TODAY; }

    // 自动分类
    const targetSection = determineCategory(entry);
    if (targetSection) {
      changes.push(`分类: ${INBOX_SECTION} → ${targetSection}`);
      if (!dryRun) toMove.push({ entry, targetSection });
    } else {
      changes.push('分类: 无法判断，保留在收集箱');
    }

    report.push({ name: entry.name, changes });
  }

  // 执行移动
  if (!dryRun) {
    for (const { entry, targetSection } of toMove) {
      inbox.entries = inbox.entries.filter(e => e !== entry);
      let target = parsed.sections.find(s => s.heading === targetSection);
      if (!target) {
        target = { heading: targetSection, entries: [] };
        const inboxIdx = parsed.sections.findIndex(s => s.heading === INBOX_SECTION);
        parsed.sections.splice(inboxIdx, 0, target);
      }
      target.entries.push(entry);
    }
    fs.writeFileSync(BOOKMARK_FILE, serialize(parsed), 'utf8');
  }

  // 输出报告
  for (let i = 0; i < report.length; i++) {
    const r = report[i];
    console.log(`${i + 1}. ${r.name}`);
    r.changes.forEach(c => console.log(`   - ${c}`));
    console.log('');
  }

  const moved = toMove.length || report.filter(r => r.changes.some(c => c.includes('分类:') && !c.includes('无法判断'))).length;
  console.log(`${dryRun ? '📋 预览完成' : '✅ 整理完成'}：${report.length} 条处理，${moved} 条已分类`);
  process.exit(0);
}

// --apply --move "名" --to "分类" [--alias] [--tags]
if (args.includes('--apply')) {
  const moveName = getArg('--move');
  const toSection = getArg('--to');
  if (!moveName || !toSection) { console.error('需要 --move "名称" --to "目标分类"'); process.exit(1); }

  let found = null, fromSection = null;
  for (const section of parsed.sections) {
    const idx = section.entries.findIndex(e => e.name === moveName || (e.name && e.name.includes(moveName)));
    if (idx !== -1) { found = { ...section.entries[idx] }; section.entries.splice(idx, 1); fromSection = section.heading; break; }
  }
  if (!found) { console.error(`❌ 未找到：${moveName}`); process.exit(1); }

  const newAlias = getArg('--alias');
  const newTags = getArg('--tags');
  if (newAlias) found.alias = newAlias;
  if (newTags) found.tags = newTags;
  if (!found.alias) found.alias = generateAlias(found);
  if (!validateTags(found.tags)) found.tags = matchTags(`${found.name} ${found.url}`).join(', ');
  if (!found.saved) found.saved = TODAY;

  let target = parsed.sections.find(s => s.heading === toSection);
  if (!target) {
    target = { heading: toSection, entries: [] };
    const inboxIdx = parsed.sections.findIndex(s => s.heading === INBOX_SECTION);
    parsed.sections.splice(inboxIdx >= 0 ? inboxIdx : parsed.sections.length, 0, target);
    console.log(`🆕 新建分类：${toSection}`);
  }
  target.entries.push(found);
  fs.writeFileSync(BOOKMARK_FILE, serialize(parsed), 'utf8');
  console.log(`✅ 「${found.name}」：${fromSection} → ${toSection}`);
  console.log(`   alias: ${found.alias}  tags: ${found.tags}`);
  process.exit(0);
}

// --add-entry "名|别名|分类|URL|标签"
if (args.includes('--add-entry')) {
  const raw = getArg('--add-entry');
  if (!raw) { console.error('缺少参数'); process.exit(1); }
  const [name, alias, category, url, tags] = raw.split('|');
  if (!name || !url || !category) { console.error('格式：名|别名|分类|URL|标签'); process.exit(1); }
  const entry = { name, alias: alias || extractDomain(url), url, tags: tags || matchTags(`${name} ${url}`).join(', '), saved: TODAY };
  let target = parsed.sections.find(s => s.heading === category);
  if (!target) {
    target = { heading: category, entries: [] };
    const inboxIdx = parsed.sections.findIndex(s => s.heading === INBOX_SECTION);
    parsed.sections.splice(inboxIdx >= 0 ? inboxIdx : parsed.sections.length, 0, target);
  }
  target.entries.push(entry);
  fs.writeFileSync(BOOKMARK_FILE, serialize(parsed), 'utf8');
  console.log(`✅ 已添加「${name}」→「${category}」  tags: ${entry.tags}`);
  process.exit(0);
}

console.log(`用法:
  --list-inbox
  --list-sections
  --dry-run                          预览自动整理
  --auto                             自动整理收集箱（写入文件）
  --apply --move "名" --to "分类" [--alias "x"] [--tags "x, y"]
  --add-entry "名|别名|分类|URL|标签"`);
