import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /wallet/overview
router.get('/overview', async (req, res) => {
  logger.info('Fetching wallet overview');

  let walletBalances;
  try {
    walletBalances = await pb.collection('wallet_balance').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch wallet_balance: ${error.message}`);
    res.json({
      totalBalance: 0,
      totalEarned: 0,
      totalPaidOut: 0,
      activeReporters: 0,
    });
    return;
  }

  if (!walletBalances || walletBalances.length === 0) {
    logger.info('No wallet balances found');
    res.json({
      totalBalance: 0,
      totalEarned: 0,
      totalPaidOut: 0,
      activeReporters: 0,
    });
    return;
  }

  const totalBalance = walletBalances.reduce((sum, wallet) => sum + (wallet.current_balance || 0), 0);
  const totalEarned = walletBalances.reduce((sum, wallet) => sum + (wallet.total_earned || 0), 0);
  const totalPaidOut = walletBalances.reduce((sum, wallet) => sum + (wallet.total_paid_out || 0), 0);
  const activeReporters = walletBalances.filter((wallet) => (wallet.current_balance || 0) > 0).length;

  logger.info(`Wallet overview: total=${totalBalance}, earned=${totalEarned}, paidOut=${totalPaidOut}, active=${activeReporters}`);

  res.json({
    totalBalance: Math.round(totalBalance * 10) / 10,
    totalEarned: Math.round(totalEarned * 10) / 10,
    totalPaidOut: Math.round(totalPaidOut * 10) / 10,
    activeReporters,
  });
});

// GET /wallet/earnings-trend
router.get('/earnings-trend', async (req, res) => {
  const { period = 'daily', dateRange } = req.query;

  logger.info(`Fetching earnings trend with period=${period}, dateRange=${dateRange}`);

  const filters = ['type = "post_approved_reward"'];

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate && endDate) {
      filters.push(`created_at >= "${startDate}" && created_at <= "${endDate}"`);
    }
  }

  const filterQuery = filters.join(' && ');

  let transactions;
  try {
    transactions = await pb.collection('wallet_transactions').getFullList({
      filter: filterQuery,
      sort: 'created_at',
    });
  } catch (error) {
    logger.warn(`Failed to fetch wallet_transactions: ${error.message}`);
    res.json([]);
    return;
  }

  if (!transactions || transactions.length === 0) {
    logger.info('No transactions found');
    res.json([]);
    return;
  }

  // Group transactions by period
  const trendMap = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.created_at);
    let key;

    if (period === 'daily') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = date.toISOString().substring(0, 7); // YYYY-MM
    } else {
      key = date.toISOString().split('T')[0];
    }

    if (!trendMap[key]) {
      trendMap[key] = 0;
    }
    trendMap[key] += transaction.amount || 0;
  });

  // Convert to array and sort by date
  const trend = Object.entries(trendMap)
    .map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 10) / 10,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  logger.info(`Fetched earnings trend with ${trend.length} data points`);

  res.json(trend);
});

// GET /wallet/top-earners
router.get('/top-earners', async (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit) || 10;

  logger.info(`Fetching top ${limitNum} earners`);

  let walletBalances;
  let reporters;

  try {
    walletBalances = await pb.collection('wallet_balance').getFullList({
      sort: '-total_earned',
    });
    reporters = await pb.collection('reporters').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch collections: ${error.message}`);
    res.json([]);
    return;
  }

  if (!walletBalances || walletBalances.length === 0) {
    logger.info('No wallet balances found');
    res.json([]);
    return;
  }

  // Create reporter map
  const reporterMap = {};
  if (reporters && reporters.length > 0) {
    reporters.forEach((reporter) => {
      reporterMap[reporter.id] = reporter;
    });
  }

  // Build top earners array
  const topEarners = walletBalances
    .slice(0, limitNum)
    .map((wallet, index) => {
      const reporter = reporterMap[wallet.user_id];
      return {
        rank: index + 1,
        reporterName: reporter?.name || wallet.user_id,
        totalEarned: Math.round((wallet.total_earned || 0) * 10) / 10,
        currentBalance: Math.round((wallet.current_balance || 0) * 10) / 10,
        postsApproved: wallet.posts_approved || 0,
        lastEarned: wallet.last_updated || new Date().toISOString(),
      };
    });

  logger.info(`Fetched top ${topEarners.length} earners`);

  res.json(topEarners);
});

// GET /wallet/payout-history
router.get('/payout-history', async (req, res) => {
  const { dateRange, status } = req.query;

  logger.info(`Fetching payout history with dateRange=${dateRange}, status=${status}`);

  const filters = ['type = "payout"'];

  if (status) {
    filters.push(`status = "${status}"`);
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate && endDate) {
      filters.push(`created_at >= "${startDate}" && created_at <= "${endDate}"`);
    }
  }

  const filterQuery = filters.join(' && ');

  let transactions;
  let reporters;

  try {
    transactions = await pb.collection('wallet_transactions').getFullList({
      filter: filterQuery,
      sort: '-created_at',
    });
    reporters = await pb.collection('reporters').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch collections: ${error.message}`);
    res.json([]);
    return;
  }

  if (!transactions || transactions.length === 0) {
    logger.info('No payout transactions found');
    res.json([]);
    return;
  }

  // Create reporter map
  const reporterMap = {};
  if (reporters && reporters.length > 0) {
    reporters.forEach((reporter) => {
      reporterMap[reporter.id] = reporter;
    });
  }

  const payoutHistory = transactions.map((transaction) => {
    const reporter = reporterMap[transaction.user_id];
    return {
      date: transaction.created_at,
      reporterName: reporter?.name || transaction.user_id,
      amount: Math.round((transaction.amount || 0) * 10) / 10,
      status: transaction.status || 'pending',
      initiatedBy: transaction.initiated_by || 'System',
    };
  });

  logger.info(`Fetched ${payoutHistory.length} payout transactions`);

  res.json(payoutHistory);
});

export default router;