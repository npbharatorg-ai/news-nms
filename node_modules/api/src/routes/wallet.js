import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /wallet/credit-reward
router.post('/credit-reward', async (req, res) => {
  const { user_id, post_id, amount } = req.body;

  // Validate input
  if (!user_id || !post_id || amount === undefined) {
    return res.status(400).json({
      error: 'user_id, post_id, and amount are required',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  logger.info(`Crediting reward to user ${user_id}: ₹${amount} for post ${post_id}`);

  // Create wallet_transactions entry
  const transaction = await pb.collection('wallet_transactions').create({
    user_id,
    post_id,
    type: 'post_approved_reward',
    amount,
    status: 'completed',
    description: `Reward for approved post ${post_id}`,
    created_at: new Date().toISOString(),
  });

  logger.info(`Created transaction: ${transaction.id}`);

  // Fetch wallet_balance for user_id
  let walletBalance;
  try {
    const records = await pb.collection('wallet_balance').getFullList({
      filter: `user_id = "${user_id}"`,
    });
    walletBalance = records.length > 0 ? records[0] : null;
  } catch (error) {
    logger.warn(`Error fetching wallet balance: ${error.message}`);
    walletBalance = null;
  }

  // If wallet doesn't exist, create new wallet_balance record
  if (!walletBalance) {
    logger.info(`Creating new wallet for user ${user_id}`);
    walletBalance = await pb.collection('wallet_balance').create({
      user_id,
      current_balance: amount,
      total_earned: amount,
      total_paid_out: 0,
      last_updated: new Date().toISOString(),
    });
  } else {
    // Update wallet_balance: current_balance += amount, total_earned += amount
    walletBalance = await pb.collection('wallet_balance').update(walletBalance.id, {
      current_balance: (walletBalance.current_balance || 0) + amount,
      total_earned: (walletBalance.total_earned || 0) + amount,
      last_updated: new Date().toISOString(),
    });
  }

  logger.info(`Updated wallet for user ${user_id}. New balance: ₹${walletBalance.current_balance}`);

  res.json({
    success: true,
    user_id,
    transaction_id: transaction.id,
    new_balance: walletBalance.current_balance,
  });
});

// POST /wallet/payout
router.post('/payout', async (req, res) => {
  const { user_id, amount } = req.body;

  // Validate input
  if (!user_id || amount === undefined) {
    return res.status(400).json({
      error: 'user_id and amount are required',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  logger.info(`Processing payout for user ${user_id}: ₹${amount}`);

  // Fetch wallet_balance for user_id
  const records = await pb.collection('wallet_balance').getFullList({
    filter: `user_id = "${user_id}"`,
  });

  if (records.length === 0) {
    throw new Error(`Wallet not found for user ${user_id}`);
  }

  const walletBalance = records[0];

  // Validate current_balance >= amount
  if ((walletBalance.current_balance || 0) < amount) {
    return res.status(400).json({
      error: `Insufficient balance. Current balance: ₹${walletBalance.current_balance}, Requested: ₹${amount}`,
    });
  }

  // Create wallet_transactions entry
  const transaction = await pb.collection('wallet_transactions').create({
    user_id,
    type: 'payout',
    amount,
    status: 'completed',
    description: `Payout of ₹${amount}`,
    created_at: new Date().toISOString(),
  });

  logger.info(`Created payout transaction: ${transaction.id}`);

  // Update wallet_balance: current_balance = 0, total_paid_out += amount
  const updatedWallet = await pb.collection('wallet_balance').update(walletBalance.id, {
    current_balance: 0,
    total_paid_out: (walletBalance.total_paid_out || 0) + amount,
    last_updated: new Date().toISOString(),
  });

  logger.info(`Payout completed for user ${user_id}. Transaction: ${transaction.id}`);

  res.json({
    success: true,
    user_id,
    transaction_id: transaction.id,
    amount,
    new_balance: updatedWallet.current_balance,
  });
});

// GET /wallet/user/:userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  logger.info(`Fetching wallet details for user ${userId}`);

  // Fetch wallet_balance for userId
  const balanceRecords = await pb.collection('wallet_balance').getFullList({
    filter: `user_id = "${userId}"`,
  });

  if (balanceRecords.length === 0) {
    return res.json({
      user_id: userId,
      current_balance: 0,
      total_earned: 0,
      total_paid_out: 0,
      transactions: [],
    });
  }

  const walletBalance = balanceRecords[0];

  // Fetch wallet_transactions for userId (paginated, sorted by created_at desc)
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const transactions = await pb.collection('wallet_transactions').getList(pageNum, limitNum, {
    filter: `user_id = "${userId}"`,
    sort: '-created_at',
  });

  logger.info(`Fetched wallet for user ${userId}. Balance: ₹${walletBalance.current_balance}`);

  res.json({
    user_id: userId,
    current_balance: walletBalance.current_balance || 0,
    total_earned: walletBalance.total_earned || 0,
    total_paid_out: walletBalance.total_paid_out || 0,
    transactions: transactions.items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: transactions.totalItems,
    },
  });
});

// GET /wallet/all-users
router.get('/all-users', async (req, res) => {
  const { sort_by = 'earnings', filter_date, page = 1, limit = 10 } = req.query;

  logger.info(`Fetching all wallet users with sort_by=${sort_by}`);

  // Build filter query
  const filters = [];

  if (filter_date) {
    // filter_date format: "2024-01-01,2024-01-31"
    const [startDate, endDate] = filter_date.split(',');
    if (startDate && endDate) {
      filters.push(`last_updated >= "${startDate}" && last_updated <= "${endDate}"`);
    }
  }

  const filterQuery = filters.length > 0 ? filters.join(' && ') : '';

  // Determine sort order
  let sortField = '-total_earned'; // default: earnings descending
  if (sort_by === 'balance') {
    sortField = '-current_balance';
  } else if (sort_by === 'earnings') {
    sortField = '-total_earned';
  }

  // Fetch all wallet_balance records with pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const wallets = await pb.collection('wallet_balance').getList(pageNum, limitNum, {
    filter: filterQuery,
    sort: sortField,
  });

  // Format response
  const users = wallets.items.map((wallet) => ({
    user_id: wallet.user_id,
    current_balance: wallet.current_balance || 0,
    total_earned: wallet.total_earned || 0,
    total_paid_out: wallet.total_paid_out || 0,
    last_updated: wallet.last_updated,
  }));

  logger.info(`Fetched ${users.length} wallet users (page ${pageNum}, total: ${wallets.totalItems})`);

  res.json({
    users,
    total: wallets.totalItems,
    page: pageNum,
    limit: limitNum,
  });
});

export default router;