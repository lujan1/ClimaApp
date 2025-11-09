import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://daniellujan123489_db_user:Station192005@cluster0.n8s8m2l.mongodb.net/";
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};
