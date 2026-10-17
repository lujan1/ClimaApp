import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Crear un pool de conexiones a MySQL
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 33061,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "app_clima_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const connectDB = async () => {
  try {
    // Probamos la conexión obteniendo un cliente del pool
    const connection = await pool.getConnection();
    console.log("✅ Conectado a MySQL correctamente");
    connection.release(); // Soltamos la conexión para que otros la usen
  } catch (error) {
    console.error("❌ Error al conectar a MySQL:", error.message);
    process.exit(1);
  }
};