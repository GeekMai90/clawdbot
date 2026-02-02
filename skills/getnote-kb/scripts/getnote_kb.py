#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Get笔记知识库 OpenAPI client (stdlib-only).

Supports:
- recall: /knowledge/search/recall
- qa:     /knowledge/search (SSE streaming; parse msg_type)

Secrets (recommended):
- GETNOTE_API_KEY: Bearer token
- GETNOTE_TOPIC_IDS: default topic ids (comma-separated)

Examples:
  GETNOTE_API_KEY=... GETNOTE_TOPIC_IDS=xxx \
    python3 getnote_kb.py recall --question "Anteey 灵感" --top-k 5

  GETNOTE_API_KEY=... GETNOTE_TOPIC_IDS=xxx \
    python3 getnote_kb.py qa --question "我之前为什么想做 Anteey？" --deep-seek true
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

BASE = "https://open-api.biji.com/getnote/openapi"


def _env_api_key() -> str:
    key = os.getenv("GETNOTE_API_KEY", "").strip()
    if not key:
        raise SystemExit("Missing GETNOTE_API_KEY env var")
    return key


def _env_topic_ids() -> List[str]:
    raw = os.getenv("GETNOTE_TOPIC_IDS", "").strip()
    if not raw:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def _headers(api_key: str) -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Authorization": f"Bearer {api_key}",
        "X-OAuth-Version": "1",
        "Accept": "text/event-stream, application/json",
    }


def _http_post(url: str, api_key: str, payload: Dict[str, Any], timeout: int = 60, stream: bool = False):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url=url, data=data, method="POST")
    for k, v in _headers(api_key).items():
        req.add_header(k, v)

    try:
        resp = urllib.request.urlopen(req, timeout=timeout)  # nosec - trusted user config
        return resp
    except urllib.error.HTTPError as e:
        body = ""
        try:
            body = e.read().decode("utf-8", errors="replace")
        except Exception:
            pass
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {body}")


def _post_json(url: str, api_key: str, payload: Dict[str, Any], timeout: int = 60) -> Dict[str, Any]:
    resp = _http_post(url, api_key=api_key, payload=payload, timeout=timeout)
    raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)


def recall(question: str, topic_ids: List[str], top_k: int, api_key: str) -> Dict[str, Any]:
    url = f"{BASE}/knowledge/search/recall"
    payload: Dict[str, Any] = {
        "question": question,
        "top_k": top_k,
    }
    if len(topic_ids) == 1:
        payload["topic_id"] = topic_ids[0]
    elif len(topic_ids) > 1:
        payload["topic_ids"] = topic_ids
    return _post_json(url, api_key=api_key, payload=payload)


# --- SSE parsing for QA ---

def _iter_sse_data_lines(resp) -> str:
    """Yield SSE `data:` payload strings."""
    # resp is http.client.HTTPResponse (file-like)
    while True:
        line = resp.readline()
        if not line:
            break
        try:
            text = line.decode("utf-8", errors="replace").strip()
        except Exception:
            continue
        if not text:
            continue
        if not text.startswith("data:"):
            continue
        yield text[len("data:"):].strip()


def qa_stream(
    question: str,
    topic_ids: List[str],
    api_key: str,
    history: Optional[List[Dict[str, str]]],
    deep_seek: bool,
    refs: bool,
) -> Tuple[str, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Return (answer_text, process_events, refs_list)."""

    url = f"{BASE}/knowledge/search"
    payload: Dict[str, Any] = {
        "question": question,
        "deep_seek": deep_seek,
        "refs": refs,
    }
    if history:
        payload["history"] = history

    if len(topic_ids) == 1:
        payload["topic_ids"] = topic_ids
    elif len(topic_ids) > 1:
        payload["topic_ids"] = topic_ids

    resp = _http_post(url, api_key=api_key, payload=payload, timeout=120)

    answer_chunks: List[str] = []
    process_events: List[Dict[str, Any]] = []
    refs_list: List[Dict[str, Any]] = []

    for data_str in _iter_sse_data_lines(resp):
        if data_str == "[END]":
            break
        try:
            obj = json.loads(data_str)
        except Exception:
            continue

        msg_type = obj.get("msg_type")
        data = obj.get("data") or {}

        if msg_type == 6:
            process_events.append(obj)
        elif msg_type == 105:
            ref_list = (data or {}).get("ref_list") or []
            if isinstance(ref_list, list):
                refs_list.extend(ref_list)
        elif msg_type == 1:
            msg = (data or {}).get("msg")
            if isinstance(msg, str):
                answer_chunks.append(msg)
        elif msg_type == 0:
            err = (data or {}).get("msg")
            raise RuntimeError(f"API error: {err}")

    return ("".join(answer_chunks).strip(), process_events, refs_list)


def _print_json(obj: Any):
    json.dump(obj, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    ap_recall = sub.add_parser("recall", help="Recall top-k relevant snippets")
    ap_recall.add_argument("--question", required=True)
    ap_recall.add_argument("--top-k", type=int, default=5)
    ap_recall.add_argument("--topic-ids", default="")

    ap_qa = sub.add_parser("qa", help="Ask KB to answer (stream)")
    ap_qa.add_argument("--question", required=True)
    ap_qa.add_argument("--topic-ids", default="")
    ap_qa.add_argument("--deep-seek", default="true", choices=["true", "false"])
    ap_qa.add_argument("--refs", default="true", choices=["true", "false"])
    ap_qa.add_argument("--history-json", default="")

    args = ap.parse_args()

    api_key = _env_api_key()

    if getattr(args, "topic_ids", ""):
        topic_ids = [x.strip() for x in args.topic_ids.split(",") if x.strip()]
    else:
        topic_ids = _env_topic_ids()

    if not topic_ids:
        raise SystemExit("Missing topic_id(s): set GETNOTE_TOPIC_IDS or pass --topic-ids")

    if args.cmd == "recall":
        out = recall(question=args.question, topic_ids=topic_ids, top_k=args.top_k, api_key=api_key)
        _print_json(out)
        return

    if args.cmd == "qa":
        history = None
        if args.history_json:
            history = json.loads(args.history_json)
        answer, process_events, refs_list = qa_stream(
            question=args.question,
            topic_ids=topic_ids,
            api_key=api_key,
            history=history,
            deep_seek=(args.deep_seek == "true"),
            refs=(args.refs == "true"),
        )
        _print_json({
            "answer": answer,
            "refs": refs_list,
            "process": process_events,
        })
        return


if __name__ == "__main__":
    main()
