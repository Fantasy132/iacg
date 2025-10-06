# Sakura社区 (Anime Community)

![二次元风格](https://img.shields.io/badge/风格-二次元-pink)
![React](https://img.shields.io/badge/前端-React-blue)
![Express](https://img.shields.io/badge/后端-Express-yellow)
![MySQL](https://img.shields.io/badge/数据库-MySQL-orange)

一个专为动漫爱好者打造的社区平台，采用二次元风格设计，让用户可以分享、讨论动漫相关内容。

## 项目概述

Sakura社区是一个全栈Web应用程序，包含前端和后端两个部分。该项目采用了现代化的技术栈，具有响应式设计，可以在各种设备上良好运行。

### 技术栈

#### 前端
- React (函数式组件和Hooks)
- React Router DOM v6
- CSS Modules样式管理
- 二次元风格UI设计

#### 后端
- Node.js
- Express.js框架
- MySQL数据库
- JWT身份验证
- BCrypt密码加密

## 功能特性

### 用户功能
- 用户注册和登录
- 发布帖子
- 查看帖子详情
- 对帖子进行评论
- 点赞功能
- 搜索帖子

### 管理员功能
- 用户管理（查看、删除用户）
- 帖子管理（查看、删除帖子）
- 仪表板数据统计

## 项目结构

```
iACG2/
└── anime-community/
    ├── backend/           # 后端代码
    │   ├── middleware/    # 中间件
    │   ├── routes/        # 路由
    │   ├── app.js         # Express应用入口
    │   └── db.js          # 数据库连接
    └── frontend/          # 前端代码
        ├── public/        # 静态资源
        ├── src/           # 源代码
        │   ├── components/ # 组件
        │   ├── contexts/   # React Context
        │   ├── pages/      # 页面组件
        │   ├── services/   # API服务
        │   ├── App.js      # 主应用组件
        │   └── index.js    # 应用入口
        └── package.json    # 前端依赖配置
```

## 环境要求

- Node.js >= 14.x
- MySQL >= 8.0
- npm >= 6.x

## 安装和运行

### 数据库设置

1. 创建一个新的MySQL数据库
2. 在[backend/mysql-schema.sql](anime-community/backend/mysql-schema.sql)中找到数据库结构
3. 执行SQL脚本创建表结构

### 后端配置

1. 进入后端目录:
   ```
   cd anime-community/backend
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 创建 `.env` 文件并配置环境变量:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   JWT_SECRET=your_jwt_secret
   ```

4. 启动后端服务:
   ```
   npm start
   ```
   
   或者在开发模式下运行:
   ```
   npm run dev
   ```

### 前端配置

1. 进入前端目录:
   ```
   cd anime-community/frontend
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 启动前端开发服务器:
   ```
   npm start
   ```

   应用将在 http://localhost:3000 上运行，API请求会被代理到后端服务。

## 默认账户

- 管理员账户: `admin` / `admin123`
- 普通用户: `user` / `user123`

## 部署

1. 构建前端应用:
   ```
   npm run build
   ```

2. 将构建好的文件部署到Web服务器

3. 配置Nginx反向代理，将 `/api/` 请求转发到后端服务

## 注意事项

- 项目使用粉红色调为主的二次元风格设计
- 所有时区处理均基于 Asia/Shanghai 时区
- 数据库时间字段由数据库自动生成，不需要前端传递
- 前端所有API请求都会被代理到后端，解决跨域问题

## 许可证

本项目仅供学习交流使用。

2335020234-於泊臻