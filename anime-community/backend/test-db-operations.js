const { pool, poolConnect, sql } = require('./db');
require('dotenv').config();

async function testDatabaseOperations() {
  try {
    console.log('开始测试数据库操作...');
    
    // 等待连接建立
    await poolConnect;
    console.log('✓ 数据库连接成功');
    
    // 测试1: 查询用户表
    console.log('\n1. 测试查询用户表...');
    const userResult = await pool.request().query('SELECT COUNT(*) as count FROM users');
    console.log(`✓ 用户表中有 ${userResult.recordset[0].count} 条记录`);
    
    // 测试2: 查询帖子表
    console.log('\n2. 测试查询帖子表...');
    const postResult = await pool.request().query('SELECT COUNT(*) as count FROM posts');
    console.log(`✓ 帖子表中有 ${postResult.recordset[0].count} 条记录`);
    
    // 测试3: 查询评论表
    console.log('\n3. 测试查询评论表...');
    const commentResult = await pool.request().query('SELECT COUNT(*) as count FROM comments');
    console.log(`✓ 评论表中有 ${commentResult.recordset[0].count} 条记录`);
    
    // 测试4: 插入测试用户
    console.log('\n4. 测试插入用户...');
    const insertUserResult = await pool.request()
      .input('username', sql.NVarChar, 'testuser')
      .input('email', sql.NVarChar, 'test@example.com')
      .input('password', sql.NVarChar, 'hashed_password_here')
      .query('INSERT INTO users (username, email, password) OUTPUT INSERTED.id VALUES (@username, @email, @password)');
    
    const userId = insertUserResult.recordset[0].id;
    console.log(`✓ 成功插入用户，用户ID: ${userId}`);
    
    // 测试5: 插入测试帖子
    console.log('\n5. 测试插入帖子...');
    const insertPostResult = await pool.request()
      .input('title', sql.NVarChar, '测试帖子标题')
      .input('content', sql.NVarChar, '这是测试帖子的内容')
      .input('userId', sql.Int, userId)
      .query('INSERT INTO posts (title, content, user_id) OUTPUT INSERTED.id VALUES (@title, @content, @userId)');
    
    const postId = insertPostResult.recordset[0].id;
    console.log(`✓ 成功插入帖子，帖子ID: ${postId}`);
    
    // 测试6: 插入测试评论
    console.log('\n6. 测试插入评论...');
    const insertCommentResult = await pool.request()
      .input('content', sql.NVarChar, '这是一条测试评论')
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query('INSERT INTO comments (content, post_id, user_id) OUTPUT INSERTED.id VALUES (@content, @postId, @userId)');
    
    const commentId = insertCommentResult.recordset[0].id;
    console.log(`✓ 成功插入评论，评论ID: ${commentId}`);
    
    // 测试7: 查询插入的数据
    console.log('\n7. 测试查询插入的数据...');
    const userData = await pool.request()
      .input('id', sql.Int, userId)
      .query('SELECT * FROM users WHERE id = @id');
    console.log('✓ 查询用户数据:', userData.recordset[0]);
    
    const postData = await pool.request()
      .input('id', sql.Int, postId)
      .query('SELECT * FROM posts WHERE id = @id');
    console.log('✓ 查询帖子数据:', postData.recordset[0]);
    
    const commentData = await pool.request()
      .input('id', sql.Int, commentId)
      .query('SELECT * FROM comments WHERE id = @id');
    console.log('✓ 查询评论数据:', commentData.recordset[0]);
    
    // 测试8: 清理测试数据
    console.log('\n8. 清理测试数据...');
    await pool.request().input('id', sql.Int, commentId).query('DELETE FROM comments WHERE id = @id');
    await pool.request().input('id', sql.Int, postId).query('DELETE FROM posts WHERE id = @id');
    await pool.request().input('id', sql.Int, userId).query('DELETE FROM users WHERE id = @id');
    console.log('✓ 测试数据清理完成');
    
    console.log('\n🎉 所有数据库操作测试通过！');
    
  } catch (error) {
    console.error('❌ 数据库操作测试失败:', error);
  } finally {
    // 关闭连接池
    if (pool) {
      try {
        await pool.close();
        console.log('🔒 数据库连接已关闭');
      } catch (closeError) {
        console.error('关闭数据库连接时出错:', closeError);
      }
    }
  }
}

// 运行测试
testDatabaseOperations();