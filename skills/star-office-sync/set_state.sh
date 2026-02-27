#!/bin/bash
# Star Office UI 状态同步脚本
# 用法: ./set_state.sh <state> [detail] [ttl_seconds]
# 
# 可用状态: idle / thinking / writing / researching / executing

NAS_URL="http://192.168.99.150:13011"
STATE="${1:-idle}"
DETAIL="${2:-}"
TTL="${3:-90}"

# 根据状态设置默认描述
if [ -z "$DETAIL" ]; then
  case "$STATE" in
    thinking)   DETAIL="灵瑶正在思考..." ;;
    writing)    DETAIL="灵瑶正在回复..." ;;
    researching) DETAIL="灵瑶正在查资料..." ;;
    executing)  DETAIL="灵瑶正在执行任务..." ;;
    idle)       DETAIL="待命中..." ;;
    *)          DETAIL="" ;;
  esac
fi

curl -s -X POST "${NAS_URL}/status" \
  -H "Content-Type: application/json" \
  -d "{\"state\":\"${STATE}\",\"detail\":\"${DETAIL}\",\"ttl_seconds\":${TTL}}" \
  > /dev/null 2>&1 &

# 后台运行，不阻塞主流程
