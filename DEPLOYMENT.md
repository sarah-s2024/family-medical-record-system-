# 医疗数据管理系统部署指南

## 方案一：局域网分享（最简单）

### 步骤：
1. 确保所有人在同一个WiFi网络下
2. 启动服务器：
   ```bash
   npm run dev
   cd client && npm start
   ```
3. 获取您的IP地址：
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
4. 分享地址给其他人：
   - 前端：`http://您的IP:3000`
   - 例如：`http://192.168.0.127:3000`

## 方案二：部署到Heroku（推荐）

### 步骤：
1. 安装Heroku CLI：
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # 或访问 https://devcenter.heroku.com/articles/heroku-cli
   ```

2. 登录Heroku：
   ```bash
   heroku login
   ```

3. 创建Heroku应用：
   ```bash
   heroku create your-app-name
   ```

4. 设置环境变量：
   ```bash
   heroku config:set NODE_ENV=production
   ```

5. 部署应用：
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. 打开应用：
   ```bash
   heroku open
   ```

## 方案三：部署到Vercel

### 步骤：
1. 安装Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录Vercel：
   ```bash
   vercel login
   ```

3. 部署：
   ```bash
   vercel
   ```

## 方案四：部署到Netlify

### 步骤：
1. 构建前端：
   ```bash
   cd client && npm run build
   ```

2. 将 `client/build` 文件夹拖拽到 Netlify 的部署区域

3. 配置API代理（如果需要）

## 注意事项

1. **数据持久化**：当前系统使用本地文件存储，部署到云服务器后数据不会持久化
2. **安全性**：生产环境建议添加用户认证和权限控制
3. **数据库**：建议使用MongoDB或PostgreSQL替代文件存储
4. **环境变量**：敏感信息应使用环境变量管理

## 本地开发

```bash
# 安装依赖
npm install
cd client && npm install

# 启动开发服务器
npm run dev
cd client && npm start
```

## 构建生产版本

```bash
# 构建前端
npm run build

# 启动生产服务器
NODE_ENV=production npm start
``` 