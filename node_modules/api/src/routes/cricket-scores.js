import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const MOCK_CRICKET_DATA = [
  {
    id: 'mock-1',
    match_name: 'India vs Australia - Test Match',
    team1: 'India',
    team2: 'Australia',
    team1_runs: 450,
    team1_wickets: 8,
    team2_runs: 380,
    team2_wickets: 5,
    status: 'Live',
    winner: null,
  },
  {
    id: 'mock-2',
    match_name: 'England vs Pakistan - ODI',
    team1: 'England',
    team2: 'Pakistan',
    team1_runs: 285,
    team1_wickets: null,
    team2_runs: null,
    team2_wickets: null,
    status: 'Upcoming',
    winner: null,
  },
  {
    id: 'mock-3',
    match_name: 'West Indies vs South Africa - T20',
    team1: 'West Indies',
    team2: 'South Africa',
    team1_runs: 165,
    team1_wickets: 7,
    team2_runs: 168,
    team2_wickets: 4,
    status: 'Completed',
    winner: 'South Africa',
  },
];

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  },
});

const fetchWithRetry = async (url, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Cricket API attempt ${attempt}/${maxRetries}: ${url}`);
      const response = await axiosInstance.get(url);
      return response;
    } catch (error) {
      lastError = error;
      const errorCode = error.code || error.response?.status;
      logger.warn(
        `Cricket API attempt ${attempt} failed: ${errorCode} - ${error.message}`
      );

      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        logger.info(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

router.get('/', async (req, res) => {
  const apiKey = process.env.CRICKET_API_KEY;

  if (!apiKey) {
    throw new Error('Cricket API key not configured');
  }

  try {
    const response = await fetchWithRetry(
      `https://api.cricketdata.org/v1/matches?apikey=${apiKey}`
    );

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response structure from Cricket API');
    }

    const matches = response.data.data.map((match) => {
      const team1 = match.t1 || {};
      const team2 = match.t2 || {};

      return {
        id: match.id,
        match_name: match.name || 'N/A',
        team1: team1.name || 'N/A',
        team2: team2.name || 'N/A',
        team1_runs: team1.r || null,
        team1_wickets: team1.w || null,
        team2_runs: team2.r || null,
        team2_wickets: team2.w || null,
        status: match.status || 'Upcoming',
        winner: match.winner || null,
      };
    });

    logger.info(`Successfully fetched ${matches.length} cricket matches`);
    res.json(matches);
  } catch (error) {
    logger.error(
      `Cricket API failed after retries: ${error.code || error.message}`
    );

    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND'
    ) {
      logger.warn('Connection error detected, returning mock cricket data');
      res.json(MOCK_CRICKET_DATA);
      return;
    }

    throw error;
  }
});

export default router;