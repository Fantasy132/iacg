import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import './Comment.css';

// 评论组件
const Comment = ({ comment, onDelete }) => {
  const { user, getToken, setAuthErrorMessage } = useAuth();

  // 格式化时间显示，确保使用北京时间
  const formatDate = (dateString) => {
    // 检查日期字符串是否有效
    if (!dateString) {
      return '未知时间';
    }
    
    // 处理可能的日期格式
    let date;
    if (typeof dateString === 'string') {
      // 尝试解析不同格式的日期字符串
      if (dateString.includes('T')) {
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
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 处理删除评论
  const handleDeleteComment = async () => {
    if (!user) return;
    
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        const token = getToken();
        const response = await fetch(`/api/comments/${comment.id}`, {
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

        // 删除成功后调用父组件的onDelete回调
        if (onDelete) {
          onDelete(comment.id);
        }
      } catch (err) {
        console.error('Delete comment error:', err);
        alert('删除评论失败: ' + err.message);
      }
    }
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-author">{comment.author_display_name || comment.author}</span>
        <span className="comment-date">{formatDate(comment.created_at)}</span>
        {(user && (user.id === comment.user_id || user.role === 'admin')) && (
          <Button 
            variant="danger"
            size="small"
            onClick={handleDeleteComment}
            className="delete-comment-button"
          >
            删除
          </Button>
        )}
      </div>
      <div className="comment-content">
        {comment.content}
      </div>
    </div>
  );
};

export default Comment;