import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /activity-feed
router.get('/', async (req, res) => {
  logger.info('Fetching activity feed');

  const events = [];

  // Fetch all relevant collections
  let logs;
  let transactions;
  let newsSubmissions;
  let publishedNews;

  try {
    logs = await pb.collection('social_media_logs').getFullList();
    transactions = await pb.collection('wallet_transactions').getFullList();
    newsSubmissions = await pb.collection('news_submissions').getFullList();
    publishedNews = await pb.collection('published_news').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch collections: ${error.message}`);
    res.json([]);
    return;
  }

  // Create news map for quick lookup
  const newsMap = {};
  if (publishedNews && publishedNews.length > 0) {
    publishedNews.forEach((news) => {
      newsMap[news.id] = news;
    });
  }

  // Process social_media_logs (publishing events)
  if (logs && logs.length > 0) {
    logs.forEach((log) => {
      const news = newsMap[log.post_id];
      const eventType = log.status === 'success' ? 'publishing' : log.status === 'failed' ? 'failure' : 'publishing';
      const description = `Post published to ${log.platform} - Status: ${log.status}`;

      events.push({
        type: eventType,
        description,
        timestamp: log.created_at || new Date().toISOString(),
        postId: log.post_id,
        platform: log.platform,
        status: log.status,
      });
    });
  }

  // Process wallet_transactions (payout and approval events)
  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      let eventType = 'approval';
      let description = '';

      if (transaction.type === 'payout') {
        eventType = 'payout';
        description = `Payout of ₹${transaction.amount} - Status: ${transaction.status}`;
      } else if (transaction.type === 'post_approved_reward') {
        eventType = 'approval';
        description = `Post approved with reward of ₹${transaction.amount}`;
      } else {
        description = `${transaction.type}: ₹${transaction.amount}`;
      }

      events.push({
        type: eventType,
        description,
        timestamp: transaction.created_at || new Date().toISOString(),
        reporterId: transaction.user_id,
        postId: transaction.post_id,
        amount: transaction.amount,
        status: transaction.status,
      });
    });
  }

  // Process news_submissions (submission events)
  if (newsSubmissions && newsSubmissions.length > 0) {
    newsSubmissions.forEach((submission) => {
      const description = `News submitted: ${submission.title || 'Untitled'}`;

      events.push({
        type: 'submission',
        description,
        timestamp: submission.created_at || new Date().toISOString(),
        reporterId: submission.reporter_id,
        postId: submission.id,
        status: submission.status,
      });
    });
  }

  // Sort by timestamp descending (latest first)
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit to 100 events
  const limitedEvents = events.slice(0, 100);

  logger.info(`Fetched ${limitedEvents.length} activity feed events`);

  res.json(limitedEvents);
});

export default router;