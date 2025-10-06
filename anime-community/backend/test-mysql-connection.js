const pool = require('./db');

async function testConnection() {
    try {
        console.log('Testing MySQL database connection...');
        
        // 执行简单查询
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        console.log('✅ Database connection successful!');
        console.log('✅ Simple query test result:', rows[0]);
        
        // 查询用户表
        try {
            const [users] = await pool.execute('SELECT * FROM users LIMIT 1');
            console.log('✅ Users table query successful, found records:', users.length);
        } catch (error) {
            console.log('ℹ Users table may not exist or is empty');
        }
        
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.errno) {
            console.error('Error errno:', error.errno);
        }
    }
}

testConnection();