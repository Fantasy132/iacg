import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Login.css';

// 登录页面组件
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 表单验证
  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    }
    
    return newErrors;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login(formData.username, formData.password);
      
      if (response.success) {
        navigate('/');
      } else {
        // 根据错误信息类型设置不同的提示
        if (response.message.includes('用户名不存在')) {
          setErrors({ username: '用户名不存在' });
        } else if (response.message.includes('密码错误')) {
          setErrors({ password: '密码错误' });
        } else {
          setErrors({ general: response.message });
        }
      }
    } catch (error) {
      setErrors({ general: '登录过程中发生错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>用户登录</h2>
        {errors.general && (
          <div className="error-general">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            label="用户名"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
          />
          
          <Input
            label="密码"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="login-button"
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
        
        <div className="login-footer">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;