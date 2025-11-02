import express from 'express';
import { getWeather, getForecast } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/:city', getWeather);
router.get('/', getWeather); // Para compatibilidad

// Para pronóstico
router.get('/pronostico/:city', getForecast);

export default router;
