import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB correctamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};
