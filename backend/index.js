// backend/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_KEY;

// ✅ CORS abierto
app.use(cors({ origin: "*" }));

// ✅ Clima actual
app.get("/clima/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lang = req.query.lang || "es";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(404).json({ error: data.message });
    }

    res.json({
      ciudad: data.name,
      pais: data.sys.country,
      temperatura: data.main.temp,
      descripcion: data.weather[0].description,
      icono: data.weather[0].icon,
      viento: data.wind.speed,
      humedad: data.main.humidity,
      presion: data.main.pressure,
      lat: data.coord.lat,
      lon: data.coord.lon,
      timezone: data.timezone,
      id: data.id
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el clima" });
  }
});

// ✅ Pronóstico extendido
app.get("/pronostico/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lang = req.query.lang || "es";

    const cityData = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    ).then(r => r.json());

    if (cityData.cod !== 200) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }

    const { lat, lon } = cityData.coord;

    const forecastData = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`
    ).then(r => r.json());

    const hourly = forecastData.list.map(item => ({
      fecha: item.dt_txt,
      temperatura: item.main.temp,
      descripcion: item.weather[0].description,
      icono: item.weather[0].icon
    }));

    res.json(hourly);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pronóstico" });
  }
});

// ✅ Iniciar servidor
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
