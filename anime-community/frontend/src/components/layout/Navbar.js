import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

// 导航栏组件
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Sakura社区</Link>
      </div>
      
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link">首页</Link>
        </li>
        {user ? (
          <>
            <li className="nav-item">
              <Link to="/create-post" className="nav-link">发表帖子</Link>
            </li>
            {user.role === 'admin' && (
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-link">管理后台</Link>
              </li>
            )}
          </>
        ) : null}
      </ul>
      
      <div className="navbar-auth">
        {user ? (
          <div className="user-info">
            <span>欢迎, {user.display_name}!</span>
            <button onClick={handleLogout} className="btn-logout">退出</button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">登录</Link>
            <Link to="/register" className="nav-link">注册</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;