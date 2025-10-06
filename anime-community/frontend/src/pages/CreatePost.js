import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './CreatePost.css';

// 发表帖子页面组件
const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { user, getToken, setAuthErrorMessage } = useAuth();
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
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入帖子标题';
    } else if (formData.title.length < 5) {
      newErrors.title = '标题至少需要5个字符';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '请输入帖子内容';
    } else if (formData.content.length < 10) {
      newErrors.content = '内容至少需要10个字符';
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
      // 使用真实的API调用而不是mockApi
      const token = getToken();
      console.log('Token:', token); // 调试信息
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content
        })
      });
      
      console.log('Response status:', response.status); // 调试信息
      const text = await response.text();
      console.log('Response text:', text); // 调试信息
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
      
      if (!response.ok) {
        // 检查是否是认证错误
        if (response.status === 401 || response.status === 403) {
          setAuthErrorMessage('认证已过期，请重新登录。');
        }
        throw new Error(data.message || 'Failed to create post');
      }
      
      // 发表成功后跳转到首页
      navigate('/');
    } catch (error) {
      console.error('Create post error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-wrapper">
        <div className="create-post-header">
          <h1>发表新帖</h1>
          <p>分享你的想法，与社区成员交流</p>
        </div>
        
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-section">
            <Input
              label="标题"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="请输入帖子标题（至少5个字符）"
              required
            />
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="content">内容</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="请输入帖子内容（至少10个字符）"
                required
              />
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>
          </div>
          
          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '发布中...' : '发布帖子'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;