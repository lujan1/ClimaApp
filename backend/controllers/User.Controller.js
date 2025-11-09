import User from "../models/User.js";
import bcrypt from "bcrypt";

// Crear usuario (registro)
export const addUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nombre, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado con éxito", user: { nombre: newUser.nombre, email: newUser.email } });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Listar todos los usuarios
export const listAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Listar usuario por ID
export const listUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario actualizado", user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
