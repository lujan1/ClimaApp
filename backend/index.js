// index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_KEY;

// ✅ Permitir acceso desde cualquier frontend (Vercel, Render, localhost, móvil, etc.)
app.use(cors({ origin: "*" }));

// Endpoint Clima Actual
app.get("/clima/:city", async (req, res) => {
  const city = req.params.city;
  const lang = req.query.lang || "es";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(404).json({ error: data.message });
    }

    res.json({
      ciudad: data.name,
      temperatura: `${data.main.temp}°C`,
      clima: data.weather[0].description,
      viento: `${data.wind.speed} m/s`,
      timezone: data.timezone,
      id: data.id
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el clima" });
  }
});

// Endpoint Pronóstico 24h
app.get("/pronostico/:city", async (req, res) => {
  const city = req.params.city;
  const lang = req.query.lang || "es";

  try {
    const responseCity = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
    );
    const cityData = await responseCity.json();

    if (cityData.cod !== 200) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }

    const { lat, lon } = cityData.coord;
    const responseForecast = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`
    );
    const forecastData = await responseForecast.json();

    const hourly = forecastData.list.slice(0, 8).map(item => ({
      hora: new Date(item.dt * 1000).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      temp: `${item.main.temp}°C`,
      clima: item.weather[0].description
    }));

    res.json(hourly);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pronóstico" });
  }
});

// ✅ Root test
app.get("/", (req, res) => res.send("Backend funcionando ✅"));

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
