const express = require('express');
const pool = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 获取仪表盘数据 (需要管理员权限)
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    // 确保时区设置正确
    const connection = await pool.getConnection();
    await connection.execute("SET time_zone = '+08:00'");
    
    // 获取用户总数
    const [usersResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    // 获取帖子总数
    const [postsResult] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    
    // 获取评论总数
    const [commentsResult] = await connection.execute('SELECT COUNT(*) as count FROM comments');
    
    // 获取最近的帖子
    const [recentPosts] = await connection.execute(`
      SELECT 
        p.id,
        p.title,
        p.user_id,
        DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        u.username as author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    // 获取最近的用户
    const [recentUsers] = await connection.execute(`
      SELECT 
        id,
        username,
        email,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    connection.release();
    
    res.json({
      totalUsers: usersResult[0].count,
      totalPosts: postsResult[0].count,
      totalComments: commentsResult[0].count,
      recentPosts,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取所有帖子 (需要管理员权限)
router.get('/posts', authenticateToken, isAdmin, async (req, res) => {
  try {
    // 确保时区设置正确
    const connection = await pool.getConnection();
    await connection.execute("SET time_zone = '+08:00'");
    
    const [rows] = await connection.execute(`
      SELECT 
        p.id,
        p.title,
        p.user_id,
        DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        u.username as author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 删除帖子 (需要管理员权限)
router.delete('/posts/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 删除帖子（会自动删除相关评论和点赞）
    const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;