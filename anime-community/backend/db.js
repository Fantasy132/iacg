const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'community_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10秒超时
  acquireTimeout: 10000,
  timeout: 10000,
  timezone: '+08:00' // 设置为中国时区
};

// 创建连接池
const pool = mysql.createPool(config);

// 扩展连接池功能
const getConnection = pool.getConnection.bind(pool);
pool.getConnection = async function() {
  const connection = await getConnection();
  // 确保每个连接都使用正确的时区
  await connection.execute("SET time_zone = '+08:00'");
  return connection;
};

// 为连接池添加query方法，保持与之前代码的兼容性
pool.query = function(sql, values) {
  return this.execute(sql, values);
};

// 测试数据库连接（带重试）
const testConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log('Attempting to connect to MySQL database...');
      console.log('DB Config:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
      });

      const connection = await pool.getConnection();
      console.log('MySQL Database connected successfully');

      // 设置时区
      await connection.execute("SET time_zone = '+08:00'");
      
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('Database query test result:', rows);

      connection.release();
      return; // 成功则退出
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);

      if (i === retries) {
        console.error('All connection attempts failed. Please check your MySQL server and configuration.');
        return; // 避免崩溃应用
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// 异步执行连接测试，不阻塞导出
testConnection().catch(err => {
  console.warn('Unexpected error during connection test:', err.message);
});

module.exports = pool;