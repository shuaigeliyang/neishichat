@echo off
chcp 65001 > nul
echo ========================================
echo   教育系统智能体 - 后台管理系统
echo   快速启动脚本
echo ========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装
    pause
    exit /b 1
)

:: 检查 Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装
    pause
    exit /b 1
)

echo [1/4] 启动后端服务 (端口 3005)...
cd /d "%~dp0backend"
start "后台后端" cmd /c "npm run dev"
echo        后端服务已在新窗口启动

echo.
echo [2/4] 等待后端启动...
timeout /t 5 /nobreak > nul

echo.
echo [3/4] 启动前端服务 (端口 5176)...
cd /d "%~dp0frontend"
start "后台前端" cmd /c "npm run dev"
echo        前端服务已在新窗口启动

echo.
echo [4/4] 启动完成！
echo.
echo ========================================
echo   服务地址：
echo   - 后端API: http://localhost:3005
echo   - 前端界面: http://localhost:5176
echo ========================================
echo.
echo 提示：关闭此窗口不会停止服务
echo       如需停止，请关闭对应的命令行窗口
echo.
pause
