import express from 'express';
import { getWeather, getForecast } from '../controllers/WeatherController.js';

const router = express.Router();

router.get('/:city', getWeather);
router.get('/', getWeather); // Para compatibilidad

export default router;
