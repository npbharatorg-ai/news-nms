import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import { generateSocialMediaContent } from '../utils/generateSocialMediaContent.js';
import * as socialMediaService from '../services/socialMediaService.js';
import logger from '../utils/logger.js';

const router = express.Router();

const PLATFORMS = ['facebook', 'instagram', 'x', 'telegram', 'whatsapp'];
const VALID_STATUSES = ['pending', 'success', 'failed'];

// POST /social-media/post-to-platforms - Post to all platforms
router.post('/post-to-platforms', async (req, res) => {
  const { newsData } = req.body;

  // Validate input
  if (!newsData) {
    return res.status(400).json({ error: 'newsData is required' });
  }

  const { id, title, content, image, category, author_name, excerpt } = newsData;

  if (!id || !title || !content || !image || !category) {
    return res.status(400).json({
      error: 'newsData must contain: id, title, content, image, category',
    });
  }

  logger.info(`Processing post-to-platforms request for news: ${id}`);

  // Call social media service to post to all platforms
  const result = await socialMediaService.postToAllPlatforms(newsData);

  // Update social_media_posts collection for each platform
  for (const [platform, platformResult] of Object.entries(result.platforms)) {
    try {
      const postRecord = await pb.collection('social_media_posts').create({
        news_id: id,
        platform,
        post_id: platformResult.postId || `pending_${Date.now()}_${platform}`,
        status: platformResult.status,
        error_message: platformResult.error || null,
        posted_at: platformResult.status === 'success' ? new Date().toISOString() : null,
        external_post_id: platformResult.postId || null,
      });

      logger.info(`Created social_media_posts record for ${platform}: ${postRecord.id}`);
    } catch (error) {
      logger.error(`Failed to create social_media_posts record for ${platform}: ${error.message}`);
    }
  }

  logger.info(`Post-to-platforms completed for news: ${id}`);

  res.json({
    success: true,
    newsId: id,
    platforms: result.platforms,
  });
});

// POST /social-media/post-facebook - Post to Facebook only
router.post('/post-facebook', async (req, res) => {
  const { newsData } = req.body;

  if (!newsData) {
    return res.status(400).json({ error: 'newsData is required' });
  }

  logger.info(`Posting to Facebook: ${newsData.id}`);

  const result = await socialMediaService.postToFacebook(newsData);

  logger.info(`Facebook posting result: ${result.status}`);

  res.json({
    success: true,
    postId: result.postId,
    platform: 'facebook',
    status: result.status,
  });
});

// POST /social-media/post-instagram - Post to Instagram only
router.post('/post-instagram', async (req, res) => {
  const { newsData } = req.body;

  if (!newsData) {
    return res.status(400).json({ error: 'newsData is required' });
  }

  logger.info(`Posting to Instagram: ${newsData.id}`);

  const result = await socialMediaService.postToInstagram(newsData);

  logger.info(`Instagram posting result: ${result.status}`);

  res.json({
    success: true,
    postId: result.postId,
    platform: 'instagram',
    status: result.status,
  });
});

// POST /social-media/post-twitter - Post to Twitter/X only
router.post('/post-twitter', async (req, res) => {
  const { newsData } = req.body;

  if (!newsData) {
    return res.status(400).json({ error: 'newsData is required' });
  }

  logger.info(`Posting to Twitter/X: ${newsData.id}`);

  const result = await socialMediaService.postToTwitter(newsData);

  logger.info(`Twitter posting result: ${result.status}`);

  res.json({
    success: true,
    postId: result.postId,
    platform: 'twitter',
    status: result.status,
  });
});

// POST /social-media/post-to-platforms (original endpoint - kept for backward compatibility)
router.post('/post-to-platforms-legacy', async (req, res) => {
  const { newsId, title, description, imageUrl } = req.body;

  // Validate input
  if (!newsId || typeof newsId !== 'string' || newsId.trim() === '') {
    return res.status(400).json({ error: 'newsId is required and must be a non-empty string' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'description is required and must be a non-empty string' });
  }

  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return res.status(400).json({ error: 'imageUrl is required and must be a non-empty string' });
  }

  logger.info(`Processing post-to-platforms request for newsId: ${newsId}`);

  // Check if news has already been posted
  const existingPosts = await pb.collection('social_media_posts').getList(1, 1, {
    filter: `news_id = "${newsId}"`,
  });

  if (existingPosts.items && existingPosts.items.length > 0) {
    logger.warn(`News ${newsId} has already been posted to social media`);
    return res.status(400).json({
      success: false,
      message: 'News already posted to social media',
    });
  }

  logger.info(`News ${newsId} has not been posted yet. Proceeding with platform posting.`);

  // Prepare news data for content generation
  const newsData = {
    title: title.trim(),
    description: description.trim(),
    image: imageUrl.trim(),
    category: 'General', // Default category
    link: `https://nms.news/news/${newsId}`,
  };

  const platformsToPost = ['facebook', 'instagram', 'x'];
  const createdPosts = [];

  // Generate content and create records for each platform
  for (const platform of platformsToPost) {
    logger.info(`Generating content for platform: ${platform}`);

    const generatedContent = generateSocialMediaContent(newsData, platform);
    logger.info(`Generated content for ${platform}: ${JSON.stringify(generatedContent)}`);

    // Create unique post_id
    const postId = `pending_${Date.now()}_${platform}`;

    // Create social_media_posts record
    const postRecord = await pb.collection('social_media_posts').create({
      news_id: newsId,
      platform,
      post_id: postId,
      posted_at: new Date().toISOString(),
      status: 'pending',
      content: generatedContent.content,
      hashtags: generatedContent.hashtags,
      formatted: generatedContent.formatted,
    });

    logger.info(`Created social_media_posts record for ${platform}: ${postRecord.id}`);

    createdPosts.push({
      platform,
      postId,
      recordId: postRecord.id,
    });
  }

  logger.info(`Successfully created ${createdPosts.length} social media posts for newsId: ${newsId}`);

  res.json({
    success: true,
    newsId,
    platforms: platformsToPost,
    message: 'Social media posts queued',
    posts: createdPosts,
  });
});

// POST /social-media/publish
router.post('/publish', async (req, res) => {
  const { post_id, news_data } = req.body;

  // Validate input
  if (!post_id) {
    return res.status(400).json({ error: 'post_id is required' });
  }

  if (!news_data) {
    return res.status(400).json({ error: 'news_data is required' });
  }

  const { title, description, category, link } = news_data;

  if (!title || !description || !category || !link) {
    return res.status(400).json({
      error: 'news_data must contain title, description, category, and link',
    });
  }

  logger.info(`Publishing post ${post_id} to social media platforms`);

  const logs = [];

  // Generate content and create logs for each platform
  for (const platform of PLATFORMS) {
    try {
      const generatedContent = generateSocialMediaContent(news_data, platform);

      logger.info(`Generated content for ${platform}: ${JSON.stringify(generatedContent)}`);

      // Create social_media_logs entry in PocketBase with correct field names
      const logEntry = await pb.collection('social_media_logs').create({
        post_id,
        platform,
        status: 'pending',
        retry_count: 0,
        error_message: null,
        posted_at: null,
        external_post_id: null,
        content_sent: {
          content: generatedContent.content,
          hashtags: generatedContent.hashtags,
          formatted: generatedContent.formatted,
        },
      });

      logger.info(`Created social media log for ${platform}: ${logEntry.id}`);

      logs.push({
        log_id: logEntry.id,
        platform,
        status: 'pending',
        created: logEntry.created,
      });
    } catch (error) {
      logger.error(`Failed to create log for ${platform}: ${error.message}`);
      throw error;
    }
  }

  logger.info(`Successfully created ${logs.length} social media logs for post ${post_id}`);

  res.json({
    success: true,
    post_id,
    logs,
  });
});

// POST /social-media/retry
router.post('/retry', async (req, res) => {
  const { log_id } = req.body;

  // Validate input
  if (!log_id) {
    return res.status(400).json({ error: 'log_id is required' });
  }

  logger.info(`Retrying social media log: ${log_id}`);

  // Fetch log from PocketBase
  let logEntry;
  try {
    logEntry = await pb.collection('social_media_logs').getOne(log_id);
    logger.info(`Fetched log entry: ${JSON.stringify(logEntry)}`);
  } catch (error) {
    logger.error(`Log not found: ${log_id} - ${error.message}`);
    throw new Error(`Social media log not found: ${log_id}`);
  }

  // Validate log exists and status is 'failed'
  if (logEntry.status !== 'failed') {
    return res.status(400).json({
      error: `Log status is '${logEntry.status}', expected 'failed'`,
    });
  }

  logger.info(`Log status is 'failed', proceeding with retry. Current retry_count: ${logEntry.retry_count}`);

  // Update log: status='pending', retry_count++
  const updatedLog = await pb.collection('social_media_logs').update(log_id, {
    status: 'pending',
    retry_count: (logEntry.retry_count || 0) + 1,
    error_message: null,
  });

  logger.info(`Updated log ${log_id} to pending with retry_count: ${updatedLog.retry_count}`);

  res.json({
    success: true,
    log_id,
    status: 'pending',
    retry_count: updatedLog.retry_count,
  });
});

// GET /social-media/logs
router.get('/logs', async (req, res) => {
  const { post_id, platform, status, date_range, page = 1, limit = 10 } = req.query;

  logger.info(`Fetching social media logs with filters: post_id=${post_id}, platform=${platform}, status=${status}, date_range=${date_range}`);

  // Validate input parameters
  if (platform && !PLATFORMS.includes(platform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${PLATFORMS.join(', ')}`,
    });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  // Build filter query array
  const filters = [];

  if (post_id) {
    logger.info(`Adding filter: post_id = "${post_id}"`);
    filters.push(`post_id = "${post_id}"`);
  }

  if (platform) {
    logger.info(`Adding filter: platform = "${platform}"`);
    filters.push(`platform = "${platform}"`);
  }

  if (status) {
    logger.info(`Adding filter: status = "${status}"`);
    filters.push(`status = "${status}"`);
  }

  if (date_range) {
    // date_range format: "2024-01-01,2024-01-31"
    const [startDate, endDate] = date_range.split(',');
    if (startDate && endDate) {
      // Validate date format (basic check)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD format for date_range (e.g., "2024-01-01,2024-01-31")',
        });
      }
      logger.info(`Adding filter: created >= "${startDate}" && created <= "${endDate}"`);
      filters.push(`created >= "${startDate}" && created <= "${endDate}"`);
    }
  }

  // Construct final filter query
  const filterQuery = filters.length > 0 ? filters.join(' && ') : '';
  logger.info(`Final filter query: "${filterQuery}"`);

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Cap at 100

  logger.info(`Pagination: page=${pageNum}, limit=${limitNum}`);

  // Fetch logs with pagination
  let logs;
  try {
    logger.info(`Executing PocketBase query: collection=social_media_logs, page=${pageNum}, limit=${limitNum}, filter="${filterQuery}"`);
    logs = await pb.collection('social_media_logs').getList(pageNum, limitNum, {
      filter: filterQuery || undefined, // Pass undefined if no filters to avoid empty string issues
      sort: '-created',
    });
    logger.info(`PocketBase query successful. Returned ${logs.items.length} items, total: ${logs.totalItems}`);
  } catch (error) {
    logger.error(`PocketBase query failed: ${error.message}`);
    logger.error(`Error details: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch social media logs: ${error.message}`);
  }

  if (!logs || !logs.items) {
    logger.warn('Invalid response structure from social_media_logs collection');
    res.json({
      logs: [],
      page: pageNum,
      perPage: limitNum,
      totalItems: 0,
    });
    return;
  }

  // Format response with correct field names
  const formattedLogs = logs.items.map((log) => ({
    id: log.id,
    post_id: log.post_id,
    platform: log.platform,
    status: log.status,
    posted_at: log.posted_at,
    error_message: log.error_message,
    retry_count: log.retry_count,
    external_post_id: log.external_post_id,
    content_sent: log.content_sent,
    created: log.created,
    updated: log.updated,
  }));

  logger.info(`Successfully fetched ${formattedLogs.length} logs (page ${pageNum}, total: ${logs.totalItems})`);

  res.json({
    logs: formattedLogs,
    page: pageNum,
    perPage: limitNum,
    totalItems: logs.totalItems,
  });
});

export default router;