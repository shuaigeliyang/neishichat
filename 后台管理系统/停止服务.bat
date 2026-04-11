@echo off
chcp 65001 > nul
echo ========================================
echo   教育系统智能体 - 后台管理系统
echo   停止所有服务
echo ========================================
echo.

echo [1/2] 停止 Node.js 进程...
taskkill /F /FI "WINDOWTITLE eq 后台后端*" 2>nul
taskkill /F /FI "WINDOWTITLE eq 后台前端*" 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo [2/2] 停止端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5176') do taskkill /F /PID %%a 2>nul

echo.
echo ========================================
echo   所有服务已停止！
echo ========================================
echo.
pause
