@echo off
REM ========================================
REM 本地Embedding服务启动脚本
REM 设计师：哈雷酱 (￣▽￣)ﾉ
REM
REM 功能：
REM   - 启动Python Embedding服务（端口5001）
REM   - 使用sentence-transformers生成文本向量
REM   - 支持中文，性能优秀
REM
REM 优势：
REM   - 使用国内镜像加速（无需VPN）
REM   - 完全本地化，节省成本
REM   - 模型缓存，启动快速
REM ========================================

echo ========================================
echo   本地Embedding服务启动脚本
echo ========================================
echo.

REM 设置Hugging Face国内镜像
REM 如果不在中国，可以将此值设为空
set HF_ENDPOINT=https://hf-mirror.com

echo ✓ 镜像源: %HF_ENDPOINT%
echo.
echo 正在启动服务...
echo   端口: 5001
echo   模型: paraphrase-multilingual-MiniLM-L12-v2
echo   功能: 生成文本向量（384维）
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python！
    echo.
    echo 请先安装Python 3.8或更高版本：
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✓ Python已安装
echo.

REM 检查依赖
python -c "import sentence_transformers" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未找到sentence-transformers库
    echo 正在安装依赖...
    pip install sentence-transformers flask flask-cors
    echo.
)

echo ========================================
echo   服务启动中...
echo   首次启动需要下载模型（约500MB）
echo   后续启动将使用缓存，快速启动
echo ========================================
echo.

REM 启动服务（前台运行，便于查看日志）
REM 如果需要后台运行，使用：
REM   start /B python local_embedding_service.py > embedding-service.log 2>&1

python local_embedding_service.py

echo.
echo ========================================
echo   服务已停止
echo ========================================
echo.
pause
