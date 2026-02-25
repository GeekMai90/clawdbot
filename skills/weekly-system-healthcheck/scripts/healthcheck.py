#!/usr/bin/env python3
"""
weekly-system-healthcheck.py
OpenClaw 系统每周自检脚本，输出 JSON 报告供 agent 格式化发送。
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path("/Users/geekmai/clawd")
OPENCLAW_STATE = Path.home() / ".openclaw"
CRON_JOBS_FILE = OPENCLAW_STATE / "cron/jobs.json"

issues = []      # 🔴 需要人工确认的问题
warnings = []    # 🟡 异常但不紧急
auto_fixed = []  # ✅ 已自动修复
ok_items = []    # 🟢 正常

# 时间敏感型 job（提醒类），必须 wakeMode=now
TIME_SENSITIVE_JOBS = {
    "daily_weather_changchun",
    "daily_lunch_reminder",
    "daily_diary_reminder",
    "monthly_bookkeeping_summary",
}


# ─── 1. Cron Jobs 健康检查 ────────────────────────────────────────────
def check_cron_jobs():
    try:
        with open(CRON_JOBS_FILE) as f:
            data = json.load(f)
        jobs = data if isinstance(data, list) else data.get("jobs", [])

        bad_wake_critical = []
        bad_wake_minor = []
        null_next = []
        enabled_count = 0

        for job in jobs:
            name = job.get("name", "unknown")
            wake = job.get("wakeMode", "")
            state = job.get("state", {})
            next_run = state.get("nextRunAtMs")
            enabled = job.get("enabled", True)

            if not enabled:
                continue

            enabled_count += 1

            if wake != "now":
                if name in TIME_SENSITIVE_JOBS:
                    bad_wake_critical.append(f"{name}（wake={wake}）")
                else:
                    bad_wake_minor.append(f"{name}（wake={wake}）")

            if next_run is None:
                null_next.append(name)

        if bad_wake_critical:
            issues.append(
                "时间敏感型 cron job 的 wakeMode 不是 now，提醒可能延迟：\n  "
                + "\n  ".join(bad_wake_critical)
            )
        if bad_wake_minor:
            warnings.append(
                "以下 cron job 使用 next-heartbeat（非时间敏感，可接受，但 now 更佳）：\n  "
                + "\n  ".join(bad_wake_minor)
            )
        if null_next:
            issues.append(
                "以下 cron job 的 nextRunAtMs=null，调度器未初始化：\n  "
                + "\n  ".join(null_next)
            )

        if not bad_wake_critical and not null_next:
            note = f"，另有 {len(bad_wake_minor)} 个 next-heartbeat 非敏感任务" if bad_wake_minor else ""
            ok_items.append(f"Cron Jobs：{enabled_count} 个任务健康{note}")

    except Exception as e:
        issues.append(f"读取 cron 配置失败：{e}")


# ─── 2. 关键文件体积检查 ──────────────────────────────────────────────
def check_file_sizes():
    size_checks = [
        ("memory/core.md",  2560,      "HOT 记忆 core.md"),       # 2.5KB
        ("MEMORY.md",       15 * 1024, "长期记忆 MEMORY.md"),
        ("TOOLS.md",        10 * 1024, "工具快查 TOOLS.md"),
        ("AGENTS.md",       20 * 1024, "Agent 配置 AGENTS.md"),
        ("SOUL.md",         10 * 1024, "灵魂文件 SOUL.md"),
    ]

    for rel_path, limit, label in size_checks:
        fpath = WORKSPACE / rel_path
        if not fpath.exists():
            warnings.append(f"{rel_path} 不存在，请检查")
            continue
        size = fpath.stat().st_size
        kb = round(size / 1024, 1)
        limit_kb = round(limit / 1024, 1)
        if size > limit:
            warnings.append(f"{label} 体积 {kb}KB，超过建议上限 {limit_kb}KB，考虑精简")
        else:
            ok_items.append(f"{label}：{kb}KB / {limit_kb}KB ✓")


# ─── 3. memory/ 旧日志归档 ───────────────────────────────────────────
def check_and_archive_memory():
    memory_dir = WORKSPACE / "memory"
    archive_dir = memory_dir / "_archive"
    today = datetime.now()
    cutoff_str = (today - timedelta(days=30)).strftime("%Y-%m-%d")

    eligible = []
    for f in sorted(memory_dir.glob("20[0-9][0-9]-*.md")):
        fname = f.stem[:10]
        if fname < cutoff_str:
            eligible.append(f)

    if eligible:
        archive_dir.mkdir(exist_ok=True)
        for f in eligible:
            f.rename(archive_dir / f.name)
        auto_fixed.append(f"已归档 {len(eligible)} 个 30 天前的日志文件到 memory/_archive/")
    else:
        ok_items.append("memory/ 归档：无需归档")


# ─── 4. GitHub 备份状态 ──────────────────────────────────────────────
def check_github_backup():
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-1", "--format=%ar | %s"],
            cwd=WORKSPACE, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            ok_items.append(f"GitHub 备份：最近提交 — {result.stdout.strip()}")
        else:
            warnings.append("GitHub 备份：无法获取提交记录，请确认 git remote 配置")

        diff = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=WORKSPACE, capture_output=True, text=True, timeout=10
        )
        changed = [l for l in diff.stdout.strip().split("\n") if l.strip()]
        if changed:
            ok_items.append(f"GitHub 备份：{len(changed)} 个文件待提交，等待今晚 03:00 自动备份")

    except Exception as e:
        warnings.append(f"GitHub 备份检查失败：{e}")


# ─── 5. Workspace 大小（macOS 兼容） ─────────────────────────────────
def check_workspace_size():
    try:
        result = subprocess.run(
            ["du", "-sh", str(WORKSPACE)],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0:
            size_str = result.stdout.split()[0]
            ok_items.append(f"Workspace 总大小：{size_str}")
    except Exception:
        pass


# ─── 6. 关键路径存在性检查 ───────────────────────────────────────────
def check_key_paths():
    VAULT = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"
    key_paths = [
        (VAULT,                                  "Obsidian Vault"),
        (VAULT / "00-收集区",                    "00-收集区"),
        (VAULT / "30-运行记录/私人日记",          "私人日记"),
        (VAULT / "30-运行记录/财务记录",          "财务记录"),
        (WORKSPACE / "skills",                   "skills/"),
        (WORKSPACE / "memory",                   "memory/"),
        (OPENCLAW_STATE / "cron/jobs.json",      "cron/jobs.json"),
    ]
    missing = []
    for p, label in key_paths:
        if not p.exists():
            missing.append(f"{label}（{p}）")
    if missing:
        issues.append("以下关键路径不存在：\n  " + "\n  ".join(missing))
    else:
        ok_items.append("关键路径：全部存在 ✓")


# ─── 7. 技能关键脚本存在性检查 ───────────────────────────────────────
def check_skill_scripts():
    critical_scripts = [
        "skills/bookkeeping/scripts/bookkeeping.js",
        "skills/bookkeeping-monthly-report/scripts/monthly_report.py",
        "skills/memory-backup/backup.sh",
        "skills/weather-morning/scripts/fetch_weather_robust.sh",
        "skills/url-reader/scripts/url_reader.py",
        "skills/weekly-system-healthcheck/scripts/healthcheck.py",
    ]
    missing = []
    for rel in critical_scripts:
        if not (WORKSPACE / rel).exists():
            missing.append(rel)
    if missing:
        warnings.append("以下技能脚本丢失：\n  " + "\n  ".join(missing))
    else:
        ok_items.append(f"技能关键脚本：{len(critical_scripts)} 个均存在 ✓")


# ─── 执行所有检查 ────────────────────────────────────────────────────
check_cron_jobs()
check_file_sizes()
check_and_archive_memory()
check_github_backup()
check_workspace_size()
check_key_paths()
check_skill_scripts()

report = {
    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
    "issues": issues,
    "warnings": warnings,
    "auto_fixed": auto_fixed,
    "ok": ok_items,
    "summary": {
        "issue_count": len(issues),
        "warning_count": len(warnings),
        "auto_fixed_count": len(auto_fixed),
    }
}

print(json.dumps(report, ensure_ascii=False, indent=2))
