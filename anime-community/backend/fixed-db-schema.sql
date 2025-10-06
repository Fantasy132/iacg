-- 检查数据库是否存在，如果不存在则创建
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'community_db')
BEGIN
    CREATE DATABASE community_db;
END;
GO

-- 使用数据库
USE community_db;
GO

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
GO

-- 1. 用户表 (users)
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  [password] NVARCHAR(255) NOT NULL, -- password 是关键字，建议用方括号括起来
  email NVARCHAR(100) NOT NULL UNIQUE,
  [role] VARCHAR(20) NOT NULL DEFAULT 'user', -- role 是关键字，建议用方括号括起来
  created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 2. 帖子表 (posts)
CREATE TABLE posts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL, -- TEXT 在 SQL Server 中应使用 NVARCHAR(MAX)
  user_id INT NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- 3. 评论表 (comments)
CREATE TABLE comments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  content NVARCHAR(MAX) NOT NULL,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) -- 移除 ON DELETE CASCADE 以避免多重级联路径
);
GO

-- 4. 点赞表 (likes)
CREATE TABLE likes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  CONSTRAINT UQ_user_post_like UNIQUE (user_id, post_id), -- 为唯一约束命名
  FOREIGN KEY (user_id) REFERENCES users(id), -- 移除 ON DELETE CASCADE 以避免多重级联路径
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
GO

-- 插入一些测试数据
INSERT INTO users (username, [password], email, [role]) VALUES 
('admin', 'hashed_password_here', 'admin@example.com', 'admin'),
('testuser', 'hashed_password_here', 'test@example.com', 'user');
GO

INSERT INTO posts (title, content, user_id) VALUES 
('欢迎来到Sakura社区', '这是一个讨论动漫的社区平台，欢迎大家分享自己的想法和观点。', 1),
('最新的动漫资讯', '这里有最新的动漫资讯和更新内容。', 1);
GO

INSERT INTO comments (content, post_id, user_id) VALUES 
('这是一个很棒的社区！', 1, 2),
('期待更多内容。', 1, 2);
GO