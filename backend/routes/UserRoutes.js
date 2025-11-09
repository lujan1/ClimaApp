import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  addUser,
  listAllUsers,
  listUserById,
  updateUser,
  deleteUser
} from "../controllers/User.Controller.js";

const router = express.Router();

// Crear usuario (registro)
router.post("/register", addUser);

// Iniciar sesión
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    res.status(200).json({ message: "Inicio de sesión exitoso", user: { nombre: user.nombre, email: user.email } });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

router.post("/login", loginUser);

// Listar todos los usuarios
router.get("/", listAllUsers);

// Listar usuario por ID
router.get("/:id", listUserById);

// Actualizar usuario
router.put("/:id", updateUser);

// Eliminar usuario
router.delete("/:id", deleteUser);

export default router;
