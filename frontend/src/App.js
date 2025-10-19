import { useState, useEffect } from "react";
import "./App.css";
import StarBackground from "./StarBackground";
import ForecastCarousel from "./ForecastCarousel";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // API Base según entorno
  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://app-clima-4-ztm9.onrender.com";

  const getWeather = async (e) => {
    e?.preventDefault();
    if (!city.trim()) return setError("Ingresa una ciudad válida");

    setError(null);
    setWeather(null);
    setForecast([]);

    try {
      const res = await fetch(`${API_BASE}/clima/${encodeURIComponent(city)}?lang=es`);
      const data = await res.json();
      if (!res.ok || !data.ciudad) {
        setError(data.error || "Ciudad no encontrada");
        return;
      }
      setWeather(data);
      fetchForecast(city);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el backend");
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const res = await fetch(`${API_BASE}/pronostico/${encodeURIComponent(cityName)}?lang=es`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setError(data.error || "No se pudo obtener pronóstico");
        return;
      }
      setForecast(data);
    } catch (err) {
      console.error("Error pronóstico:", err);
      setError("Error al obtener pronóstico");
    }
  };

  useEffect(() => {
    if (weather?.timezone !== undefined) {
      const updateClock = () => {
        const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
        const local = new Date(utc + weather.timezone * 1000);
        setTime(local.toLocaleTimeString());
        setDate(
          local.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      };
      updateClock();
      const id = setInterval(updateClock, 1000);
      return () => clearInterval(id);
    }
  }, [weather]);

  return (
    <div className="app-shell">
      <StarBackground />

      <div className="ui-card">
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

        {error && <div className="error-bar">{error}</div>}

        {weather && (
          <section className="current-section">
            <div className="current-left">
              <h2 className="city-name">{weather.ciudad}</h2>
              <div className="meta-row">
                <div className="clock">🕒 {time}</div>
                <div className="date">📅 {date}</div>
              </div>
              <div className="temp-large">{weather.temperatura}°C</div>
              <div className="desc-large">{weather.clima}</div>
              <div className="wind">💨 {weather.viento} m/s</div>
            </div>
            <div className="current-right">
              <div className="big-advice">{generateAdvice(weather.clima)}</div>
            </div>
          </section>
        )}

        {forecast.length > 0 && (
          <section className="forecast-section">
            <h3 className="section-title">Pronóstico (24h)</h3>
            <ForecastCarousel data={forecast} />
          </section>
        )}

        <footer className="ui-footer">Backend: {API_BASE}</footer>
      </div>
    </div>
  );
}

function generateAdvice(climaDesc = "") {
  const d = climaDesc.toLowerCase();
  if (d.includes("rain") || d.includes("lluv")) return "☔ Lleva sombrilla...";
  if (d.includes("storm") || d.includes("thunder") || d.includes("torment")) return "⚡ Tormenta en camino...";
  if (d.includes("snow") || d.includes("nieve")) return "❄ Nieve probable...";
  if (d.includes("clear") || d.includes("despejad")) return "☀ Día soleado...";
  if (d.includes("cloud") || d.includes("nubes")) return "☁ Nublado...";
  if (d.includes("mist") || d.includes("fog") || d.includes("niebla")) return "🌫 Visibilidad reducida...";
  return "🌈 Mantente preparado según la temperatura.";
}

export default App;
