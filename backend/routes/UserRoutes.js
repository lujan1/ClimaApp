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

// ⚠️ Primero las rutas específicas
router.post("/register", addUser);

router.post("/login", async (req, res) => {
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

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: { nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Luego las rutas genéricas
router.get("/", listAllUsers);
router.get("/:id", listUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
