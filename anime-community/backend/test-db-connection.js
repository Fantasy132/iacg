// test-db-connection.js
import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

// 数据库配置
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // 对于 Azure 使用 true
        trustServerCertificate: true // 如果连接本地 SQL Server，设置为 true
    }
};

async function testConnection() {
    try {
        console.log('正在尝试连接数据库...');
        await sql.connect(config);
        console.log('✅ 数据库连接成功!');
        
        // 执行一个简单的查询来测试
        const result = await sql.query`SELECT 1 as connection_test`;
        console.log('✅ 查询执行成功:', result.recordset);
        
        // 关闭连接
        await sql.close();
        console.log('🔒 数据库连接已关闭');
        
    } catch (err) {
        console.error('❌ 数据库连接失败:', err);
    }
}

testConnection();