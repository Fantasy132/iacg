const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 创建新评论 (需要认证)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const userId = req.user.id;

    // 检查必填字段
    if (!content || !postId) {
      return res.status(400).json({ message: 'Content and postId are required' });
    }

    // 检查帖子是否存在
    const [postRows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 插入新评论
    const insertQuery = 'INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)';
    const [result] = await pool.execute(insertQuery, [content, postId, userId]);

    // 获取插入的评论和作者信息
    const selectQuery = `
      SELECT c.*, u.username as author, u.display_name as author_display_name
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ?`;
    const [commentRows] = await pool.execute(selectQuery, [result.insertId]);

    res.status(201).json(commentRows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 删除评论 (需要认证，并验证操作者是否为评论作者或管理员)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 查询评论信息
    const selectQuery = 'SELECT * FROM comments WHERE id = ?';
    const [selectRows] = await pool.execute(selectQuery, [id]);

    if (selectRows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = selectRows[0];

    // 检查权限：是否为评论作者或管理员
    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 删除评论
    const deleteQuery = 'DELETE FROM comments WHERE id = ?';
    await pool.execute(deleteQuery, [id]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;