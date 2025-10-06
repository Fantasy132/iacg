import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Register.css';

// 注册页面组件
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { register } = useAuth();
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
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '请输入显示名称';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = '显示名称至少需要2个字符';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
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
      const response = await register(
        formData.username, 
        formData.display_name,
        formData.password, 
        formData.email
      );
      
      if (response.success) {
        setRegistrationSuccess(true);
        // 不再自动跳转到首页或登录页，而是显示成功信息
      } else {
        setErrors({ general: response.message });
      }
    } catch (error) {
      setErrors({ general: '注册过程中发生错误' });
    } finally {
      setLoading(false);
    }
  };

  // 处理登录跳转
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // 如果注册成功，显示成功信息
  if (registrationSuccess) {
    return (
      <div className="register-container">
        <div className="register-wrapper">
          <div className="registration-success">
            <h2>注册成功！</h2>
            <p>您的账户已成功创建，请点击下方按钮前往登录页面。</p>
            <Button onClick={handleLoginRedirect} variant="primary">
              前往登录
            </Button>
            <p className="login-link">
              已有账户？ <Link to="/login">立即登录</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>用户注册</h1>
          <p>创建一个新账户加入Sakura社区</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {errors.general && <div className="error-message submit-error">{errors.general}</div>}
          <div className="form-section">
            <Input
              label="用户名"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="请输入用户名（至少3个字符）"
              required
            />
          </div>
          
          <div className="form-section">
            <Input
              label="显示名称"
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              error={errors.display_name}
              placeholder="请输入显示名称（至少2个字符）"
              required
            />
          </div>
          
          <div className="form-section">
            <Input
              label="邮箱"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          
          <div className="form-section">
            <Input
              label="密码"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="请输入密码（至少6个字符）"
              required
            />
          </div>
          
          <div className="form-section">
            <Input
              label="确认密码"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
          </div>
          
          <div className="form-footer">
            <p>
              已有账户？ <Link to="/login">立即登录</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;