import React, { createContext, useState, useContext, useEffect } from 'react';

// 创建AuthContext
const AuthContext = createContext();

// AuthProvider组件，用于包裹整个应用并提供认证状态
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 页面加载时检查是否有保存的用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing saved user data:', e);
        // 清除无效的本地存储数据
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // 获取token的函数
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 登录函数
  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      const { user: userData, token } = data;
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  // 注册函数
  const register = async (username, display_name, password, email) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, display_name, password, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      // 注册成功但不自动登录，返回成功状态
      return { success: true, message: '注册成功，请登录' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 检查认证错误并设置提示
  const setAuthErrorMessage = (message) => {
    setAuthError(message);
  };

  // 清除认证错误
  const clearAuthError = () => {
    setAuthError(null);
  };

  // 提供上下文的值
  const contextValue = {
    user,
    login,
    register,
    logout,
    loading,
    getToken,
    authError,
    setAuthErrorMessage,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook，用于在组件中访问认证状态
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;