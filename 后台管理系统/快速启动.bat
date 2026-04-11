@echo off
chcp 65001 > nul
title 教育系统智能体 - 启动器

echo ========================================
echo   教育系统智能体 - 后台管理系统
echo   快速启动脚本
echo ========================================
echo.

:: 获取脚本所在目录
set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

:: 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装
    echo.
    pause
    exit /b 1
)

echo [检查] Node.js 已找到
echo.

echo ========================================
echo   开始启动服务...
echo ========================================
echo.

:: 启动后端
echo [1/2] 启动后端服务 (端口 3005)...
pushd "%SCRIPT_DIR%\backend"
start "后台后端-3005" cmd /k "npm run dev"
popd
echo        后端已启动

echo.

:: 启动前端
echo [2/2] 启动前端服务 (端口 5176)...
pushd "%SCRIPT_DIR%\frontend"
start "后台前端-5176" cmd /k "npm run dev"
popd
echo        前端已启动

echo.
echo ========================================
echo.
echo   启动完成！
echo.
echo   服务地址：
echo   - 后端API: http://localhost:3005
echo   - 前端界面: http://localhost:5176
echo.
echo   按任意键打开浏览器...
echo ========================================
pause > nul

:: 打开浏览器
start http://localhost:5176

echo.
echo 服务已在后台运行！
echo 如需停止，请关闭标题为"后台后端-3005"和"后台前端-5176"的窗口
echo.
pause
