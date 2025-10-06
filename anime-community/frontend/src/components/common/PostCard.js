import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

// 帖子卡片组件
const PostCard = ({ post }) => {
  // 格式化时间显示，确保使用北京时间
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
        // 直接使用北京时间解析
        date = new Date(dateString.replace(' ', 'T') + '+08:00');
      } else if (dateString.includes('T')) {
        // ISO格式日期字符串，假定为UTC时间，转换为北京时间
        date = new Date(new Date(dateString).getTime() + 8 * 60 * 60 * 1000);
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

  return (
    <div className="post-card">
      <h3 className="post-title">
        <Link to={`/post/${post.id}`} className="post-link">
          {post.title}
        </Link>
      </h3>
      <div className="post-meta">
        <span className="post-author">作者: {post.author_display_name || post.author}</span>
        <span className="post-date">{formatDate(post.created_at || post.timestamp)}</span>
      </div>
      <div className="post-content-preview">
        {post.content?.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
      </div>
      <div className="post-stats">
        <span className="post-comments">💬 {post.comment_count || 0} 评论</span>
        <span className="post-likes">👍 {post.like_count || 0} 点赞</span>
      </div>
    </div>
  );
};

export default PostCard;