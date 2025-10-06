import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 私有路由组件，用于保护需要登录才能访问的页面
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 如果还在加载用户信息，则显示空内容或加载指示器
  if (loading) {
    return <div>加载中...</div>;
  }

  // 如果用户未登录，则重定向到登录页面
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 如果用户已登录，则渲染子组件
  return children;
};

export default PrivateRoute;