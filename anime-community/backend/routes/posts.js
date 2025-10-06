const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 获取所有帖子列表
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; // 获取搜索参数
    
    let query;
    let params = [];
    
    if (search) {
      // 如果有搜索参数，则添加WHERE条件
      query = `
        SELECT 
          p.id,
          p.title,
          p.content,
          p.user_id,
          DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          u.username as author,
          u.display_name as author_display_name,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.title LIKE ?
        ORDER BY p.created_at DESC
      `;
      params = [`%${search}%`];
    } else {
      // 如果没有搜索参数，则获取所有帖子
      query = `
        SELECT 
          p.id,
          p.title,
          p.content,
          p.user_id,
          DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          u.username as author,
          u.display_name as author_display_name,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
      `;
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: '获取帖子失败，请稍后重试' });
  }
});

// 根据ID获取特定帖子及其评论
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 查询帖子信息和作者信息
    const postQuery = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.user_id,
        DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        u.username as author,
        u.display_name as author_display_name,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `;

    const [postRows] = await pool.execute(postQuery, [id]);
    
    if (postRows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = postRows[0];

    // 获取该帖子的所有评论
    const commentQuery = `
      SELECT 
        c.id,
        c.content,
        c.post_id,
        c.user_id,
        DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        u.username as author,
        u.display_name as author_display_name
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;

    const [commentRows] = await pool.execute(commentQuery, [id]);
    post.comments = commentRows;

    // 获取该帖子的所有点赞信息
    const likeQuery = `
      SELECT 
        l.id,
        l.user_id,
        l.post_id,
        DATE_FORMAT(l.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM likes l
      WHERE l.post_id = ?
    `;

    const [likeRows] = await pool.execute(likeQuery, [id]);
    post.likes = likeRows;

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 创建新帖子 (需要认证)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // 检查必填字段
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // 插入新帖子
    const insertQuery = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
    const [result] = await pool.execute(insertQuery, [title, content, userId]);

    res.status(201).json({
      message: 'Post created successfully',
      postId: result.insertId
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 删除帖子 (需要认证，并验证操作者是否为帖子作者或管理员)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 查询帖子信息
    const selectQuery = 'SELECT * FROM posts WHERE id = ?';
    const [selectRows] = await pool.execute(selectQuery, [id]);

    if (selectRows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = selectRows[0];

    // 检查权限：是否为帖子作者或管理员
    if (post.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // 删除帖子（会自动删除相关评论和点赞）
    const deleteQuery = 'DELETE FROM posts WHERE id = ?';
    await pool.execute(deleteQuery, [id]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 点赞或取消点赞 (需要认证)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // 检查帖子是否存在
    const [posts] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 检查是否已点赞
    const [likes] = await pool.execute(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (likes.length > 0) {
      // 已点赞，执行取消点赞操作
      await pool.execute(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );

      res.json({ message: 'Like removed successfully' });
    } else {
      // 未点赞，执行点赞操作
      await pool.execute(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [userId, postId]
      );

      res.json({ message: 'Like added successfully' });
    }
  } catch (error) {
    console.error('Error processing like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;