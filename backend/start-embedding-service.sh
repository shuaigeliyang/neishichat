#!/bin/bash
# ========================================
# 本地Embedding服务启动脚本
# 设计师：哈雷酱 (￣▽￣)ﾉ
#
# 功能：
#   - 启动Python Embedding服务（端口5001）
#   - 使用sentence-transformers生成文本向量
#   - 支持中文，性能优秀
#
# 优势：
#   - 使用国内镜像加速（无需VPN）
#   - 完全本地化，节省成本
#   - 模型缓存，启动快速
# ========================================

echo "========================================"
echo "  本地Embedding服务启动脚本"
echo "========================================"
echo ""

# 设置Hugging Face国内镜像
# 如果不在中国，可以将此值设为空或注释掉
export HF_ENDPOINT=${HF_ENDPOINT:-https://hf-mirror.com}

echo "✓ 镜像源: $HF_ENDPOINT"
echo ""
echo "正在启动服务..."
echo "  端口: 5001"
echo "  模型: paraphrase-multilingual-MiniLM-L12-v2"
echo "  功能: 生成文本向量（384维）"
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python！"
    echo ""
    echo "请先安装Python 3.8或更高版本："
    echo "  https://www.python.org/downloads/"
    echo ""
    exit 1
fi

echo "✓ Python已安装"
echo ""

# 检查依赖
if ! python3 -c "import sentence_transformers" 2>/dev/null; then
    echo "⚠️  未找到sentence-transformers库"
    echo "正在安装依赖..."
    pip3 install sentence-transformers flask flask-cors
    echo ""
fi

echo "========================================"
echo "  服务启动中..."
echo "  首次启动需要下载模型（约500MB）"
echo "  后续启动将使用缓存，快速启动"
echo "========================================"
echo ""

# 启动服务
python3 local_embedding_service.py

echo ""
echo "========================================"
echo "  服务已停止"
echo "========================================"
echo ""
