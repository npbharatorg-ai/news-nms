import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /social-media/overview
router.get('/social-media/overview', async (req, res) => {
  logger.info('Fetching social media overview');

  let allLogs;
  try {
    allLogs = await pb.collection('social_media_logs').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch social_media_logs: ${error.message}`);
    res.json({
      totalPosts: 0,
      successRate: 0,
      failedCount: 0,
      pendingCount: 0,
    });
    return;
  }

  if (!allLogs || allLogs.length === 0) {
    logger.info('No social media logs found');
    res.json({
      totalPosts: 0,
      successRate: 0,
      failedCount: 0,
      pendingCount: 0,
    });
    return;
  }

  const totalPosts = allLogs.length;
  const successCount = allLogs.filter((log) => log.status === 'success').length;
  const failedCount = allLogs.filter((log) => log.status === 'failed').length;
  const pendingCount = allLogs.filter((log) => log.status === 'pending').length;
  const successRate = totalPosts > 0 ? (successCount / totalPosts) * 100 : 0;

  logger.info(`Social media overview: total=${totalPosts}, success=${successCount}, failed=${failedCount}, pending=${pendingCount}`);

  res.json({
    totalPosts,
    successRate: Math.round(successRate * 100) / 100,
    failedCount,
    pendingCount,
  });
});

// GET /social-media/platform-stats
router.get('/social-media/platform-stats', async (req, res) => {
  logger.info('Fetching platform statistics');

  const platforms = ['facebook', 'instagram', 'x', 'telegram', 'whatsapp'];
  const platformStats = [];

  let allLogs;
  try {
    allLogs = await pb.collection('social_media_logs').getFullList();
  } catch (error) {
    logger.warn(`Failed to fetch social_media_logs: ${error.message}`);
    res.json([]);
    return;
  }

  if (!allLogs || allLogs.length === 0) {
    logger.info('No social media logs found');
    res.json([]);
    return;
  }

  // Get current time minus 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const platform of platforms) {
    const platformLogs = allLogs.filter((log) => log.platform === platform);
    const totalPosts = platformLogs.length;
    const successCount = platformLogs.filter((log) => log.status === 'success').length;
    const failedCount = platformLogs.filter((log) => log.status === 'failed').length;
    const successRate = totalPosts > 0 ? (successCount / totalPosts) * 100 : 0;
    const last24hCount = platformLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= twentyFourHoursAgo;
    }).length;

    platformStats.push({
      platform,
      totalPosts,
      successCount,
      failedCount,
      successRate: Math.round(successRate * 100) / 100,
      last24hCount,
    });
  }

  logger.info(`Fetched platform stats for ${platformStats.length} platforms`);

  res.json(platformStats);
});

// GET /social-media/trending-posts
router.get('/social-media/trending-posts', async (req, res) => {
  logger.info('Fetching trending posts');

  let newsRecords;
  let logs;

  try {
    newsRecords = await pb.collection('published_news').getFullList();
    logs = await pb.collection('social_media_logs').getFullList();
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

  // Create a map of post_id to success count
  const postSuccessMap = {};
  if (logs && logs.length > 0) {
    logs.forEach((log) => {
      if (log.status === 'success') {
        postSuccessMap[log.post_id] = (postSuccessMap[log.post_id] || 0) + 1;
      }
    });
  }

  // Build trending posts array
  const trendingPosts = newsRecords
    .map((news) => ({
      postId: news.id,
      title: news.title || 'N/A',
      category: news.category || 'N/A',
      platformsUsed: logs
        ? [...new Set(logs.filter((log) => log.post_id === news.id).map((log) => log.platform))]
        : [],
      successCount: postSuccessMap[news.id] || 0,
      publishedDate: news.created_at || new Date().toISOString(),
    }))
    .sort((a, b) => b.successCount - a.successCount)
    .slice(0, 5);

  logger.info(`Fetched ${trendingPosts.length} trending posts`);

  res.json(trendingPosts);
});

// GET /social-media/failed-posts
router.get('/social-media/failed-posts', async (req, res) => {
  const { platform, dateRange } = req.query;

  logger.info(`Fetching failed posts with filters: platform=${platform}, dateRange=${dateRange}`);

  const filters = ['status = "failed"'];

  if (platform) {
    filters.push(`platform = "${platform}"`);
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split(',');
    if (startDate && endDate) {
      filters.push(`created_at >= "${startDate}" && created_at <= "${endDate}"`);
    }
  }

  const filterQuery = filters.join(' && ');

  let failedLogs;
  try {
    failedLogs = await pb.collection('social_media_logs').getFullList({
      filter: filterQuery,
      sort: '-created_at',
    });
  } catch (error) {
    logger.warn(`Failed to fetch failed posts: ${error.message}`);
    res.json([]);
    return;
  }

  if (!failedLogs || failedLogs.length === 0) {
    logger.info('No failed posts found');
    res.json([]);
    return;
  }

  const failedPosts = failedLogs.map((log) => ({
    postId: log.post_id,
    platform: log.platform,
    errorMessage: log.error_message || 'Unknown error',
    retryCount: log.retry_count || 0,
    failedAt: log.updated_at || log.created_at,
  }));

  logger.info(`Fetched ${failedPosts.length} failed posts`);

  res.json(failedPosts);
});

export default router;