const express = require('express');
const pool = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 获取所有用户 (需要管理员权限)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    // 确保时区设置正确
    const connection = await pool.getConnection();
    await connection.execute("SET time_zone = '+08:00'");
    const [rows] = await connection.execute(
      'SELECT id, username, email, role, display_name, created_at FROM users ORDER BY created_at DESC'
    );
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 删除用户 (需要认证，并验证操作者是否为用户本人或管理员)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 检查权限：是否为用户本人或管理员
    if (parseInt(id) !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 查询用户信息
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 删除用户（会自动删除相关的帖子、评论和点赞）
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;