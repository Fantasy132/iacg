import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import './UserManagement.css';

// 用户管理页面组件
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // 每页显示10个用户
  const [error, setError] = useState('');
  
  const { user: currentUser, getToken } = useAuth();

  // 获取所有用户
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        console.log('Fetching users with token:', token);
        
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Users API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Users API error response:', errorText);
          
          if (response.status === 403) {
            throw new Error(`权限不足，无法访问用户管理功能: ${errorText}`);
          }
          throw new Error(`获取用户列表失败: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Users data:', data);
        setUsers(data);
      } catch (error) {
        console.error('获取用户列表失败:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getToken]);

  // 计算当前页的用户
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // 更改页面
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 删除用户
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return;
    }
    
    setDeleting(userId);
    
    try {
      const token = getToken();
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const data = JSON.parse(errorText);
        throw new Error(data.message || `删除用户失败: ${response.status} ${errorText}`);
      }
      
      // 更新用户列表
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除用户失败: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  // 格式化时间显示，确保使用北京时间
  const formatDate = (dateString) => {
    // 检查日期字符串是否有效
    if (!dateString) {
      return '未知';
    }
    
    // 处理可能的日期格式
    let date;
    if (typeof dateString === 'string') {
      // 检查是否已经是格式化的时间字符串 (yyyy-MM-dd HH:mm:ss)
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        // 对于后端返回的格式化时间字符串，直接解析为本地时间
        date = new Date(dateString.replace(' ', 'T'));
      } else if (dateString.includes('T')) {
        // ISO格式日期字符串
        date = new Date(dateString);
      } else {
        // 尝试直接转换
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      // 已经是Date对象
      date = dateString;
    } else {
      // 尝试直接转换
      date = new Date(dateString);
    }
    
    // 检查日期对象是否有效
    if (isNaN(date.getTime())) {
      // 如果日期无效，尝试其他方式解析
      try {
        date = new Date(Date.parse(dateString));
        if (isNaN(date.getTime())) {
          return '无效日期';
        }
      } catch (e) {
        return '无效日期';
      }
    }
    
    // 使用北京时间显示时间，包含时分秒
    // 由于后端已经返回本地时间，我们直接格式化显示
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

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

  return (
    <div className="user-management">
      <h1>用户管理</h1>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>显示名称</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.display_name || user.displayName || ''}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  {currentUser && currentUser.id !== user.id && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleting === user.id}
                      size="small"
                    >
                      {deleting === user.id ? '删除中...' : '删除'}
                    </Button>
                  )}
                  {currentUser && currentUser.id === user.id && (
                    <span>当前用户</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              上一页
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;