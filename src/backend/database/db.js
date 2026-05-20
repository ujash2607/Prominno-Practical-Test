const { Pool } = require("pg");

const pool = new Pool({
     user: process.env.DB_USER || "postgres",
     password: process.env.DB_PASSWROD || "postgres",
     host: process.env.DB_HOST || "localhost",
     port: process.env.DB_PORT || 5432,
     database: process.env.DB_NAME || "product_management_system"
});

async function connectDB() {
     try {
          await pool.connect();
          console.log('Database connected successfully');
     } catch (error) {
          console.log(error, 'Error while connect database');
          return error;
     }
}

module.exports = pool;