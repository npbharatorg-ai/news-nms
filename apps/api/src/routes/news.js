import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import * as emailService from '../services/emailService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /news/submit - Submit news with image
router.post('/submit', upload.single('image'), async (req, res) => {
  const { reporter_id, title, description, category, source_url } = req.body;

  // Input validation
  if (!reporter_id || !title || !description || !category) {
    return res.status(400).json({
      error: 'Missing required fields: reporter_id, title, description, category',
    });
  }

  logger.info(`Submitting news: title="${title}", reporter_id="${reporter_id}"`);

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('reporter_id', reporter_id);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('source_url', source_url || '');
  formData.append('status', 'pending');

  if (req.file) {
    formData.append('image', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
  }

  // Create news record in PocketBase
  const news = await pb.collection('news_submissions').create(formData);
  logger.info(`News record created: ${news.id}`);

  // Fetch reporter details
  let reporter;
  try {
    reporter = await pb.collection('reporters').getOne(reporter_id);
    logger.info(`Fetched reporter details: ${reporter.id}`);
  } catch (error) {
    logger.warn(`Failed to fetch reporter details: ${error.message}`);
    reporter = { id: reporter_id, name: 'Reporter', email: null };
  }

  // Send emails (graceful error handling - don't fail the response)
  await emailService.sendNewsSubmissionEmail(reporter, news);
  await emailService.sendNewsSubmissionAdminEmail(reporter, news);

  logger.info(`News submission completed: ${news.id}`);

  res.json({
    success: true,
    message: 'News submitted successfully',
    news_id: news.id,
  });
});

// POST /news/approve/:newsId - Approve news submission
router.post('/approve/:newsId', async (req, res) => {
  const { newsId } = req.params;
  const { earnings = 0 } = req.body;

  logger.info(`Approving news: ${newsId}`);

  // Fetch news record
  const news = await pb.collection('news_submissions').getOne(newsId);
  logger.info(`Fetched news record: ${news.id}`);

  // Fetch reporter details
  let reporter;
  try {
    reporter = await pb.collection('reporters').getOne(news.reporter_id);
    logger.info(`Fetched reporter details: ${reporter.id}`);
  } catch (error) {
    logger.warn(`Failed to fetch reporter details: ${error.message}`);
    reporter = { id: news.reporter_id, name: 'Reporter', email: null };
  }

  // Update news status to approved
  const updatedNews = await pb.collection('news_submissions').update(newsId, {
    status: 'approved',
    approved_at: new Date().toISOString(),
  });
  logger.info(`News status updated to approved: ${newsId}`);

  // Create published_news record
  const publishedNews = await pb.collection('published_news').create({
    news_submission_id: newsId,
    reporter_id: news.reporter_id,
    title: news.title,
    description: news.description,
    category: news.category,
    image: news.image,
    source_url: news.source_url,
    status: 'published',
  });
  logger.info(`Published news record created: ${publishedNews.id}`);

  // Send approval email (graceful error handling)
  await emailService.sendNewsApprovedEmail(reporter, updatedNews, earnings);

  logger.info(`News approval completed: ${newsId}`);

  res.json({
    success: true,
    message: 'News approved successfully',
    news_id: newsId,
    published_news_id: publishedNews.id,
  });
});

// POST /news/reject/:newsId - Reject news submission
router.post('/reject/:newsId', async (req, res) => {
  const { newsId } = req.params;
  const { admin_comments = '' } = req.body;

  logger.info(`Rejecting news: ${newsId}`);

  // Fetch news record
  const news = await pb.collection('news_submissions').getOne(newsId);
  logger.info(`Fetched news record: ${news.id}`);

  // Fetch reporter details
  let reporter;
  try {
    reporter = await pb.collection('reporters').getOne(news.reporter_id);
    logger.info(`Fetched reporter details: ${reporter.id}`);
  } catch (error) {
    logger.warn(`Failed to fetch reporter details: ${error.message}`);
    reporter = { id: news.reporter_id, name: 'Reporter', email: null };
  }

  // Update news status to rejected
  const updatedNews = await pb.collection('news_submissions').update(newsId, {
    status: 'rejected',
    admin_comments,
    rejected_at: new Date().toISOString(),
  });
  logger.info(`News status updated to rejected: ${newsId}`);

  // Send rejection email (graceful error handling)
  await emailService.sendNewsRejectedEmail(reporter, updatedNews, admin_comments);

  logger.info(`News rejection completed: ${newsId}`);

  res.json({
    success: true,
    message: 'News rejected successfully',
    news_id: newsId,
  });
});

// GET /news/:newsId - Get news details
router.get('/:newsId', async (req, res) => {
  const { newsId } = req.params;

  logger.info(`Fetching news details: ${newsId}`);

  const news = await pb.collection('news_submissions').getOne(newsId);

  logger.info(`Fetched news: ${news.id}`);

  res.json(news);
});

// GET /news - Get all news submissions
router.get('/', async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;

  logger.info(`Fetching news submissions with filters: status=${status}, category=${category}`);

  const filters = [];

  if (status) {
    filters.push(`status = "${status}"`);
  }

  if (category) {
    filters.push(`category = "${category}"`);
  }

  const filterQuery = filters.length > 0 ? filters.join(' && ') : '';

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const news = await pb.collection('news_submissions').getList(pageNum, limitNum, {
    filter: filterQuery || undefined,
    sort: '-created',
  });

  logger.info(`Fetched ${news.items.length} news submissions`);

  res.json({
    news: news.items,
    page: pageNum,
    limit: limitNum,
    total: news.totalItems,
  });
});

export default router;