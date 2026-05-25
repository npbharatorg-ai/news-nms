import 'dotenv/config';
import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/registrationEmailService.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.auth || req.auth.collectionName !== 'admin_users') {
    logger.warn('Unauthorized admin access attempt');
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  next();
};

// GET /admin/payment-verification - Fetch pending offline payments
router.get('/payment-verification', requireAdmin, async (req, res) => {
  const { status = 'pending', limit = 50, page = 1 } = req.query;

  logger.info(`Fetching payment verifications with status=${status}, limit=${limit}, page=${page}`);

  // Build filter query
  const filters = ['payment_method = "offline"'];

  if (status !== 'all') {
    filters.push(`approval_status = "${status}"`);
  }

  const filterQuery = filters.join(' && ');

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));

  logger.info(`Pagination: page=${pageNum}, limit=${limitNum}, filter="${filterQuery}"`);

  // Fetch registrations with pagination
  const registrations = await pb.collection('new_reporter_registrations').getList(pageNum, limitNum, {
    filter: filterQuery,
    sort: '-created',
  });

  logger.info(`Fetched ${registrations.items.length} payment verifications (page ${pageNum}, total: ${registrations.totalItems})`);

  // Format response
  const items = registrations.items.map((reg) => ({
    id: reg.id,
    user_name: reg.full_name,
    email: reg.email,
    phone: reg.phone_number,
    payment_method: reg.payment_method || 'offline',
    payment_status: reg.payment_status,
    payment_screenshot: reg.payment_screenshot_id ? pb.files.getUrl(reg, reg.payment_screenshot_id) : null,
    transaction_id: reg.transaction_id || null,
    approval_status: reg.approval_status,
    created_at: reg.created,
  }));

  res.json({
    items,
    page: pageNum,
    perPage: limitNum,
    totalItems: registrations.totalItems,
  });
});

// GET /admin/payment-verification/:id - Get single payment record
router.get('/payment-verification/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Fetching payment verification record: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
    logger.warn(`Payment verification record not found: ${id}`);
    return res.status(404).json({ error: `Payment verification record not found: ${id}` });
  }

  logger.info(`Fetched payment verification record: ${id}`);

  // Format response
  const response = {
    id: registration.id,
    user_name: registration.full_name,
    email: registration.email,
    phone: registration.phone_number,
    payment_method: registration.payment_method || 'offline',
    payment_status: registration.payment_status,
    payment_screenshot: registration.payment_screenshot_id ? pb.files.getUrl(registration, registration.payment_screenshot_id) : null,
    transaction_id: registration.transaction_id || null,
    approval_status: registration.approval_status,
    rejection_reason: registration.rejection_reason || null,
    user_id: registration.user_id || null,
    created_at: registration.created,
    updated_at: registration.updated,
  };

  res.json(response);
});

// POST /admin/payment-verification/approve/:id - Approve payment and activate account
router.post('/payment-verification/approve/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Approving payment verification: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
    logger.warn(`Registration not found: ${id}`);
    throw new Error(`Registration not found: ${id}`);
  }

  let userId = registration.user_id;

  // Generate User ID if not already generated
  if (!userId) {
    let userIdCounter = await pb.collection('user_id_counter').getFullList();
    let counter;

    if (userIdCounter.length === 0) {
      const newCounter = await pb.collection('user_id_counter').create({ count: 1 });
      counter = 1;
    } else {
      counter = (userIdCounter[0].count || 0) + 1;
      await pb.collection('user_id_counter').update(userIdCounter[0].id, { count: counter });
    }

    userId = `NMS/NEWS/${String(counter).padStart(4, '0')}`;
    logger.info(`Generated User ID: ${userId}`);
  }

  // Update registration with approval status and user_id
  const updatedRegistration = await pb.collection('new_reporter_registrations').update(id, {
    approval_status: 'approved',
    status: 'ACTIVE',
    user_id: userId,
  });

  logger.info(`Registration approved: ${id}, User ID: ${userId}`);

  // Send approval email
  await sendApprovalEmail(registration, userId);

  res.json({
    success: true,
    userId,
    message: 'Payment verified and account activated',
    registration: {
      id: updatedRegistration.id,
      user_name: updatedRegistration.full_name,
      email: updatedRegistration.email,
      approval_status: updatedRegistration.approval_status,
      status: updatedRegistration.status,
      user_id: updatedRegistration.user_id,
    },
  });
});

// POST /admin/payment-verification/reject/:id - Reject payment
router.post('/payment-verification/reject/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  logger.info(`Rejecting payment verification: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
    logger.warn(`Registration not found: ${id}`);
    throw new Error(`Registration not found: ${id}`);
  }

  // Update registration with rejection status
  const updatedRegistration = await pb.collection('new_reporter_registrations').update(id, {
    approval_status: 'rejected',
    status: 'INACTIVE',
    rejection_reason: reason.trim(),
  });

  logger.info(`Registration rejected: ${id}`);

  // Send rejection email
  await sendRejectionEmail(registration, reason.trim());

  res.json({
    success: true,
    message: 'Payment rejected and applicant notified',
    registration: {
      id: updatedRegistration.id,
      user_name: updatedRegistration.full_name,
      email: updatedRegistration.email,
      approval_status: updatedRegistration.approval_status,
      status: updatedRegistration.status,
      rejection_reason: updatedRegistration.rejection_reason,
    },
  });
});

export default router;