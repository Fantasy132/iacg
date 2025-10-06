import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import './PostManagement.css';

// 帖子管理页面组件
const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  
  const { user: currentUser, getToken } = useAuth();

  // 获取所有帖子
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getToken();
        console.log('Fetching posts with token:', token);
        
        const response = await fetch('/api/admin/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Posts API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Posts API error response:', errorText);
          
          if (response.status === 403) {
            throw new Error(`权限不足，无法访问帖子管理功能: ${errorText}`);
          }
          throw new Error(`获取帖子列表失败: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Posts data:', data);
        setPosts(data);
      } catch (error) {
        console.error('获取帖子列表失败:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [getToken]);

  // 删除帖子
  const handleDeletePost = async (postId) => {
    if (!window.confirm('确定要删除这个帖子吗？此操作不可恢复。')) {
      return;
    }
    
    setDeleting(postId);
    
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const data = JSON.parse(errorText);
        throw new Error(data.message || `删除帖子失败: ${response.status} ${errorText}`);
      }
      
      // 更新帖子列表
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('删除帖子失败:', error);
      alert('删除帖子失败: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  // 格式化时间显示
  const formatDate = (dateString) => {
    // 检查日期字符串是否有效
    if (!dateString) {
      return '未知';
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
    
    // 显示时间，由于后端已经返回本地时间，我们直接格式化显示
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

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>错误</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新加载</button>
      </div>
    );
  }

  return (
    <div className="post-management">
      <h1>帖子管理</h1>
      
      <div className="posts-table-container">
        <table className="posts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>作者</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.author_display_name || post.author || '未知'}</td>
                <td>{formatDate(post.created_at)}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deleting === post.id}
                    size="small"
                  >
                    {deleting === post.id ? '删除中...' : '删除'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className="no-posts">
            <p>暂无帖子</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManagement;