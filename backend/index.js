// backend/index.js
// Backend corregido: usa fetch global o node-fetch dinámico si hace falta.
// Requiere Node >=18 para usar fetch nativo. Si tu Node <18 instala `node-fetch`.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Leer claves (admite varios nombres que has usado)
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY || process.env.API_KEY || process.env.OPENWEATHER;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_KEY || process.env.UNSPLASH;

// Mensajes claros si faltan keys
if (!OPENWEATHER_KEY) {
  console.error("❌ OPENWEATHER_KEY no encontrada. Añádela a .env como OPENWEATHER_KEY=tu_key");
}
if (!UNSPLASH_KEY) {
  console.warn("⚠️ UNSPLASH_KEY no encontrada. Se usará fallback genérico para fondos.");
}

// CORS: permitir peticiones desde cualquier origen (puedes restringir cambiando origin)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Responder OPTIONS para rutas usadas (preflight)
app.options("/clima/:city", (req, res) => res.sendStatus(200));
app.options("/pronostico/:city", (req, res) => res.sendStatus(200));
app.options("/fondo/:city", (req, res) => res.sendStatus(200));

// Helper que utiliza fetch global si existe, o carga node-fetch dinámicamente
async function getFetch() {
  if (typeof fetch !== "undefined") return fetch;
  // Intentar import dinámico de node-fetch (si no está instalado fallará)
  try {
    const mod = await import("node-fetch");
    return mod.default || mod;
  } catch (e) {
    throw new Error("fetch no disponible y no se pudo importar node-fetch. Instala node-fetch o usa Node >=18.");
  }
}

// Helper para llamar y parsear JSON con control de errores
async function fetchJson(url, opts) {
  const f = await getFetch();
  const res = await f(url, opts);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // no JSON
  }
  return { ok: res.ok, status: res.status, json, raw: text };
}

/* ================= RUTAS API ================= */

// Ruta raíz (prueba)
app.get("/", (req, res) => {
  res.send("🌦️ Weather API funcionando - backend listo");
});

// CLIMA ACTUAL
app.get("/clima/:city", async (req, res) => {
  try {
    if (!OPENWEATHER_KEY) {
      return res.status(500).json({ error: "OpenWeather API key no configurada en el servidor." });
    }

    const city = req.params.city;
    const lang = req.query.lang || req.headers["accept-language"]?.split(",")?.[0]?.split("-")?.[0] || "es";

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric&lang=${lang}`;
    const call = await fetchJson(url);

    if (!call.ok) {
      const msg = call.json?.message || call.raw || "Error proveedor OpenWeather";
      return res.status(call.status === 200 ? 500 : call.status).json({ error: msg });
    }

    const data = call.json;
    // Validaciones mínimas
    if (!data || !data.weather || !data.weather[0]) {
      return res.status(500).json({ error: "Respuesta inesperada del proveedor" });
    }

    res.json({
      ciudad: data.name,
      pais: data.sys?.country,
      temperatura: data.main?.temp,
      clima: data.weather[0].description,
      icono: data.weather[0].icon,
      viento: data.wind?.speed,
      humedad: data.main?.humidity,
      presion: data.main?.pressure,
      lat: data.coord?.lat,
      lon: data.coord?.lon,
      timezone: data.timezone,
      id: data.id
    });
  } catch (error) {
    console.error("❌ Error en /clima/:city =>", error);
    res.status(500).json({ error: "Error al obtener el clima" });
  }
});

// PRONÓSTICO 24H (usa coordenadas para más precisión)
app.get("/pronostico/:city", async (req, res) => {
  try {
    if (!OPENWEATHER_KEY) {
      return res.status(500).json({ error: "OpenWeather API key no configurada." });
    }

    const city = req.params.city;
    const lang = req.query.lang || "es";

    // Obtener coordenadas desde /weather
    const cityUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric&lang=${lang}`;
    const cityCall = await fetchJson(cityUrl);
    if (!cityCall.ok) {
      const msg = cityCall.json?.message || cityCall.raw || "Ciudad no encontrada";
      return res.status(cityCall.status === 200 ? 500 : cityCall.status).json({ error: msg });
    }
    const cityData = cityCall.json;
    if (!cityData?.coord) return res.status(500).json({ error: "Coordenadas de la ciudad no disponibles" });

    const { lat, lon } = cityData.coord;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric&lang=${lang}`;
    const forecastCall = await fetchJson(forecastUrl);
    if (!forecastCall.ok) {
      const msg = forecastCall.json?.message || forecastCall.raw || "Error proveedor forecast";
      return res.status(forecastCall.status === 200 ? 500 : forecastCall.status).json({ error: msg });
    }

    const forecastData = forecastCall.json;
    const hourly = Array.isArray(forecastData.list)
      ? forecastData.list.slice(0, 8).map(item => ({
          fecha: item.dt_txt,
          temperatura: item.main?.temp,
          descripcion: item.weather?.[0]?.description,
          icono: item.weather?.[0]?.icon,
          timestamp: item.dt
        }))
      : [];

    res.json(hourly);
  } catch (error) {
    console.error("❌ Error en /pronostico/:city =>", error);
    res.status(500).json({ error: "Error al obtener pronóstico" });
  }
});

// FONDO (Unsplash) según ciudad + clima — Opción 1: clima priorizado, fallback genérico
app.get("/fondo/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const climaRaw = req.query.clima || "weather";
    const clima = String(climaRaw).toLowerCase();

    // Query: "CITY CLIMA weather"
    const query = `${city} ${clima} weather`;

    // Si no hay clave Unsplash, devolver imagen generica de source.unsplash
    if (!UNSPLASH_KEY) {
      const fallback = `https://source.unsplash.com/1600x900/?${encodeURIComponent(clima)},city`;
      return res.json({ imageUrl: fallback, source: "fallback" });
    }

    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=6&client_id=${UNSPLASH_KEY}`;
    const unsplashCall = await fetchJson(unsplashUrl);

    if (!unsplashCall.ok) {
      console.error("Unsplash API error:", unsplashCall.status, unsplashCall.json ?? unsplashCall.raw);
      const fallback = `https://source.unsplash.com/1600x900/?${encodeURIComponent(clima)},city`;
      return res.json({ imageUrl: fallback, source: "fallback" });
    }

    const results = unsplashCall.json?.results || [];
    const imageUrl = results.length > 0 ? results[0].urls.regular : `https://source.unsplash.com/1600x900/?${encodeURIComponent(clima)},city`;
    res.json({ imageUrl, source: results.length > 0 ? "unsplash" : "fallback" });
  } catch (error) {
    console.error("❌ Error en /fondo/:city =>", error);
    res.status(500).json({ error: "Error al obtener fondo" });
  }
});

/* ================= SERVIR FRONTEND (si tienes build) =================
   Nota: antes de desplegar, en /frontend ejecuta `npm run build`
   y asegura que la carpeta final esté en ../frontend/build
*/
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Si no existe el build, las rutas API seguirán funcionando.
// En producción conviene servir index.html en todas las rutas (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"), (err) => {
    if (err) {
      // Si no existe el build, devolvemos un mensaje simple
      return res.status(200).send("Backend corriendo. Si quieres servir frontend, crea build en frontend.");
    }
  });
});

/* ================= INICIAR SERVIDOR ================= */
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
