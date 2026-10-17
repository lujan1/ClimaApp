// Importamos el pool de conexión que acabamos de crear
import { pool } from "../db.js";
import bcrypt from "bcrypt";

// Función para crear un nuevo usuario (registro)
export const addUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 1. Verificar si el usuario ya existe
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar el nuevo usuario en MySQL
    const [result] = await pool.query(
      "INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario creado con éxito",
      user: { id: result.insertId, nombre, email },
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Función para listar todos los usuarios
export const listAllUsers = async (req, res) => {
  try {
    // Seleccionamos todo menos el password por seguridad
    const [users] = await pool.query("SELECT id, nombre, email, created_at FROM users");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error al listar usuarios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Función para listar un usuario por ID
export const listUserById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, email, created_at FROM users WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Error al buscar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Función para actualizar un usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body; 

    // Actualizamos el nombre y correo donde coincida el ID
    const [result] = await pool.query(
      "UPDATE users SET nombre = ?, email = ? WHERE id = ?",
      [nombre, email, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario actualizado con éxito" });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Función para eliminar un usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminamos el usuario por su ID
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};