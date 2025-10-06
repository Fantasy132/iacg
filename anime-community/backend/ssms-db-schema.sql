-- =============================================
-- SQL Server Management Studio (SSMS) Database Schema
-- Sakura Community Database
-- =============================================

-- 检查数据库是否存在，如果不存在则创建
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'community_db')
BEGIN
    CREATE DATABASE community_db;
    PRINT 'Database community_db created successfully.';
END
ELSE
BEGIN
    PRINT 'Database community_db already exists.';
END
GO

-- 使用数据库
USE community_db;
GO

-- 删除现有表（如果存在），按正确的依赖顺序
-- 先删除依赖其他表的表
IF OBJECT_ID('likes', 'U') IS NOT NULL
    DROP TABLE likes;
GO

IF OBJECT_ID('comments', 'U') IS NOT NULL
    DROP TABLE comments;
GO

-- 然后删除被其他表依赖的表
IF OBJECT_ID('posts', 'U') IS NOT NULL
    DROP TABLE posts;
GO

IF OBJECT_ID('users', 'U') IS NOT NULL
    DROP TABLE users;
GO

PRINT 'Existing tables dropped successfully.';
GO

-- 1. 用户表 (users)
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  display_name NVARCHAR(50), -- 用户显示名称
  [password] NVARCHAR(255) NOT NULL, -- password 是关键字，用方括号括起来
  email NVARCHAR(100) NOT NULL UNIQUE,
  [role] VARCHAR(20) NOT NULL DEFAULT 'user', -- role 是关键字，用方括号括起来
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 2. 帖子表 (posts)
CREATE TABLE posts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
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
  updated_at DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION -- 避免多重级联路径
);
GO

-- 4. 点赞表 (likes)
CREATE TABLE likes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  CONSTRAINT UQ_user_post_like UNIQUE (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION, -- 避免多重级联路径
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
GO

-- 创建索引以提高查询性能
CREATE INDEX IX_posts_user_id ON posts (user_id);
CREATE INDEX IX_comments_post_id ON comments (post_id);
CREATE INDEX IX_comments_user_id ON comments (user_id);
CREATE INDEX IX_likes_user_id ON likes (user_id);
CREATE INDEX IX_likes_post_id ON likes (post_id);
GO

-- 插入初始测试数据
PRINT 'Creating initial test data...';
GO

-- 插入用户数据
INSERT INTO users (username, display_name, [password], email, [role]) VALUES 
('admin', '管理员', '$2b$10$rVHMOBdfryjW9JJgiXJ3A.RF6h71W3vIb9SAD8E4uY44.tH8FWIyG', 'admin@example.com', 'admin'),
('user1', '用户一号', 'user123', 'user1@example.com', 'user'),
('user2', '用户二号', 'user456', 'user2@example.com', 'user');
GO

-- 插入帖子数据
INSERT INTO posts (title, content, user_id) VALUES 
('欢迎来到Sakura社区', '这是一个讨论动漫的社区平台，欢迎大家分享自己的想法和观点。', 1),
('最近有什么好看的动漫推荐吗？', '最近剧荒了，有什么好看的动漫推荐吗？最好是2023年新番！', 2);
GO

-- 插入评论数据
INSERT INTO comments (content, post_id, user_id) VALUES 
('这是一个很棒的社区！', 1, 2),
('期待更多内容。', 1, 3),
('感谢分享这些资讯。', 2, 3);
GO

-- 插入点赞数据
INSERT INTO likes (user_id, post_id) VALUES 
(2, 1),
(3, 1),
(2, 2);
GO

-- 创建一些有用的视图
PRINT 'Creating views...';
GO

-- 帖子详情视图（包含作者信息）
CREATE VIEW v_post_details AS
SELECT 
    p.id,
    p.title,
    p.content,
    p.created_at,
    p.updated_at,
    u.username AS author_name,
    u.display_name AS author_display_name,
    u.id AS author_id,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count
FROM posts p
JOIN users u ON p.user_id = u.id;
GO

-- 评论详情视图（包含作者信息）
CREATE VIEW v_comment_details AS
SELECT 
    c.id,
    c.content,
    c.created_at,
    c.updated_at,
    u.username AS author_name,
    u.display_name AS author_display_name,
    u.id AS author_id,
    p.id AS post_id
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN posts p ON c.post_id = p.id;
GO

-- 用户活动视图
CREATE VIEW v_user_activity AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.[role],
    COUNT(DISTINCT p.id) AS posts_count,
    COUNT(DISTINCT c.id) AS comments_count,
    COUNT(DISTINCT l.id) AS likes_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN likes l ON u.id = l.user_id
GROUP BY u.id, u.username, u.display_name, u.[role];
GO

-- 创建存储过程用于用户注册
CREATE PROCEDURE sp_register_user
    @username NVARCHAR(50),
    @display_name NVARCHAR(50),
    @password NVARCHAR(255),
    @email NVARCHAR(100),
    @role VARCHAR(20) = 'user'
AS
BEGIN
    INSERT INTO users (username, display_name, [password], email, [role])
    VALUES (@username, @display_name, @password, @email, @role);
    
    SELECT id, username, display_name, email, [role], created_at
    FROM users 
    WHERE id = SCOPE_IDENTITY();
END
GO

-- 创建存储过程用于创建帖子
CREATE PROCEDURE sp_create_post
    @title NVARCHAR(255),
    @content NVARCHAR(MAX),
    @user_id INT
AS
BEGIN
    INSERT INTO posts (title, content, user_id)
    VALUES (@title, @content, @user_id);
    
    SELECT id, title, content, user_id, created_at
    FROM posts 
    WHERE id = SCOPE_IDENTITY();
END
GO

-- 创建存储过程用于添加评论
CREATE PROCEDURE sp_add_comment
    @content NVARCHAR(MAX),
    @post_id INT,
    @user_id INT
AS
BEGIN
    INSERT INTO comments (content, post_id, user_id)
    VALUES (@content, @post_id, @user_id);
    
    SELECT id, content, post_id, user_id, created_at
    FROM comments 
    WHERE id = SCOPE_IDENTITY();
END
GO

-- 创建存储过程用于点赞
CREATE PROCEDURE sp_add_like
    @user_id INT,
    @post_id INT
AS
BEGIN
    -- 检查是否已经点赞
    IF NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @user_id AND post_id = @post_id)
    BEGIN
        INSERT INTO likes (user_id, post_id)
        VALUES (@user_id, @post_id);
        
        SELECT id, user_id, post_id, created_at
        FROM likes 
        WHERE id = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        -- 如果已经点赞，则取消点赞
        DELETE FROM likes WHERE user_id = @user_id AND post_id = @post_id;
        SELECT 'Like removed' AS message;
    END
END
GO

PRINT 'Database schema created successfully.';
GO

PRINT 'Database setup completed successfully!';
GO