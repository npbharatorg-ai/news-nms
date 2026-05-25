import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import * as registrationEmailService from '../services/registrationEmailService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (exactly 10 digits)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Validate file type (JPG/PNG only)
const isValidImageFileType = (mimetype) => {
  return ['image/jpeg', 'image/png'].includes(mimetype);
};

// Helper function to build payload with only non-empty fields
const buildPayload = (data) => {
  const payload = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      payload[key] = value;
    }
  }
  return payload;
};

// POST /new-registration/step1 - Save personal details
router.post('/step1', async (req, res) => {
  const { fullName, phoneNumber, dateOfBirth, fatherName, fullAddress, email, password } = req.body;

  logger.info('Processing new registration step 1');

  // Validate required fields
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: fullName' });
  }

  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: phoneNumber' });
  }

  if (!dateOfBirth || typeof dateOfBirth !== 'string' || dateOfBirth.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: dateOfBirth' });
  }

  if (!fullAddress || typeof fullAddress !== 'string' || fullAddress.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: fullAddress' });
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  // Validate phone format (exactly 10 digits)
  if (!isValidPhoneNumber(phoneNumber.trim())) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  // Validate email format
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  logger.info(`Validated inputs: fullName="${fullName}", phoneNumber="${phoneNumber}", email="${email}"`);

  // Check for duplicate phone_number
  try {
    const existingPhone = await pb.collection('new_reporter_registrations').getFullList({
      filter: `phone_number = "${phoneNumber.trim()}"`,
    });
    if (existingPhone.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
  } catch (error) {
    logger.warn(`Error checking duplicate phone: ${error.message}`);
  }

  // Check for duplicate email
  try {
    const existingEmail = await pb.collection('new_reporter_registrations').getFullList({
      filter: `email = "${email.trim()}"`,
    });
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
  } catch (error) {
    logger.warn(`Error checking duplicate email: ${error.message}`);
  }

  // Build payload
  const payload = buildPayload({
    full_name: fullName.trim(),
    phone_number: phoneNumber.trim(),
    date_of_birth: dateOfBirth.trim(),
    father_name: fatherName ? fatherName.trim() : null,
    full_address: fullAddress.trim(),
    email: email.trim(),
    password: password ? password.trim() : null,
    payment_status: 'pending',
    approval_status: 'pending',
  });

  logger.info(`Step 1 payload: ${JSON.stringify(payload)}`);

  // Create record in new_reporter_registrations collection
  const record = await pb.collection('new_reporter_registrations').create(payload);
  logger.info(`Registration record created: ${record.id}`);

  res.status(201).json({
    registrationId: record.id,
    message: 'Personal details saved',
  });
});

// POST /new-registration/step2 - Upload documents
router.post('/step2', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
]), async (req, res) => {
  const { registrationId } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  if (!req.files || !req.files.photo || !req.files.aadhaarFront || !req.files.aadhaarBack) {
    return res.status(400).json({ error: 'All three files are required: photo, aadhaarFront, aadhaarBack' });
  }

  const files = {
    photo: req.files.photo[0],
    aadhaarFront: req.files.aadhaarFront[0],
    aadhaarBack: req.files.aadhaarBack[0],
  };

  // Validate file types and sizes
  for (const [fieldName, file] of Object.entries(files)) {
    if (!isValidImageFileType(file.mimetype)) {
      return res.status(400).json({ error: `${fieldName} must be a JPG or PNG image` });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: `${fieldName} must be less than 5MB` });
    }
  }

  logger.info(`Uploading documents for registration: ${registrationId}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ error: `Registration not found: ${registrationId}` });
  }

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('registration_id', registrationId);
  formData.append('passport_photo', new Blob([files.photo.buffer], { type: files.photo.mimetype }), files.photo.originalname);
  formData.append('aadhaar_front', new Blob([files.aadhaarFront.buffer], { type: files.aadhaarFront.mimetype }), files.aadhaarFront.originalname);
  formData.append('aadhaar_back', new Blob([files.aadhaarBack.buffer], { type: files.aadhaarBack.mimetype }), files.aadhaarBack.originalname);

  // Create document record
  const document = await pb.collection('registration_documents').create(formData);
  logger.info(`Documents uploaded successfully: ${document.id}`);

  // Update registration with document reference
  await pb.collection('new_reporter_registrations').update(registrationId, {
    documents_id: document.id,
  });

  res.json({
    registrationId,
    message: 'Documents uploaded successfully',
  });
});

// POST /new-registration/step3 - Validate and review
router.post('/step3', async (req, res) => {
  const { registrationId } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Processing step 3 for registration: ${registrationId}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(registrationId);
  if (!registration) {
    throw new Error(`Registration not found: ${registrationId}`);
  }

  // Validate all required fields are complete
  if (!registration.full_name || !registration.phone_number || !registration.email || !registration.full_address) {
    return res.status(400).json({ error: 'Please complete step 1 first' });
  }

  if (!registration.documents_id) {
    return res.status(400).json({ error: 'Please complete step 2 (upload documents) first' });
  }

  logger.info(`Step 3 validation passed for registration: ${registrationId}`);

  // Return registration details with fee breakdown
  res.json({
    registrationId,
    fullName: registration.full_name,
    phoneNumber: registration.phone_number,
    email: registration.email,
    feeBreakdown: {
      registrationFee: 5000,
      currency: 'INR',
      description: 'One-time registration fee for NMS Reporter Account',
    },
    message: 'Registration details ready for payment',
  });
});

// POST /new-registration/payment/online - Initialize Razorpay order
router.post('/payment/online', async (req, res) => {
  const { registrationId, amount = 5000 } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Initializing Razorpay payment for registration: ${registrationId}, amount: ${amount}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ error: `Registration not found: ${registrationId}` });
  }

  // Initialize Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID_LIVE,
    key_secret: process.env.RAZORPAY_KEY_SECRET_LIVE,
  });

  try {
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: registrationId,
    });

    logger.info(`Razorpay order created: ${order.id}`);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID_LIVE,
    });
  } catch (error) {
    logger.error(`Razorpay order creation failed: ${error.message}`);
    return res.status(400).json({ error: `Failed to create payment order: ${error.message}` });
  }
});

// POST /new-registration/payment/verify - Verify Razorpay payment
router.post('/payment/verify', async (req, res) => {
  const { registrationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!registrationId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return res.status(400).json({ error: 'Missing required fields: registrationId, razorpayPaymentId, razorpayOrderId, razorpaySignature' });
  }

  logger.info(`Verifying Razorpay payment for registration: ${registrationId}`);

  // Verify signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET_LIVE)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    logger.warn(`Payment signature verification failed for registration: ${registrationId}`);
    return res.status(400).json({ error: 'Payment signature verification failed' });
  }

  logger.info(`Payment signature verified for registration: ${registrationId}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(registrationId);
  if (!registration) {
    throw new Error(`Registration not found: ${registrationId}`);
  }

  // Update registration with payment details
  await pb.collection('new_reporter_registrations').update(registrationId, {
    payment_status: 'completed',
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
  });

  logger.info(`Payment details updated for registration: ${registrationId}`);

  // Generate User ID
  let userIdCounter = await pb.collection('user_id_counter').getFullList();
  let counter;

  if (userIdCounter.length === 0) {
    // Create counter if it doesn't exist
    const newCounter = await pb.collection('user_id_counter').create({ count: 1 });
    counter = 1;
  } else {
    // Increment counter
    counter = (userIdCounter[0].count || 0) + 1;
    await pb.collection('user_id_counter').update(userIdCounter[0].id, { count: counter });
  }

  const userId = `NMS/NEWS/${String(counter).padStart(4, '0')}`;
  logger.info(`Generated User ID: ${userId}`);

  // Update registration with user_id
  await pb.collection('new_reporter_registrations').update(registrationId, {
    user_id: userId,
  });

  // Create user account if not exists
  try {
    const existingUser = await pb.collection('users').getFullList({
      filter: `email = "${registration.email}"`,
    });

    if (existingUser.length === 0) {
      // Create new user account
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

  // Send confirmation email
  await registrationEmailService.sendRegistrationConfirmationEmail(registration, userId);

  logger.info(`Payment verification completed for registration: ${registrationId}`);

  res.json({
    success: true,
    userId,
    message: 'Payment verified, User ID generated',
  });
});

// POST /new-registration/payment/offline - Submit offline payment
router.post('/payment/offline', upload.single('paymentScreenshot'), async (req, res) => {
  const { registrationId, transactionId } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Payment screenshot is required' });
  }

  // Validate file type and size
  if (!isValidImageFileType(req.file.mimetype)) {
    return res.status(400).json({ error: 'Payment screenshot must be a JPG or PNG image' });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Payment screenshot must be less than 5MB' });
  }

  logger.info(`Processing offline payment for registration: ${registrationId}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ error: `Registration not found: ${registrationId}` });
  }

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('registration_id', registrationId);
  formData.append('payment_method', 'offline');
  formData.append('payment_status', 'pending');
  formData.append('approval_status', 'pending');
  if (transactionId) formData.append('transaction_id', transactionId);
  formData.append('payment_screenshot', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

  // Create payment record
  const paymentRecord = await pb.collection('registration_payments').create(formData);
  logger.info(`Offline payment record created: ${paymentRecord.id}`);

  // Update registration
  await pb.collection('new_reporter_registrations').update(registrationId, {
    payment_method: 'offline',
    payment_status: 'pending',
    approval_status: 'pending',
    payment_screenshot_id: paymentRecord.id,
  });

  res.json({
    registrationId,
    message: 'Offline payment submitted. Admin will verify within 24-48 hours',
  });
});

// GET /new-registration/:id - Get registration details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  logger.info(`Fetching registration details: ${id}`);

  // Fetch registration record
  const registration = await pb.collection('new_reporter_registrations').getOne(id);
  if (!registration) {
    throw new Error(`Registration not found: ${id}`);
  }

  // Build response with file URLs
  const response = {
    id: registration.id,
    fullName: registration.full_name,
    phoneNumber: registration.phone_number,
    dateOfBirth: registration.date_of_birth,
    fatherName: registration.father_name,
    fullAddress: registration.full_address,
    email: registration.email,
    userId: registration.user_id || null,
    paymentStatus: registration.payment_status,
    approvalStatus: registration.approval_status,
    paymentMethod: registration.payment_method || null,
    createdAt: registration.created,
    updatedAt: registration.updated,
  };

  // Add file URLs if documents exist
  if (registration.documents_id) {
    try {
      const document = await pb.collection('registration_documents').getOne(registration.documents_id);
      response.documents = {
        passportPhoto: pb.files.getUrl(document, document.passport_photo),
        aadhaarFront: pb.files.getUrl(document, document.aadhaar_front),
        aadhaarBack: pb.files.getUrl(document, document.aadhaar_back),
      };
    } catch (error) {
      logger.warn(`Error fetching documents: ${error.message}`);
    }
  }

  logger.info(`Fetched registration details: ${id}`);

  res.json(response);
});

export default router;