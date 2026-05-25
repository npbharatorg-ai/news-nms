import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import * as registrationEmailService from '../services/registrationEmailService.js';

const router = express.Router();

// GET /admin/payment-verification - Get all pending registrations
router.get('/', async (req, res) => {
  const { paymentMethod, approvalStatus, page = 1, limit = 10 } = req.query;

  logger.info(`Fetching payment verification list with filters: paymentMethod=${paymentMethod}, approvalStatus=${approvalStatus}`);

  // Build filter query
  const filters = [];

  if (paymentMethod) {
    filters.push(`payment_method = "${paymentMethod}"`);
  }

  if (approvalStatus) {
    filters.push(`approval_status = "${approvalStatus}"`);
  } else {
    // Default: show pending approvals
    filters.push(`approval_status = "pending"`);
  }

  const filterQuery = filters.length > 0 ? filters.join(' && ') : '';

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

  logger.info(`Pagination: page=${pageNum}, limit=${limitNum}`);

  // Fetch registrations with pagination
  const registrations = await pb.collection('new_reporter_registrations').getList(pageNum, limitNum, {
    filter: filterQuery || undefined,
    sort: '-created',
  });

  logger.info(`Fetched ${registrations.items.length} registrations (page ${pageNum}, total: ${registrations.totalItems})`);

  // Format response
  const items = registrations.items.map((reg) => ({
    id: reg.id,
    fullName: reg.full_name,
    phoneNumber: reg.phone_number,
    email: reg.email,
    paymentMethod: reg.payment_method || 'pending',
    paymentStatus: reg.payment_status,
    approvalStatus: reg.approval_status,
    createdAt: reg.created,
  }));

  res.json({
    items,
    page: pageNum,
    perPage: limitNum,
    totalItems: registrations.totalItems,
  });
});

// POST /admin/payment-verification/approve/:id - Approve registration
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Approving registration: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
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

    // Update registration with user_id
    await pb.collection('new_reporter_registrations').update(id, {
      user_id: userId,
    });
  }

  // Create user account if not exists
  try {
    const existingUser = await pb.collection('users').getFullList({
      filter: `email = "${registration.email}"`,
    });

    if (existingUser.length === 0) {
      const generatedPassword = registration.password || crypto.randomBytes(8).toString('hex');
      await pb.collection('users').create({
        email: registration.email,
        password: generatedPassword,
        passwordConfirm: generatedPassword,
        name: registration.full_name,
        user_id: userId,
      });
      logger.info(`User account created for: ${registration.email}`);
    }
  } catch (error) {
    logger.warn(`Error creating user account: ${error.message}`);
  }

  // Update registration with approval status
  await pb.collection('new_reporter_registrations').update(id, {
    approval_status: 'approved',
  });

  logger.info(`Registration approved: ${id}`);

  // Send approval email
  await registrationEmailService.sendApprovalEmail(registration, userId);

  res.json({
    success: true,
    userId,
    message: 'Registration approved',
  });
});

// POST /admin/payment-verification/reject/:id - Reject registration
router.post('/reject/:id', async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Rejecting registration: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
    throw new Error(`Registration not found: ${id}`);
  }

  // Update registration with rejection status
  await pb.collection('new_reporter_registrations').update(id, {
    approval_status: 'rejected',
    rejection_reason: rejectionReason || null,
  });

  logger.info(`Registration rejected: ${id}`);

  // Send rejection email
  await registrationEmailService.sendRejectionEmail(registration, rejectionReason);

  res.json({
    success: true,
    message: 'Registration rejected',
  });
});

export default router;