import axios from 'axios';

async function getWeather(req, res) {
  try {
    const city = req.params.city || req.query.city || 'Bogota';
    const apiKey = process.env.OPENWEATHER_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta OPENWEATHER_KEY en .env' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}&lang=es`;

    const resp = await axios.get(url);
    const data = resp.data;

    // Formatear respuesta
    const formatted = {
      ciudad: data.name,
      pais: data.sys.country,
      temperatura: Math.round(data.main.temp),
      clima: data.weather[0].description,
      viento: data.wind.speed,
      timezone: data.timezone
    };

    return res.json(formatted);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener el clima' });
  }
}

async function getForecast(req, res) {
  try {
    const city = req.params.city || req.query.city || 'Bogota';
    const apiKey = process.env.OPENWEATHER_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta OPENWEATHER_KEY en .env' });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}&lang=es`;

    const resp = await axios.get(url);
    const data = resp.data;

    // Formatear pronóstico (primeros 8 items para 24h)
    const forecast = data.list.slice(0, 8).map(item => ({
      fecha: item.dt_txt,
      temperatura: Math.round(item.main.temp),
      descripcion: item.weather[0].description,
      icono: item.weather[0].icon
    }));

    return res.json(forecast);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener pronóstico' });
  }
}

export { getWeather, getForecast };
