import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/news-management', adminAuth, async (req, res) => {
  const { status, author, limit = 50, page = 1 } = req.query;
  
  logger.info(`Fetching news for admin: ${req.admin.email}`);
  
  const filters = [];
  if (status && status !== 'all') {
    filters.push(`status = "${status}"`);
  }
  if (author && author.trim() !== '') {
    filters.push(`reporter_id ~ "${author.trim()}"`);
  }
  
  const filterString = filters.length > 0 ? filters.join(' && ') : '';
  
  const result = await pb.collection('reporter_news').getList(page, limit, {
    filter: filterString,
    sort: '-created_at',
    $autoCancel: false
  });
  
  const reporterIds = [...new Set(result.items.map(item => item.reporter_id))];
  const reporters = await pb.collection('reporter_registrations').getFullList({
    filter: reporterIds.map(id => `id = "${id}"`).join(' || '),
    $autoCancel: false
  });
  
  const reporterMap = {};
  reporters.forEach(r => {
    reporterMap[r.id] = r.name;
  });
  
  const itemsWithReporterNames = result.items.map(item => ({
    ...item,
    reporter_name: reporterMap[item.reporter_id] || 'Unknown'
  }));
  
  res.json({
    items: itemsWithReporterNames,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages
  });
});

router.post('/news/:id/publish', adminAuth, async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Publishing news ${id} by admin ${req.admin.email}`);
  
  const updated = await pb.collection('reporter_news').update(id, {
    status: 'approved',
    approved_at: new Date().toISOString()
  }, { $autoCancel: false });
  
  res.json({
    success: true,
    message: 'News published successfully',
    news: updated
  });
});

router.post('/news/:id/unpublish', adminAuth, async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Unpublishing news ${id} by admin ${req.admin.email}`);
  
  const updated = await pb.collection('reporter_news').update(id, {
    status: 'draft'
  }, { $autoCancel: false });
  
  res.json({
    success: true,
    message: 'News unpublished successfully',
    news: updated
  });
});

router.delete('/news/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Deleting news ${id} by admin ${req.admin.email}`);
  
  await pb.collection('reporter_news').delete(id, { $autoCancel: false });
  
  res.json({
    success: true,
    message: 'News deleted successfully'
  });
});

export default router;