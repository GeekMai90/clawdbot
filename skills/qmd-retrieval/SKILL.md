---
name: qmd-retrieval
description: Add local hybrid retrieval (BM25 + vector + rerank) to OpenClaw via qmd. Use when you need to search or recall info from the OpenClaw workspace files (MEMORY.md, memory/*.md, skills/*/SKILL.md, tutorials) without dumping everything into the prompt. Prefer qmd query/search/vsearch before answering questions about prior context.
---

# QMD Retrieval (OpenClaw)

## Prereqs (this machine)
- Bun installed via Homebrew tap `oven-sh/bun`
- qmd installed via bun global install
- qmd models cached under `~/.cache/qmd/models`

## PATH
In non-interactive shells, ensure qmd is on PATH:

```bash
export PATH="$HOME/.bun/bin:$PATH"
```

## Collections
- `openclaw-workspace`: `/Users/geekmai/clawd` (mask: `**/*.md`)
  - Includes: MEMORY.md, daily memory logs, skills SKILL.md, local docs/tutorials.

## Recommended flow
Prefer MCP via `mcporter` (structured + stable) when available.

1) High-quality retrieval (hybrid + local rerank):

```bash
cd /Users/geekmai/clawd
mcporter call qmd.query --args '{"query":"<question>","limit":10,"collection":"openclaw-workspace"}'
```

2) If you need exact keyword match (fast):

```bash
mcporter call qmd.search --args '{"query":"<keyword>","limit":20,"collection":"openclaw-workspace"}'
```

3) If you need semantic match (fast, requires embeddings):

```bash
mcporter call qmd.vsearch --args '{"query":"<question>","limit":20,"collection":"openclaw-workspace"}'
```

4) Pull the document content for top results:

```bash
mcporter call qmd.get --args '{"file":"<path or #docid>","maxLines":120,"lineNumbers":true}'
```

5) Answer using only the retrieved snippets; do NOT paste entire files.

### Notes on `qmd.query` stability
If you see reranker context overflow errors, keep `limit` small and/or fall back to `search`/`vsearch` + `get`.
(We patched qmd MCP query to cap candidates + truncate rerank text for stability on this machine.)

## Maintenance
When files change significantly:

```bash
qmd update
qmd embed   # only needed when new/changed files need vectors
```

## Notes
- `qmd query` is the best quality: hybrid retrieval + query expansion + local rerank.
- Keep token use low: retrieve only the few relevant snippets.
