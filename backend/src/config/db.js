import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isLocalHost =
  process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

const useSsl = !process.env.DATABASE_URL
  ? !isLocalHost
  : !process.env.DATABASE_URL.includes("localhost") &&
    !process.env.DATABASE_URL.includes("127.0.0.1");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ...(useSsl && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      ...(useSsl && {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    };

const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log("Conexión establecida con la base de datos PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente inactivo de PostgreSQL:", err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;