import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/common/Comment';
import Button from '../components/common/Button';
import './PostDetail.css';

// 帖子详情页面组件
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken, setAuthErrorMessage } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 获取帖子详情
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('帖子不存在');
          }
          throw new Error('获取帖子失败');
        }
        const data = await response.json();
        setPost(data);
        setComments(data.comments || []);
        setLikeCount(data.like_count || 0);
        
        // 只有当用户已登录时才检查点赞状态
        if (user && data.likes) {
          const userLiked = data.likes.some(like => like.user_id === user.id);
          setIsLiked(userLiked);
        } else {
          // 用户未登录时确保点赞状态为false
          setIsLiked(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  // 处理点赞/取消点赞
  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // 检查是否是认证错误
        if (response.status === 401 || response.status === 403) {
          setAuthErrorMessage('认证已过期，请重新登录。');
          return;
        }
        throw new Error('操作失败');
      }

      // 切换点赞状态
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // 处理提交评论
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          postId: parseInt(id)
        })
      });

      if (!response.ok) {
        // 检查是否是认证错误
        if (response.status === 401 || response.status === 403) {
          setAuthErrorMessage('认证已过期，请重新登录。');
          return;
        }
        throw new Error('评论失败');
      }

      const data = await response.json();
      
      // 更新评论列表
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  // 处理删除评论
  const handleDeleteComment = (commentId) => {
    // 从评论列表中移除已删除的评论
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  // 格式化时间显示，正确处理时区
  const formatDate = (dateString) => {
    // 检查日期字符串是否有效
    if (!dateString) {
      return '未知时间';
    }
    
    // 处理可能的日期格式
    let date;
    if (typeof dateString === 'string') {
      // 检查是否已经是格式化的时间字符串 (yyyy-MM-dd HH:mm:ss)
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        // 对于后端返回的格式化时间字符串，直接解析为本地时间
        date = new Date(dateString.replace(' ', 'T'));
      } else if (dateString.includes('T')) {
        // ISO格式日期字符串
        date = new Date(dateString);
      } else {
        // 尝试直接转换
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      // 已经是Date对象
      date = dateString;
    } else {
      // 尝试直接转换
      date = new Date(dateString);
    }
    
    // 检查日期对象是否有效
    if (isNaN(date.getTime())) {
      // 如果日期无效，尝试其他方式解析
      try {
        date = new Date(Date.parse(dateString));
        if (isNaN(date.getTime())) {
          return '无效日期';
        }
      } catch (e) {
        return '无效日期';
      }
    }
    
    // 使用北京时间显示时间
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!user) return;
    
    if (window.confirm('确定要删除这个帖子吗？')) {
      try {
        const token = getToken();
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // 检查是否是认证错误
          if (response.status === 401 || response.status === 403) {
            setAuthErrorMessage('认证已过期，请重新登录。');
            return;
          }
          throw new Error('删除失败');
        }

        // 删除成功后跳转到首页
        navigate('/');
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!post) {
    return <div className="error">帖子不存在</div>;
  }

  return (
    <div className="post-detail-container">
      <article className="post-content">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>作者: {post.author_display_name || post.author}</span>
          <span className="meta-divider"> | </span>
          <span>发布时间: {formatDate(post.created_at)}</span>
        </div>
        <div className="post-body">
          {post.content}
        </div>
        
        <div className="post-actions">
          <Button 
            onClick={handleLike}
            className={isLiked ? 'liked' : ''}
            disabled={!user}
          >
            {isLiked ? '取消点赞' : '点赞'} ({likeCount})
          </Button>
          
          {(user && (user.id === post.user_id || user.role === 'admin')) && (
            <Button 
              variant="danger"
              onClick={handleDeletePost}
            >
              删除帖子
            </Button>
          )}
        </div>
      </article>
      
      <section className="comments-section">
        <h2>评论 ({comments.length})</h2>
        
        {user ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="添加评论..."
              required
            />
            <Button type="submit">发表评论</Button>
          </form>
        ) : (
          <div className="login-to-comment">
            <p>请<Link to="/login">登录</Link>后发表评论</p>
          </div>
        )}
        
        <div className="comments-list">
          {comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;