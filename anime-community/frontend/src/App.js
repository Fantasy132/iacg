import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Modal from './components/common/Modal';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import PostManagement from './pages/Admin/PostManagement';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import CherryBlossomEffect from './components/common/CherryBlossomEffect';
import './App.css';

// 认证错误提示组件
const AuthErrorModal = () => {
  const { authError, clearAuthError, logout } = useAuth();

  const handleClose = () => {
    clearAuthError();
    logout(); // 清除错误后自动登出
  };

  return (
    <Modal 
      isOpen={!!authError} 
      onClose={handleClose}
      title="认证错误"
    >
      <p>{authError || '认证已过期，请重新登录。'}</p>
    </Modal>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <CherryBlossomEffect />
          <Navbar />
          <AuthErrorModal />
          <main className="main-content">
            <Routes>
              {/* 公共路由 */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post/:id" element={<PostDetail />} />
              
              {/* 需要认证的路由 */}
              <Route path="/create-post" element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              } />
              
              {/* 管理员路由 */}
              <Route path="/admin" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              <Route path="/admin/posts" element={
                <AdminRoute>
                  <PostManagement />
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;