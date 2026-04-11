@echo off
echo ========================================
echo 教育系统智能体 - 后台管理系统
echo ========================================
echo.

echo [1/3] 检查环境...
if not exist "backend\node_modules" (
    echo 安装后端依赖...
    cd backend
    call npm install
    cd ..
)
if not exist "frontend\node_modules" (
    echo 安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [2/3] 启动后端服务...
start cmd /k "cd backend && npm run dev"

echo.
echo [3/3] 启动前端服务...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo 启动完成！
echo 后端地址: http://localhost:3001
echo 前端地址: http://localhost:5173
echo ========================================
echo.
pause
