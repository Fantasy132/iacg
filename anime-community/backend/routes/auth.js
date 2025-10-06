const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// 用户注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, display_name, password, email } = req.body;

    // 检查必填字段
    if (!username || !display_name || !password || !email) {
      return res.status(400).json({ message: 'Username, display name, password, and email are required' });
    }

    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 确保时区设置正确
    const connection = await pool.getConnection();
    await connection.execute("SET time_zone = '+08:00'");
    
    // 插入新用户到数据库
    const [result] = await connection.execute(
      'INSERT INTO users (username, display_name, password, email) VALUES (?, ?, ?, ?)',
      [username, display_name, hashedPassword, email]
    );
    
    connection.release();

    // 注册成功，但不返回token和用户信息
    res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 用户登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查必填字段
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // 查询用户
    const [users] = await pool.execute(
      'SELECT id, username, display_name, email, password, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      // 用户不存在
      return res.status(401).json({ message: '用户名不存在' });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // 密码错误
      return res.status(401).json({ message: '密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, display_name: user.display_name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取当前用户信息 (需要认证)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      display_name: req.user.display_name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 认证中间件（仅用于本文件）
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息
    const connection = await pool.getConnection();
    await connection.execute("SET time_zone = '+08:00'");
    const [rows] = await connection.execute('SELECT id, username, email, role, display_name FROM users WHERE id = ?', [decoded.id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = router;