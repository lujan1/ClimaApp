// index.js
// Backend Express para OpenWeather + pronóstico 24h con cache 30min
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("⚠️  ATENCIÓN: no se encontró API_KEY en las env vars. Colócala en Render como variable 'API_KEY'.");
}

app.use(cors()); // permite conexiones desde el frontend desplegado

// cache simple en memoria (por ciudad)
let forecastCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// RUTA DE PRUEBA
app.get('/', (req, res) => {
  res.send('🌦️ Weather API funcionando con pronóstico extendido');
});

// CLIMA ACTUAL
app.get('/clima/:city', async (req, res) => {
  const city = req.params.city;
  const lang = req.query.lang || req.headers["accept-language"]?.split(",")[0].split("-")[0] || "es";

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: API_KEY, units: 'metric', lang }
    });
    const data = response.data;

    res.json({
      ciudad: data.name,
      temperatura: `${data.main.temp} °C`,
      clima: data.weather[0].description,
      viento: `${data.wind.speed} m/s`,
      timezone: data.timezone,
      idioma: lang
    });
  } catch (error) {
    console.error("❌ Error en OpenWeather (clima):", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.message || "Error obteniendo el clima";
    res.status(status).json({ error: msg });
  }
});

// PRONÓSTICO 24H (8 bloques de 3h) - con cache 30min
app.get('/pronostico/:city', async (req, res) => {
  const city = req.params.city;
  const lang = req.query.lang || "es";

  // si hay cache y no expiró, devolverla
  if (forecastCache[city] && (Date.now() - forecastCache[city].timestamp < CACHE_DURATION)) {
    return res.json(forecastCache[city].data);
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: API_KEY, units: 'metric', lang }
    });

    const timezone = response.data.city.timezone;

    // tomar los primeros 8 bloques (24h)
    const forecast24h = response.data.list.slice(0, 8).map(item => {
      const utcMs = item.dt * 1000;
      const local = new Date(utcMs + timezone * 1000);

      const main = item.weather[0].main.toLowerCase();
      let message = "";

      if (main.includes("rain") || main.includes("lluv")) message = "☔ Puede que llueva, lleva sombrilla y una chaqueta ligera.";
      else if (main.includes("storm") || main.includes("thunder") || main.includes("torment")) message = "⚡ Tormenta en camino — evita zonas abiertas y asegura tus cosas.";
      else if (main.includes("snow") || main.includes("nieve")) message = "❄ Nieve probable — abrígate y evita superficies resbaladizas.";
      else if (main.includes("clear") || main.includes("despejad")) message = "☀ Día soleado — protector solar y gafas para cuidar la piel.";
      else if (main.includes("cloud") || main.includes("nubes")) message = "☁ Nublado — día ideal para una pausa y un café.";
      else if (main.includes("mist") || main.includes("fog") || main.includes("niebla")) message = "🌫 Visibilidad reducida — maneja con precaución y usa luces.";
      else message = "🌈 Mantente atento al clima y disfruta el día.";

      return {
        hora: local.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        timestamp: item.dt,
        temperatura: `${item.main.temp} °C`,
        clima: item.weather[0].description,
        mensaje: message
      };
    });

    // guardar en cache
    forecastCache[city] = { timestamp: Date.now(), data: forecast24h };
    res.json(forecast24h);
  } catch (error) {
    console.error("❌ Error en OpenWeather (pronóstico):", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const msg = error.response?.data?.message || "Error obteniendo el pronóstico";
    res.status(status).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
