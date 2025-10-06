-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS community_db;
USE community_db;

-- 设置时区为中国时区
SET time_zone = '+08:00';

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- 1. 用户表 (users)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 帖子表 (posts)
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 评论表 (comments)
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. 点赞表 (likes)
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 插入测试数据
INSERT INTO users (username, password, email, display_name, role) VALUES 
('admin', '$2a$10$rJ2lFaXsgtm6rJF3z4n0OuT0I7DhfdeA4J/.Ofq8JJ/.Ez6v9uK6a', 'admin@example.com', '管理员', 'admin'),
('user', '$2a$10$rJ2lFaXsgtm6rJF3z4n0OuT0I7DhfdeA4J/.Ofq8JJ/.Ez6v9uK6a', 'user@example.com', '普通用户', 'user');

INSERT INTO posts (title, content, user_id) VALUES 
('欢迎来到Sakura社区', '这是一个讨论动漫的社区平台，欢迎大家分享自己的想法和观点。', 1),
('最新的动漫资讯', '这里有最新的动漫资讯和更新内容。', 1);

INSERT INTO comments (content, post_id, user_id) VALUES 
('这是一个很棒的社区！', 1, 2),
('期待更多内容。', 1, 2);