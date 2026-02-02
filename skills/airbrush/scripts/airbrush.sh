#!/bin/bash
# Airbrush AI 文生图工具

set -e

# 配置文件路径
CONFIG_FILE="$HOME/.config/airbrush/credentials.json"

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 读取配置
API_KEY=$(jq -r '.api_key' "$CONFIG_FILE")
ENDPOINT=$(jq -r '.endpoint' "$CONFIG_FILE")

# 默认参数
PROMPT=""
ENGINE="stable-diffusion-xl-pro"
SIZE="large"
SEED=""
GUIDANCE=""
NEGATIVE=""
OUTPUT_DIR="/Users/maimai/AI-Images"
AUTO_TRANSLATE="false"  # 默认不做机翻：由灵瑶先理解中文需求并写成英文提示词；如需脚本机翻可开启

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --engine|-e)
            ENGINE="$2"
            shift 2
            ;;
        --size|-s)
            SIZE="$2"
            shift 2
            ;;
        --seed)
            SEED="$2"
            shift 2
            ;;
        --guidance|-g)
            GUIDANCE="$2"
            shift 2
            ;;
        --negative|-n)
            NEGATIVE="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --translate)
            AUTO_TRANSLATE="true"
            shift
            ;;
        --help|-h)
            echo "使用方法: airbrush.sh [选项] <提示词>"
            echo ""
            echo "选项:"
            echo "  -e, --engine <引擎>        AI引擎 (默认: stable-diffusion-xl-pro)"
            echo "  -s, --size <尺寸>          图片尺寸 (small/large/xlarge/portrait/landscape)"
            echo "  --seed <种子>              随机种子"
            echo "  -g, --guidance <强度>      引导强度 (1-20)"
            echo "  -n, --negative <提示词>    负面提示词"
            echo "  -o, --output <目录>        输出目录 (默认: 当前目录)"
            echo "  --translate                开启脚本层机翻（不推荐；更推荐让灵瑶先写优化英文提示词）"
            echo "  -h, --help                 显示帮助"
            echo ""
            echo "可用引擎:"
            echo "  stable-diffusion-xl-pro    Stable Diffusion XL Pro (推荐)"
            echo "  midjourney-v6              Midjourney V6 风格"
            echo "  flux                       Flux 模型"
            echo "  realistic-vision-v2        写实风格"
            echo "  3d-animation-diffusion     3D 动画风格"
            echo "  anything-v6                Anything V6 (动漫)"
            echo "  wifu-diffusion             Waifu Diffusion (动漫)"
            exit 0
            ;;
        *)
            if [ -z "$PROMPT" ]; then
                PROMPT="$1"
            else
                PROMPT="$PROMPT $1"
            fi
            shift
            ;;
    esac
done

# 检查提示词
if [ -z "$PROMPT" ]; then
    echo "❌ 请提供提示词"
    echo "使用 --help 查看帮助"
    exit 1
fi

ORIGINAL_PROMPT="$PROMPT"

# 若检测到中文提示词，则自动翻译成英文（调用 Google Translate 非官方接口，无需 API Key）
if [ "$AUTO_TRANSLATE" = "true" ]; then
    if python3 - <<'PY' "$PROMPT" >/dev/null 2>&1
import sys
s=sys.argv[1]
# 基本中文字符范围检测
has_zh=any('\u4e00' <= ch <= '\u9fff' for ch in s)
sys.exit(0 if has_zh else 1)
PY
    then
        TRANSLATED_PROMPT=$(python3 - <<'PY' "$PROMPT"
import sys, json, urllib.parse, urllib.request
text=sys.argv[1]
url=(
  "https://translate.googleapis.com/translate_a/single"
  "?client=gtx&sl=auto&tl=en&dt=t&q=" + urllib.parse.quote(text)
)
req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=15) as f:
    data=json.loads(f.read().decode('utf-8'))
# data[0] = [["translated", "original", ...], ...]
translated="".join(seg[0] for seg in data[0] if seg and seg[0])
print(translated.strip())
PY
)

        if [ -n "$TRANSLATED_PROMPT" ]; then
            PROMPT="$TRANSLATED_PROMPT"
        fi
    fi
fi

echo "🎨 正在生成图片..."
if [ "$ORIGINAL_PROMPT" != "$PROMPT" ]; then
    echo "🈶 原始(中文): $ORIGINAL_PROMPT"
    echo "📝 已翻译(英文): $PROMPT"
else
    echo "📝 提示词: $PROMPT"
fi
echo "🔧 引擎: $ENGINE"
echo "📏 尺寸: $SIZE"

# 构建 JSON 请求体
REQUEST_JSON=$(jq -n \
    --arg api_key "$API_KEY" \
    --arg content "$PROMPT" \
    --arg engine "$ENGINE" \
    --arg dimensions "$SIZE" \
    --arg seed "$SEED" \
    --arg guidance "$GUIDANCE" \
    --arg negative "$NEGATIVE" \
    '{
        api_key: $api_key,
        content: $content,
        ai_engine: $engine,
        image_dimensions: $dimensions
    } + (if $seed != "" then {seed: $seed} else {} end)
      + (if $guidance != "" then {guidance: $guidance} else {} end)
      + (if $negative != "" then {negative_prompt: $negative} else {} end)'
)

# 发送请求
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$REQUEST_JSON")

# 检查响应
SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" != "true" ]; then
    echo "❌ 生成失败"
    echo "$RESPONSE" | jq .
    exit 1
fi

# 提取图片 URL
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.image_url')
CREDITS_REMAINING=$(echo "$RESPONSE" | jq -r '.data.credits_remaining')
MONTHLY_CALLS=$(echo "$RESPONSE" | jq -r '.data.api_calls.monthly')

echo "✅ 生成成功！"
echo "🔗 图片URL: $IMAGE_URL"
echo "💰 剩余额度: $CREDITS_REMAINING"
echo "📊 本月调用: $MONTHLY_CALLS"

# 下载图片
FILENAME="airbrush_$(date +%Y%m%d_%H%M%S).jpg"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"
DOWNLOADS_PATH="$HOME/Downloads/$FILENAME"

echo "⬇️  正在下载图片..."
curl -s -o "$OUTPUT_PATH" "$IMAGE_URL"

echo "✨ 图片已保存: $OUTPUT_PATH"

# 复制到下载文件夹
cp "$OUTPUT_PATH" "$DOWNLOADS_PATH"
echo "📥 已复制到下载文件夹: $DOWNLOADS_PATH"

echo "$OUTPUT_PATH"
