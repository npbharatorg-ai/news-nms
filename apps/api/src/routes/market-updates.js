import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const stockApiKey = process.env.STOCK_API_KEY;

  if (!stockApiKey) {
    throw new Error('Stock API key not configured');
  }

  // Fetch stock data
  const stockResponse = await axios.get(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TCS.BSE&apikey=${stockApiKey}`
  );

  if (!stockResponse.data) {
    throw new Error('Failed to fetch stock data');
  }

  const quote = stockResponse.data['Global Quote'] || {};
  const stockPrice = parseFloat(quote['05. price']) || 0;
  const stockChange = parseFloat(quote['09. change']) || 0;
  const stockChangePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0;

  // Mock gold and silver data (since no free API available)
  // In production, you would fetch from a real commodity API
  const marketData = {
    gold: {
      price: 7250.5,
      change: 125.5,
      percentage: 1.75,
    },
    silver: {
      price: 92500.0,
      change: -250.0,
      percentage: -0.27,
    },
    stock: {
      symbol: 'TCS.BSE',
      price: stockPrice,
      change: stockChange,
      percentage: stockChangePercent,
    },
  };

  logger.info('Fetched market updates');
  res.json(marketData);
});

export default router;