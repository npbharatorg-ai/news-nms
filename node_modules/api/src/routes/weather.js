import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

const MOCK_WEATHER_DATA = [
  {
    city: 'Delhi',
    temperature: 28.5,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind_speed: 12.5,
  },
  {
    city: 'Mumbai',
    temperature: 32.1,
    condition: 'Sunny',
    humidity: 72,
    wind_speed: 15.3,
  },
  {
    city: 'Bangalore',
    temperature: 26.8,
    condition: 'Rainy',
    humidity: 78,
    wind_speed: 8.2,
  },
  {
    city: 'Hyderabad',
    temperature: 30.2,
    condition: 'Sunny',
    humidity: 58,
    wind_speed: 10.1,
  },
  {
    city: 'Chennai',
    temperature: 31.5,
    condition: 'Partly Cloudy',
    humidity: 75,
    wind_speed: 18.7,
  },
  {
    city: 'Kolkata',
    temperature: 29.3,
    condition: 'Cloudy',
    humidity: 68,
    wind_speed: 11.4,
  },
  {
    city: 'Pune',
    temperature: 27.6,
    condition: 'Sunny',
    humidity: 62,
    wind_speed: 9.8,
  },
  {
    city: 'Ahmedabad',
    temperature: 33.2,
    condition: 'Sunny',
    humidity: 55,
    wind_speed: 14.2,
  },
  {
    city: 'Jaipur',
    temperature: 31.8,
    condition: 'Partly Cloudy',
    humidity: 60,
    wind_speed: 13.5,
  },
  {
    city: 'Lucknow',
    temperature: 28.9,
    condition: 'Cloudy',
    humidity: 70,
    wind_speed: 10.6,
  },
];

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  },
});

router.get('/', async (req, res) => {
  const apiKey = process.env.WEATHER_API_KEY;

  // Validate API key is configured
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  logger.info(`Using Weather API key: ${apiKey.substring(0, 8)}...`);

  const weatherData = [];
  const failedCities = [];

  for (const city of CITIES) {
    try {
      logger.info(`Fetching weather for ${city}`);
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      logger.info(`Weather API URL: ${url.substring(0, 80)}...`);

      const response = await axiosInstance.get(url);

      if (!response.data) {
        throw new Error(`Empty response for ${city}`);
      }

      if (response.status === 401) {
        throw new Error(
          'Weather API authentication failed: Invalid API key. Please verify WEATHER_API_KEY in environment variables.'
        );
      }

      const weatherEntry = {
        city: response.data.name || city,
        temperature: response.data.main?.temp || null,
        condition: response.data.weather?.[0]?.main || 'N/A',
        humidity: response.data.main?.humidity || null,
        wind_speed: response.data.wind?.speed || null,
      };

      weatherData.push(weatherEntry);
      logger.info(`Successfully fetched weather for ${city}`);
    } catch (error) {
      logger.warn(
        `Failed to fetch weather for ${city}: ${error.code || error.message}`
      );
      failedCities.push(city);

      if (error.response?.status === 401) {
        throw new Error(
          'Weather API authentication failed: Invalid API key. Please verify WEATHER_API_KEY in environment variables.'
        );
      }
    }
  }

  if (weatherData.length === 0) {
    logger.warn(
      `All weather API requests failed for cities: ${failedCities.join(', ')}. Returning mock data.`
    );
    res.json(MOCK_WEATHER_DATA);
    return;
  }

  if (failedCities.length > 0) {
    logger.warn(
      `Weather API failed for ${failedCities.length} cities: ${failedCities.join(', ')}. Returning partial data.`
    );
  }

  logger.info(`Successfully fetched weather data for ${weatherData.length} cities`);
  res.json(weatherData);
});

export default router;