import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

// 管理员仪表盘页面组件
const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    comments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { getToken, user } = useAuth();

  // 获取统计数据
  useEffect(() => {
    console.log('Current user:', user);
    const fetchStats = async () => {
      try {
        const token = getToken();
        console.log('Token:', token);
        
        // 获取用户总数
        let usersResponse = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Users response status:', usersResponse.status);
        
        if (!usersResponse.ok) {
          const errorText = await usersResponse.text();
          console.log('Users response error:', errorText);
          throw new Error(`获取用户统计数据失败: ${usersResponse.status} ${errorText}`);
        }
        
        const users = await usersResponse.json();
        console.log('Users data:', users);
        
        // 获取帖子总数
        let postsResponse = await fetch('/api/admin/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Posts response status:', postsResponse.status);
        
        if (!postsResponse.ok) {
          const errorText = await postsResponse.text();
          console.log('Posts response error:', errorText);
          throw new Error(`获取帖子统计数据失败: ${postsResponse.status} ${errorText}`);
        }
        
        const posts = await postsResponse.json();
        console.log('Posts data:', posts);
        
        // 简单模拟评论数统计（实际应用中应该有专门的API）
        const comments = posts.reduce((total, post) => {
          // 这里简化处理，实际应该查询数据库获取准确的评论数
          return total + Math.floor(Math.random() * 5);
        }, 0);
        
        setStats({
          users: users.length,
          posts: posts.length,
          comments: comments
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

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

  // 获取当前日期
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="admin-dashboard">
      <h1>管理后台</h1>
      <div className="dashboard-date">
        <p>{currentDate}</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>用户总数</h3>
          <p className="stat-value">{stats.users}</p>
        </div>
        
        <div className="stat-card">
          <h3>帖子总数</h3>
          <p className="stat-value">{stats.posts}</p>
        </div>
        
        <div className="stat-card">
          <h3>评论总数</h3>
          <p className="stat-value">{stats.comments}</p>
        </div>
      </div>
      
      <div className="admin-links">
        <div className="admin-link-card">
          <h3>用户管理</h3>
          <p>管理社区用户，可以删除违规用户</p>
          <Link to="/admin/users" className="admin-link-button">
            进入用户管理
          </Link>
        </div>
        
        <div className="admin-link-card">
          <h3>帖子管理</h3>
          <p>管理社区帖子，可以删除违规帖子</p>
          <Link to="/admin/posts" className="admin-link-button">
            进入帖子管理
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;