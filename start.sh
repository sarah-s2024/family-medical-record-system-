#!/bin/bash

echo "医疗数据管理系统 - 启动脚本"
echo "================================"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo "请先运行 ./install.sh 安装依赖"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "正在安装前端依赖..."
    cd client
    npm install
    cd ..
fi

echo "启动后端服务器..."
npm run dev &

echo "等待后端服务器启动..."
sleep 3

echo "启动前端开发服务器..."
cd client
npm start &

echo ""
echo "系统启动完成！"
echo "================================"
echo "前端界面: http://localhost:3000"
echo "后端API: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止所有服务" 