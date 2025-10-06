const pool = require('./db');

async function checkPosts() {
    try {
        console.log('检查数据库连接和帖子数据...');
        
        // 检查数据库连接
        const [result] = await pool.execute('SELECT 1 as connection');
        console.log('✅ 数据库连接成功');
        
        // 检查是否有posts表
        try {
            const [posts] = await pool.execute('SELECT COUNT(*) as count FROM posts');
            console.log(`✅ posts表存在，共有 ${posts[0].count} 条记录`);
        } catch (error) {
            console.log('❌ posts表可能不存在或查询出错:', error.message);
        }
        
        // 检查是否有users表
        try {
            const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
            console.log(`✅ users表存在，共有 ${users[0].count} 条记录`);
        } catch (error) {
            console.log('❌ users表可能不存在或查询出错:', error.message);
        }
        
        // 尝试查询一些帖子数据
        try {
            const [postsData] = await pool.execute(`
                SELECT 
                  p.id,
                  p.title,
                  p.content,
                  p.user_id,
                  DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                  u.username as author,
                  u.display_name as author_display_name,
                  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
                  (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                ORDER BY p.created_at DESC
                LIMIT 5
            `);
            console.log('✅ 帖子数据查询成功:');
            console.log(postsData);
        } catch (error) {
            console.log('❌ 查询帖子数据时出错:', error.message);
        }
        
    } catch (error) {
        console.error('❌ 数据库连接测试失败:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.errno) {
            console.error('Error errno:', error.errno);
        }
    }
}

checkPosts();