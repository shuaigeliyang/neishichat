@echo off
chcp 65001 >nul
echo ========================================
echo   Excel导出服务 - Coze插件专用版
echo ========================================
echo.

echo [1/3] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Python环境，请先安装Python 3.7+
    pause
    exit /b 1
)
echo ✅ Python环境检测成功

echo.
echo [2/3] 安装依赖...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功

echo.
echo [3/3] 启动服务...
echo.
echo ========================================
echo   服务地址: http://localhost:5000
echo   API文档: http://localhost:5000/api/health
echo ========================================
echo.
python app.py

pause
