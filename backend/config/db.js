const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL database connected");
});

pool.on("error", (error) => {
  console.error("❌ PostgreSQL pool error");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
});

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log(
      "✅ Database connection test successful:",
      result.rows[0].now
    );

    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Detail:", error.detail || "N/A");

    return false;
  }
};

module.exports = {
  pool,
  testDatabaseConnection,
};