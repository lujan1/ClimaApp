// Importaciones necesarias
import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js"; // Importamos la conexión a MySQL
import {
  addUser,
  listAllUsers,
  listUserById,
  updateUser,
  deleteUser
} from "../controllers/User.Controller.js";

// Crear router de Express
const router = express.Router();

// ⚠️ Primero las rutas específicas

// Ruta para registrar un nuevo usuario
router.post("/register", addUser);

// Ruta para iniciar sesión (ACTUALIZADA PARA MYSQL)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    // 1. Buscar usuario por email en MySQL
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    
    // Si no hay resultados, el usuario no existe
    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // 2. Verificar que la contraseña sea correcta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // 3. Respuesta exitosa (sin enviar la contraseña)
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Luego las rutas genéricas (CRUD completo para usuarios)

router.get("/", listAllUsers);
router.get("/:id", listUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;