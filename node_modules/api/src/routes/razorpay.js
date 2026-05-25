import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';

const router = express.Router();

// Load and validate Razorpay credentials at module level
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY;

if (!RAZORPAY_KEY_ID) {
  throw new Error('RAZORPAY_KEY_ID is not configured in environment variables');
}

if (!RAZORPAY_SECRET_KEY) {
  throw new Error('RAZORPAY_SECRET_KEY is not configured in environment variables');
}

const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

logger.info('Razorpay credentials loaded successfully');

// POST /razorpay/create-order
router.post('/create-order', async (req, res) => {
  const { amount, currency, receipt } = req.body;

  // Input validation
  if (!amount || !currency || !receipt) {
    return res.status(400).json({
      error: 'Missing required fields: amount, currency, receipt',
    });
  }

  // Create order via Razorpay API
  const response = await axios.post(
    `${RAZORPAY_API_URL}/orders`,
    {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
    },
    {
      auth: {
        username: RAZORPAY_KEY_ID,
        password: RAZORPAY_SECRET_KEY,
      },
    }
  );

  if (!response.data || !response.data.id) {
    throw new Error('Failed to create Razorpay order');
  }

  logger.info(`Razorpay order created: ${response.data.id}`);

  res.json({
    orderId: response.data.id,
    amount: response.data.amount / 100, // Convert back to original currency
    currency: response.data.currency,
    key_id: RAZORPAY_KEY_ID,
  });
});

// POST /razorpay/verify-payment
router.post('/verify-payment', (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  // Input validation
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      error: 'Missing required fields: orderId, paymentId, signature',
    });
  }

  // Verify signature
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_SECRET_KEY)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === signature;

  if (!isValid) {
    logger.warn(`Payment signature verification failed for orderId: ${orderId}`);
    throw new Error('Payment signature verification failed');
  }

  logger.info(`Payment verified successfully: ${paymentId}`);

  res.json({
    success: true,
    paymentId,
    orderId,
  });
});

export default router;