// 模拟API服务，用于提供用户、帖子和评论的模拟数据
// 模拟网络延迟以模拟真实API请求

// 模拟用户数据
let users = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user1', password: 'user123', email: 'user1@example.com', role: 'user' },
  { id: 3, username: 'user2', password: 'user456', email: 'user2@example.com', role: 'user' }
];

// 模拟帖子数据
let posts = [
  { 
    id: 1, 
    title: '欢迎来到Sakura社区！', 
    content: '这里是二次元爱好者的聚集地，欢迎大家分享自己喜欢的动漫、漫画和游戏！', 
    author: 'admin', 
    timestamp: '2023-05-01T10:00:00Z',
    likes: [2, 3] // 用户ID为2和3的用户点赞了这个帖子
  },
  { 
    id: 2, 
    title: '最近有什么好看的动漫推荐吗？', 
    content: '最近剧荒了，有什么好看的动漫推荐吗？最好是2023年新番！', 
    author: 'user1', 
    timestamp: '2023-05-02T14:30:00Z',
    likes: [3] // 用户ID为3的用户点赞了这个帖子
  },
  { 
    id: 3, 
    title: '《鬼灭之刃》柱合会议题讨论', 
    content: '柱合会议篇真的太精彩了！炭治郎的成长和各个柱的表现都超赞！大家怎么看？', 
    author: 'user2', 
    timestamp: '2023-05-03T09:15:00Z',
    likes: [1, 2] // 用户ID为1和2的用户点赞了这个帖子
  }
];

// 模拟评论数据
let comments = [
  {
    id: 1,
    postId: 1,
    author: 'user1',
    content: '感谢管理员的分享，社区很棒！',
    timestamp: '2023-05-01T11:20:00Z'
  },
  {
    id: 2,
    postId: 1,
    author: 'user2',
    content: '是的，期待更多内容！',
    timestamp: '2023-05-01T13:45:00Z'
  },
  {
    id: 3,
    postId: 2,
    author: 'user2',
    content: '推荐《赛博朋克：边缘行者》，虽然是2022年的，但真的很棒！',
    timestamp: '2023-05-02T16:10:00Z'
  }
];

// 模拟API函数
export const mockApi = {
  // 用户相关API
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          // 不返回密码字段
          const { password, ...userWithoutPassword } = user;
          resolve({
            user: userWithoutPassword,
            token: 'mock-jwt-token-' + user.id
          });
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 500); // 模拟网络延迟
    });
  },

  register: (username, password, email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 检查用户名是否已存在
        if (users.some(u => u.username === username)) {
          reject(new Error('用户名已存在'));
          return;
        }

        // 检查邮箱是否已存在
        if (users.some(u => u.email === email)) {
          reject(new Error('邮箱已被注册'));
          return;
        }

        // 创建新用户
        const newUser = {
          id: users.length + 1,
          username,
          password,
          email,
          role: 'user' // 默认为普通用户
        };

        users.push(newUser);
        
        // 不返回密码字段
        const { password: pwd, ...userWithoutPassword } = newUser;
        resolve({
          user: userWithoutPassword,
          token: 'mock-jwt-token-' + newUser.id
        });
      }, 500);
    });
  },

  // 帖子相关API
  getPosts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(posts);
      }, 300);
    });
  },

  getPostById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const post = posts.find(p => p.id === parseInt(id));
        if (post) {
          resolve(post);
        } else {
          reject(new Error('帖子不存在'));
        }
      }, 300);
    });
  },

  createPost: (postData, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = users.find(u => u.id === userId);
          if (!user) {
            reject(new Error('用户不存在'));
            return;
          }

          const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            ...postData,
            author: user.username,
            timestamp: new Date().toISOString(),
            likes: []
          };

          posts.push(newPost);
          resolve(newPost);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  deletePost: (postId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = users.find(u => u.id === userId);
          if (!user) {
            reject(new Error('用户不存在'));
            return;
          }

          const postIndex = posts.findIndex(p => p.id === postId);
          if (postIndex === -1) {
            reject(new Error('帖子不存在'));
            return;
          }

          // 检查是否有权限删除（作者或管理员）
          const post = posts[postIndex];
          if (user.role !== 'admin' && post.author !== user.username) {
            reject(new Error('没有权限删除该帖子'));
            return;
          }

          // 删除帖子
          posts.splice(postIndex, 1);
          
          // 同时删除该帖子的所有评论
          comments = comments.filter(c => c.postId !== postId);
          
          resolve({ message: '删除成功' });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // 点赞相关API
  toggleLike: (postId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const post = posts.find(p => p.id === postId);
          if (!post) {
            reject(new Error('帖子不存在'));
            return;
          }

          const likeIndex = post.likes.indexOf(userId);
          if (likeIndex > -1) {
            // 取消点赞
            post.likes.splice(likeIndex, 1);
          } else {
            // 点赞
            post.likes.push(userId);
          }

          resolve({ likes: post.likes });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  // 评论相关API
  getCommentsByPostId: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const postComments = comments.filter(c => c.postId === parseInt(postId));
        resolve(postComments);
      }, 300);
    });
  },

  createComment: (commentData, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = users.find(u => u.id === userId);
          if (!user) {
            reject(new Error('用户不存在'));
            return;
          }

          const newComment = {
            id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
            ...commentData,
            author: user.username,
            timestamp: new Date().toISOString()
          };

          comments.push(newComment);
          resolve(newComment);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // 管理员相关API
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 不返回密码字段
        const usersWithoutPassword = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        resolve(usersWithoutPassword);
      }, 300);
    });
  },

  deleteUser: (userId, currentUserId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const currentUser = users.find(u => u.id === currentUserId);
          if (!currentUser || currentUser.role !== 'admin') {
            reject(new Error('没有权限执行此操作'));
            return;
          }

          if (userId === currentUserId) {
            reject(new Error('不能删除自己'));
            return;
          }

          const userIndex = users.findIndex(u => u.id === userId);
          if (userIndex === -1) {
            reject(new Error('用户不存在'));
            return;
          }

          // 删除用户
          users.splice(userIndex, 1);
          
          // 删除该用户发布的所有帖子
          posts = posts.filter(p => p.author !== users.find(u => u.id === userId)?.username);
          
          // 删除该用户的所有评论
          comments = comments.filter(c => c.author !== users.find(u => u.id === userId)?.username);
          
          resolve({ message: '用户删除成功' });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }
};