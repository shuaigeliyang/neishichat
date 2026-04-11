@echo off
chcp 65001 > nul
title 教育系统智能体 - 停止服务

echo ========================================
echo   教育系统智能体 - 后台管理系统
echo   停止所有服务
echo ========================================
echo.

:: 停止后端
echo [1/2] 停止后端服务...
taskkill /F /FI "WINDOWTITLE eq 后台后端-3005*" 2>nul
if %errorlevel% equ 0 (
    echo        后端已停止
) else (
    echo        后端未运行
)

echo.

:: 停止前端
echo [2/2] 停止前端服务...
taskkill /F /FI "WINDOWTITLE eq 后台前端-5176*" 2>nul
if %errorlevel% equ 0 (
    echo        前端已停止
) else (
    echo        前端未运行
)

echo.
echo ========================================
echo   所有服务已停止！
echo ========================================
echo.
pause
