const axios = require('axios');

async function getWeather(req, res) {
  try {
    const city = req.query.city || 'Bogota';
    const apiKey = process.env.OPENWEATHER_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta OPENWEATHER_KEY en .env' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    const resp = await axios.get(url);
    return res.json(resp.data);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener el clima' });
  }
}

module.exports = { getWeather };
