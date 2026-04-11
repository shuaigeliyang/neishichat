#!/bin/bash

echo "========================================"
echo "教育系统智能体 - 后台管理系统"
echo "========================================"
echo

echo "[1/3] 检查环境..."
if [ ! -d "backend/node_modules" ]; then
    echo "安装后端依赖..."
    cd backend
    npm install
    cd ..
fi
if [ ! -d "frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

echo
echo "[2/3] 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo
echo "[3/3] 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "启动完成！"
echo "后端地址: http://localhost:3001"
echo "前端地址: http://localhost:5173"
echo "========================================"
echo

# 等待用户输入
read -p "按回车键停止服务..."

# 停止服务
kill $BACKEND_PID $FRONTEND_PID
echo "服务已停止"
