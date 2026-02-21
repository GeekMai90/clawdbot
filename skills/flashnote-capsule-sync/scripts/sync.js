#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const VAULT = '/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB';
const BASE_DIR = path.join(VAULT, '00-收集区/闪念笔记');
const SOURCE_DIRS = [path.join(BASE_DIR, 'dinox'), path.join(BASE_DIR, 'voicenotes')];
const CAPSULE = path.join(BASE_DIR, '闪念胶囊.md');
const STATE = path.join('/Users/geekmai/clawd/skills/flashnote-capsule-sync/data', 'processed-files.json');

const args = new Set(process.argv.slice(2));
const isBootstrap = args.has('--bootstrap');
const allowBackfill = args.has('--backfill');
const reportJson = args.has('--report-json');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadState() {
  if (!fs.existsSync(STATE)) {
    return { version: 1, createdAt: new Date().toISOString(), processed: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  } catch {
    return { version: 1, createdAt: new Date().toISOString(), processed: {} };
  }
}

function saveState(state) {
  ensureDir(STATE);
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2), 'utf8');
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && full.toLowerCase().endsWith('.md')) {
        out.push(full);
      }
    }
  }
  return out;
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n?/u, '');
}

function cleanLine(line) {
  return line
    .replace(/^#{1,6}\s+/u, '')
    .replace(/^[-*+]\s+/u, '')
    .replace(/^\d+\.\s+/u, '')
    .replace(/\[\[(.*?)\]\]/gu, '$1')
    .replace(/`([^`]+)`/gu, '$1')
    .trim();
}

function extractTranscriptSection(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^\s*#{1,6}\s*transcript\s*$/iu.test(l));
  if (start === -1) return '';

  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (/^\s*#{1,6}\s*related\s+notes\s*$/iu.test(raw)) break;
    if (/^\s*#{1,6}\s+/u.test(raw) && !/^\s*#{1,6}\s*transcript\s*$/iu.test(raw)) break;
    const c = cleanLine(raw);
    if (!c) {
      if (out.length && out[out.length - 1] !== '\n') out.push('\n');
      continue;
    }
    if (/^date\s*:/iu.test(c)) continue;
    out.push(c);
  }

  return out.join(' ').replace(/\s+\n\s+/g, '\n').replace(/\s{2,}/g, ' ').trim();
}

function extractMainContent(raw, sourcePath) {
  const text = stripFrontmatter(raw).replace(/\r/g, '');

  // voicenotes 文件优先提取 Transcript 段落，避免把标题/日期带进去
  if (sourcePath.includes(`${path.sep}voicenotes${path.sep}`)) {
    const t = extractTranscriptSection(text);
    if (t) return t.length > 420 ? `${t.slice(0, 420).trim()}…` : t;
  }

  const lines = text.split('\n').map(cleanLine).filter(Boolean);
  if (!lines.length) return '';

  const paragraphs = [];
  let buf = [];
  for (const line of text.split('\n')) {
    const c = cleanLine(line);
    if (!c) {
      if (buf.length) {
        paragraphs.push(buf.join(' '));
        buf = [];
      }
      continue;
    }
    if (/^date\s*:/iu.test(c)) continue;
    buf.push(c);
  }
  if (buf.length) paragraphs.push(buf.join(' '));

  let picked = (paragraphs[0] || lines[0] || '').trim();
  if (picked.length < 40 && paragraphs[1]) {
    picked = `${picked} ${paragraphs[1]}`.trim();
  }

  if (picked.length > 420) {
    picked = `${picked.slice(0, 420).trim()}…`;
  }
  return picked;
}

function formatCNDateTime(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}年${m}月${d}日 ${hh}:${mm}`;
}

function fileKey(absPath) {
  return path.relative(BASE_DIR, absPath);
}

function appendEntries(entries) {
  ensureDir(CAPSULE);
  if (!fs.existsSync(CAPSULE)) fs.writeFileSync(CAPSULE, '', 'utf8');

  const chunks = entries.map((e) => `${e.title}\n${e.body}`);
  const block = `\n\n${chunks.join('\n\n')}`;
  fs.appendFileSync(CAPSULE, block, 'utf8');
}

function main() {
  const state = loadState();
  const allFiles = SOURCE_DIRS.flatMap(listMarkdownFiles).sort((a, b) => {
    const sa = fs.statSync(a);
    const sb = fs.statSync(b);
    return sa.mtimeMs - sb.mtimeMs;
  });

  const hasExistingState = fs.existsSync(STATE) && Object.keys(state.processed || {}).length > 0;
  const shouldBootstrap = isBootstrap || (!hasExistingState && !allowBackfill);

  if (shouldBootstrap) {
    for (const file of allFiles) {
      const st = fs.statSync(file);
      const key = fileKey(file);
      state.processed[key] = {
        size: st.size,
        mtimeMs: st.mtimeMs,
        bootstrappedAt: new Date().toISOString(),
      };
    }
    saveState(state);
    if (reportJson) {
      console.log(JSON.stringify({ mode: 'bootstrap', bootstrapped: allFiles.length, added: 0, byFolder: { dinox: 0, voicenotes: 0 } }));
    } else {
      console.log(`Bootstrapped ${allFiles.length} files. No capsule changes.`);
    }
    return;
  }

  const newFiles = allFiles.filter((file) => !state.processed[fileKey(file)]);
  if (!newFiles.length) {
    if (reportJson) {
      console.log(JSON.stringify({ mode: 'sync', added: 0, byFolder: { dinox: 0, voicenotes: 0 } }));
    } else {
      console.log('No new notes found.');
    }
    return;
  }

  const entries = [];
  for (const file of newFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const st = fs.statSync(file);
    const key = fileKey(file);
    const body = extractMainContent(raw, file) || `（无可提取正文，来源：${path.basename(file)}）`;
    const title = formatCNDateTime(new Date(st.mtimeMs));
    entries.push({ title, body, file: key });

    state.processed[key] = {
      size: st.size,
      mtimeMs: st.mtimeMs,
      processedAt: new Date().toISOString(),
      title,
      preview: body.slice(0, 80),
    };
  }

  appendEntries(entries);
  saveState(state);

  const byFolder = { dinox: 0, voicenotes: 0 };
  for (const e of entries) {
    if (e.file.startsWith('dinox/')) byFolder.dinox += 1;
    else if (e.file.startsWith('voicenotes/')) byFolder.voicenotes += 1;
  }

  if (reportJson) {
    console.log(JSON.stringify({ mode: 'sync', added: entries.length, byFolder }));
  } else {
    console.log(`Added ${entries.length} new entries to 闪念胶囊.md`);
    for (const e of entries) {
      console.log(`- ${e.file}`);
    }
  }
}

main();