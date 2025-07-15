#!/bin/bash

echo "医疗数据管理系统 - 安装脚本"
echo "================================"

# 检查操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到 macOS 系统"
    
    # 检查是否已安装 Homebrew
    if ! command -v brew &> /dev/null; then
        echo "正在安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # 添加 Homebrew 到 PATH
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo "Homebrew 已安装"
    fi
    
    # 安装 Node.js
    if ! command -v node &> /dev/null; then
        echo "正在安装 Node.js..."
        brew install node
    else
        echo "Node.js 已安装: $(node --version)"
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "检测到 Linux 系统"
    
    # 检查是否已安装 Node.js
    if ! command -v node &> /dev/null; then
        echo "正在安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "Node.js 已安装: $(node --version)"
    fi
    
else
    echo "不支持的操作系统: $OSTYPE"
    echo "请手动安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查 Node.js 和 npm 版本
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

# 安装后端依赖
echo "正在安装后端依赖..."
npm install

# 安装前端依赖
echo "正在安装前端依赖..."
cd client
npm install
cd ..

echo ""
echo "安装完成！"
echo "================================"
echo "启动说明："
echo "1. 启动后端服务器: npm run dev"
echo "2. 启动前端开发服务器: cd client && npm start"
echo "3. 访问前端界面: http://localhost:3000"
echo "4. 后端API地址: http://localhost:5000"
echo ""
echo "或者使用一键启动命令: npm run install-all" 