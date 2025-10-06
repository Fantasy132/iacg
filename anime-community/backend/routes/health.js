const express = require('express');
const pool = require('../db');

const router = express.Router();

// 健康检查端点
router.get('/', async (req, res) => {
  try {
    // 测试数据库连接
    const [connectionTest] = await pool.execute('SELECT 1 as connection_test');
    
    // 检查各表的记录数
    const [usersResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [postsResult] = await pool.execute('SELECT COUNT(*) as count FROM posts');
    const [commentsResult] = await pool.execute('SELECT COUNT(*) as count FROM comments');
    const [likesResult] = await pool.execute('SELECT COUNT(*) as count FROM likes');
    
    res.json({
      status: 'OK',
      database: 'Connected',
      tables: {
        users: usersResult[0].count,
        posts: postsResult[0].count,
        comments: commentsResult[0].count,
        likes: likesResult[0].count
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;