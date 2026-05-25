import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (exactly 10 digits as string)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Parse date flexibly - tries multiple common formats and outputs YYYY-MM-DD
const parseFlexibleDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const trimmed = dateString.trim();
  if (!trimmed) {
    return null;
  }

  const formats = [
    // DD-MM-YYYY or DD/MM/YYYY
    {
      regex: /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/, parse: (m) => {
        let d = parseInt(m[1], 10);
        let mo = parseInt(m[2], 10);
        const y = parseInt(m[3], 10);
        if (mo > 12 && d <= 12) { let temp = d; d = mo; mo = temp; } // Swap MM-DD
        return new Date(y, mo - 1, d);
      }
    },
    // YYYY-MM-DD or YYYY/MM/DD
    { regex: /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/, parse: (m) => new Date(m[1], m[2] - 1, m[3]) }
  ];

  for (const format of formats) {
    const match = trimmed.match(format.regex);
    if (match) {
      const date = format.parse(match);
      if (!isNaN(date.getTime()) && date <= new Date()) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // Fallback generic parsing
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime()) && fallback <= new Date()) {
    return fallback.toISOString().split('T')[0];
  }

  return null;
};

// Validate file type (image only)
const isValidImageFileType = (mimetype) => {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimetype);
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

// POST /registration/step1 - Create registration record
router.post('/step1', async (req, res) => {
  const { name, email, phone, dob, password, father_name, address } = req.body;
  const user_id = "NMS/NEWS/" + Math.floor(1000 + Math.random() * 9000);

  logger.info('Processing registration step 1');

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: phone' });
  }

  if (!dob || typeof dob !== 'string' || dob.trim() === '') {
    return res.status(400).json({ error: 'Missing required field: dob' });
  }

  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!isValidPhoneNumber(phone.trim())) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  const isoDob = parseFlexibleDate(dob);
  if (!isoDob) {
    return res.status(400).json({ error: 'Invalid date of birth format' });
  }

  const payload = buildPayload({
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    dob: isoDob,
    father_name: father_name ? father_name.trim() : null,
    address: address ? address.trim() : null,
    user_id: user_id   // ✅ यही add करना है
  });

  // Handle password mapping for PocketBase Auth collections natively
  if (password && password.trim() !== '') {
    payload.password = password.trim();
    payload.passwordConfirm = password.trim(); // Required implicitly by PocketBase for auth collections
  }

  try {
    const record = await pb.collection('reporter_registrations').create(payload);
    logger.info(`Registration step 1 completed. Record ID: ${record.id}`);

    res.status(201).json({
      success: true,
      id: record.id,
      message: 'Registration step 1 completed',
      data: payload
    });
  } catch (error) {
    logger.error(`PocketBase error creating registration record: ${error.message}`);

    if (error.status === 400 && error.data && error.data.data) {
      const fieldErrors = {};
      for (const [field, fieldError] of Object.entries(error.data.data)) {
        if (fieldError && fieldError.message) {
          fieldErrors[field] = fieldError.message;
        }
      }
      return res.status(400).json({ error: 'Validation failed', details: fieldErrors });
    }

    return res.status(400).json({ error: error.message || 'Failed to create registration record' });
  }
});

// POST /registration/step2 - Upload documents
router.post('/step2/:registrationId', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhar_front', maxCount: 1 },
  { name: 'aadhar_back', maxCount: 1 },
]), async (req, res) => {
  const { registrationId } = req.params;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ success: false, message: 'Registration ID is required' });
  }

  if (!req.files || !req.files.photo || !req.files.aadhar_front || !req.files.aadhar_back) {
    return res.status(400).json({ success: false, message: 'All three files are required: photo, aadhar_front, aadhar_back' });
  }

  const files = {
    photo: req.files.photo[0],
    aadhar_front: req.files.aadhar_front[0],
    aadhar_back: req.files.aadhar_back[0],
  };

  for (const [fieldName, file] of Object.entries(files)) {
    if (!isValidImageFileType(file.mimetype)) {
      return res.status(400).json({ success: false, message: `${fieldName} must be an image file` });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: `${fieldName} must be less than 5MB` });
    }
  }

  const registration = await pb.collection('reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ success: false, message: `Registration not found: ${registrationId}` });
  }

  const formData = new FormData();
  formData.append('registration_id', registrationId);
  formData.append('passport_photo', new Blob([files.photo.buffer], { type: files.photo.mimetype }), files.photo.originalname);
  formData.append('aadhaar_front', new Blob([files.aadhar_front.buffer], { type: files.aadhar_front.mimetype }), files.aadhar_front.originalname);
  formData.append('aadhaar_back', new Blob([files.aadhar_back.buffer], { type: files.aadhar_back.mimetype }), files.aadhar_back.originalname);

  const document = await pb.collection('registration_documents').create(formData);

  res.json({
    success: true,
    message: 'Files uploaded successfully',
    documentId: document.id,
  });
});

// POST /registration/step3 - Validate and complete registration
router.post('/step3/:registrationId', async (req, res) => {
  const { registrationId } = req.params;
  const { designation, working_area, father_name, full_address } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ success: false, message: 'Registration ID is required' });
  }

  const registration = await pb.collection('reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ success: false, message: `Registration not found: ${registrationId}` });
  }

  const docRecords = await pb.collection('registration_documents').getFullList({ filter: `registration_id = "${registrationId}"` });
  if (docRecords.length === 0) {
    return res.status(400).json({ success: false, message: 'Documents not found. Please complete step 2 first' });
  }

  const updatePayload = buildPayload({
    designation: designation || null,
    working_area: working_area || null,
    father_name: father_name || null,
    address: full_address || null,
  });

  const updatedRegistration = await pb.collection('reporter_registrations').update(registrationId, updatePayload);

  res.json({
    success: true,
    message: 'Registration validated and completed',
    registrationId: updatedRegistration.id,
  });
});

// POST /registration/step4 - Handle payment
router.post('/step4/:registrationId', upload.single('payment_proof'), async (req, res) => {
  const { registrationId } = req.params;
  const { payment_method, amount, razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id } = req.body;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ success: false, message: 'Registration ID is required' });
  }

  if (!payment_method || !['online', 'offline'].includes(payment_method)) {
    return res.status(400).json({ success: false, message: 'Payment method must be either "online" or "offline"' });
  }

  const registration = await pb.collection('reporter_registrations').getOne(registrationId);
  if (!registration) {
    return res.status(400).json({ success: false, message: `Registration not found: ${registrationId}` });
  }

  if (amount === undefined || amount === null || typeof Number(amount) !== 'number' || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
  }

  let paymentRecord;

  if (payment_method === 'online') {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Razorpay details required' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET_LIVE || '').update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    const paymentPayload = buildPayload({
      registration_id: registrationId,
      payment_method: 'online',
      amount: Number(amount),
      razorpay_order_id,
      razorpay_payment_id,
      status: 'success',
      verified_at: new Date().toISOString(),
    });

    paymentRecord = await pb.collection('registration_payments').create(paymentPayload);
  } else if (payment_method === 'offline') {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment proof file is required' });
    }

    if (!isValidImageFileType(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Payment proof must be an image file' });
    }

    const formData = new FormData();
    formData.append('registration_id', registrationId);
    formData.append('payment_method', 'offline');
    formData.append('amount', Number(amount));
    formData.append('status', 'pending');
    if (transaction_id) formData.append('transaction_id', transaction_id);
    formData.append('payment_screenshot', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

    paymentRecord = await pb.collection('registration_payments').create(formData);
  }

  await pb.collection('reporter_registrations').update(registrationId, {
    payment_status: payment_method === 'online' ? 'completed' : 'pending',
  });

  res.json({
    success: true,
    message: 'Payment processed successfully',
    paymentId: paymentRecord.id,
    paymentStatus: paymentRecord.status,
  });
});

// GET /registration/:registrationId - Get registration details
router.get('/:registrationId', async (req, res) => {
  const { registrationId } = req.params;

  if (!registrationId || registrationId.trim() === '') {
    return res.status(400).json({ success: false, message: 'Registration ID is required' });
  }

  const registration = await pb.collection('reporter_registrations').getOne(registrationId);
  const docRecords = await pb.collection('registration_documents').getFullList({ filter: `registration_id = "${registrationId}"` });
  const paymentRecords = await pb.collection('registration_payments').getFullList({ filter: `registration_id = "${registrationId}"` });

  res.json({
    success: true,
    registration,
    documents: docRecords.length > 0 ? docRecords[0] : null,
    payment: paymentRecords.length > 0 ? paymentRecords[0] : null,
  });
});

export default router;