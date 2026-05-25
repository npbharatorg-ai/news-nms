import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /category-performance
router.get('/', async (req, res) => {
  logger.info('Fetching category performance');

  let newsRecords;
  let logs;
  let transactions;

  try {
    newsRecords = await pb.collection('published_news').getFullList();
    logs = await pb.collection('social_media_logs').getFullList();
    transactions = await pb.collection('wallet_transactions').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch collections: ${error.message}`);
    res.json([]);
    return;
  }

  if (!newsRecords || newsRecords.length === 0) {
    logger.info('No published news found');
    res.json([]);
    return;
  }

  // Group news by category
  const categoryMap = {};

  newsRecords.forEach((news) => {
    const category = news.category || 'Uncategorized';
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        totalPosts: 0,
        successCount: 0,
        totalEarnings: 0,
        postIds: [],
      };
    }
    categoryMap[category].totalPosts += 1;
    categoryMap[category].postIds.push(news.id);
  });

  // Calculate success rates from logs
  if (logs && logs.length > 0) {
    logs.forEach((log) => {
      const news = newsRecords.find((n) => n.id === log.post_id);
      if (news && categoryMap[news.category || 'Uncategorized']) {
        if (log.status === 'success') {
          categoryMap[news.category || 'Uncategorized'].successCount += 1;
        }
      }
    });
  }

  // Calculate average earnings from transactions
  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      const news = newsRecords.find((n) => n.id === transaction.post_id);
      if (news && categoryMap[news.category || 'Uncategorized']) {
        categoryMap[news.category || 'Uncategorized'].totalEarnings += transaction.amount || 0;
      }
    });
  }

  // Build performance array
  const performance = Object.values(categoryMap)
    .map((cat) => {
      const successRate = cat.totalPosts > 0 ? (cat.successCount / cat.totalPosts) * 100 : 0;
      const avgEarningsPerPost = cat.totalPosts > 0 ? cat.totalEarnings / cat.totalPosts : 0;

      return {
        category: cat.category,
        totalPosts: cat.totalPosts,
        successRate: Math.round(successRate * 100) / 100,
        avgEarningsPerPost: Math.round(avgEarningsPerPost * 100) / 100,
      };
    })
    .sort((a, b) => b.totalPosts - a.totalPosts);

  logger.info(`Fetched performance for ${performance.length} categories`);

  res.json(performance);
});

export default router;