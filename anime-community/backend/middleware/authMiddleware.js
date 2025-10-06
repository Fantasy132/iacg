const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// 认证中间件 - 验证Token并查询数据库
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息并确保时区正确
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
};

// 管理员权限检查中间件
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin
};