const sql = require('mssql');
require('dotenv').config();

// SQL Server配置
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function simpleTest() {
  let pool;
  try {
    console.log('尝试连接数据库...');
    pool = await sql.connect(config);
    console.log('✓ 数据库连接成功');
    
    console.log('执行简单查询...');
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✓ 查询结果:', result.recordset);
    
    console.log('尝试查询用户表...');
    try {
      const userResult = await pool.request().query('SELECT TOP 1 * FROM users');
      console.log('✓ 用户表查询成功，返回记录数:', userResult.recordset.length);
    } catch (userError) {
      console.log('ℹ 用户表可能不存在或为空');
    }
    
    console.log('\n🎉 简单测试完成！');
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('🔒 连接已关闭');
      } catch (closeError) {
        console.error('关闭连接时出错:', closeError.message);
      }
    }
  }
}

simpleTest();