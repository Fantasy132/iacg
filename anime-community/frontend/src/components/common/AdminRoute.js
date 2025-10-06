import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 管理员路由组件，用于保护只有管理员才能访问的页面
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 如果还在加载用户信息，则显示空内容或加载指示器
  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  // 如果用户未登录，则重定向到登录页面
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 如果用户不是管理员，则显示无权限页面
  if (user.role !== 'admin') {
    console.log('User is not admin. User role:', user.role);
    console.log('Full user object:', user);
    return (
      <div className="unauthorized">
        <h2>无权限访问</h2>
        <p>您没有权限访问此页面。</p>
        <p>当前用户角色: {user.role}</p>
      </div>
    );
  }

  // 如果用户是管理员，则渲染子组件
  return children;
};

export default AdminRoute;