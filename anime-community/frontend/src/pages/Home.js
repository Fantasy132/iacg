import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PostCard from '../components/common/PostCard';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

// 首页组件
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || ''); // 实际用于搜索的查询词

  // 获取帖子列表
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // 构建API URL，包含搜索参数
        let url = '/api/posts';
        if (searchQuery) {
          url += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        // 使用真实的API调用而不是mockApi
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('获取帖子失败，请稍后重试');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery]); // 只有当搜索查询词改变时才触发搜索

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm); // 点击搜索按钮时更新实际的搜索查询词
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // 注意：这里不更新searchQuery，只有在点击搜索按钮时才更新
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Sakura社区</h1>
        {user && (
          <Link to="/create-post">
            <Button>发表新帖</Button>
          </Link>
        )}
      </div>
      
      {/* 搜索栏 */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="搜索帖子标题..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <Button type="submit" className="search-button">搜索</Button>
        </form>
      </div>
      
      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
            />
          ))
        ) : (
          <div className="no-posts">
            {searchQuery ? (
              <p>没有与"{searchQuery}"相关的帖子</p>
            ) : (
              <p>还没有帖子，快来发表第一个吧！</p>
            )}
            {user && !searchQuery && (
              <Link to="/create-post">
                <Button>发表新帖</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;