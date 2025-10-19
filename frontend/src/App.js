// App.jsx (archivo principal)
// Contiene: buscador, clima actual, reloj con zona horaria, pronóstico 24h futurista

import { useState, useEffect } from "react";
import "./App.css";
import StarBackground from "./StarBackground";
import ForecastCarousel from "./ForecastCarousel";

function App() {
  // Estados
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null); // clima actual
  const [forecast, setForecast] = useState([]); // pronóstico 24h
  const [error, setError] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // Obtener clima actual
  const getWeather = async (e) => {
    e && e.preventDefault();
    if (!city.trim()) return setError("Ingresa una ciudad válida");

    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      const res = await fetch(`https://app-clima-delta-eight.vercel.app/clima/${encodeURIComponent(city)}?lang=es`);
      const data = await res.json();
      if (!res.ok || !data.ciudad) {
        setError(data.error || "Ciudad no encontrada");
        return;
      }
      setWeather(data);

      // luego pedir pronóstico 24h
      fetchForecast(city, data.id || city); // data.id optional; backend uses city name
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el backend");
    }
  };

  // Fetch pronóstico 24h (usa endpoint /pronostico/:city)
  const fetchForecast = async (cityName) => {
    try {
      const res = await fetch(`https://app-clima-delta-eight.vercel.app/pronostico/${encodeURIComponent(cityName)}?lang=es`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        // backend devuelve array; si viene error, mostrar
        setError(data.error || "No se pudo obtener pronóstico");
        return;
      }
      setForecast(data);
    } catch (err) {
      console.error("Error pronóstico:", err);
      setError("Error al obtener pronóstico");
    }
  };

  // Reloj según timezone del weather
  useEffect(() => {
    if (weather && weather.timezone !== undefined) {
      const updateClock = () => {
        const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
        const local = new Date(utc + (weather.timezone || 0) * 1000);
        setTime(local.toLocaleTimeString());
        setDate(local.toLocaleDateString("es-ES", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        }));
      };
      updateClock();
      const id = setInterval(updateClock, 1000);
      return () => clearInterval(id);
    }
  }, [weather]);

  return (
    <div className="app-shell">
      {/* Fondo de estrellas independiente (no se re-renderiza con reloj) */}
      <StarBackground />

      <div className="ui-card">
        {/* Buscador */}
        <header className="ui-header">
          <h1 className="brand">APP CLIMA</h1>
          <form onSubmit={getWeather} className="search-row">
            <input
              className="search-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: London"
            />
            <button className="search-btn" type="submit">Buscar</button>
          </form>
        </header>

        {/* Mensajes de error */}
        {error && <div className="error-bar">{error}</div>}

        {/* CLIMA ACTUAL */}
        {weather && (
          <section className="current-section">
            <div className="current-left">
              <h2 className="city-name">{weather.ciudad}</h2>
              <div className="meta-row">
                <div className="clock">🕒 {time}</div>
                <div className="date">📅 {date}</div>
              </div>
              <div className="temp-large">{weather.temperatura}</div>
              <div className="desc-large">{weather.clima}</div>
              <div className="wind">💨 {weather.viento}</div>
            </div>
            <div className="current-right">
              {/* Mensaje brillante según clima actual */}
              <div className="big-advice">
                {generateAdvice(weather.clima)}
              </div>
            </div>
          </section>
        )}

        {/* PRONÓSTICO HORIZONTAL 24H */}
        {forecast && forecast.length > 0 && (
          <section className="forecast-section">
            <h3 className="section-title">Pronóstico (24h)</h3>
            <ForecastCarousel data={forecast} />
          </section>
        )}

        <footer className="ui-footer">Backend: https://app-clima-delta-eight.vercel.app</footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Generador de mensajes motivacionales/subtiles
   --------------------------------------------- */
function generateAdvice(climaDesc = "") {
  const d = climaDesc.toLowerCase();
  if (d.includes("rain") || d.includes("lluv")) {
    return "☔ Parece que lloverá — lleva sombrilla y cuida tus planes. ¡Disfruta con estilo incluso bajo la lluvia!";
  }
  if (d.includes("storm") || d.includes("thunder") || d.includes("torment")) {
    return "⚡ Tormenta en camino — evita zonas abiertas y resguarda objetos sueltos. Seguridad primero.";
  }
  if (d.includes("snow") || d.includes("nieve")) {
    return "❄ Nieve probable — abrígate, calzado antideslizante y disfruta del paisaje helado.";
  }
  if (d.includes("clear") || d.includes("despejad")) {
    return "☀ Día soleado — protector solar y gafas. Hoy tu piel te lo agradecerá.";
  }
  if (d.includes("cloud") || d.includes("nubes")) {
    return "☁ Nublado — perfecto para una pausa con café y buena música.";
  }
  if (d.includes("mist") || d.includes("fog") || d.includes("niebla")) {
    return "🌫 Visibilidad reducida — maneja con precaución y mantén las luces encendidas.";
  }
  return "🌈 Mantente preparado: revisa la ropa según la temperatura y disfruta el día.";
}

export default App;
