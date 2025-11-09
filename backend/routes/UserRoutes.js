import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// Registrar usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const userExistente = await User.findOne({ email });
    if (userExistente)
      return res.status(400).json({ error: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new User({ nombre, email, password: hashedPassword });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });

    if (!usuario)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({ mensaje: "Inicio de sesión exitoso", usuario });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
