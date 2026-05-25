import pb from '../utils/pocketbaseClient.js';

const adminAuth = async (req, res, next) => {
  console.log('[adminAuth] Starting authentication check');
  
  const authHeader = req.headers.authorization;
  console.log('[adminAuth] Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[adminAuth] Invalid authorization header format');
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  console.log('[adminAuth] Token extracted, length:', token.length);
  
  if (!token) {
    console.log('[adminAuth] Empty token');
    throw new Error('No authorization token provided');
  }

  pb.authStore.save(token);
  console.log('[adminAuth] Token saved to PocketBase auth store');
  
  if (!pb.authStore.isValid) {
    console.log('[adminAuth] Token is invalid or expired');
    throw new Error('Invalid or expired token');
  }

  const authModel = pb.authStore.model;
  console.log('[adminAuth] Auth model loaded:', {
    id: authModel?.id,
    collectionName: authModel?.collectionName,
    email: authModel?.email
  });
  
  if (!authModel) {
    console.log('[adminAuth] No auth model found');
    throw new Error('Invalid authentication');
  }
  
  if (authModel.collectionName !== 'admin_users') {
    console.log('[adminAuth] User not from admin_users collection:', authModel.collectionName);
    throw new Error('Admin access required');
  }

  const adminUser = await pb.collection('admin_users').getOne(authModel.id, { $autoCancel: false });
  console.log('[adminAuth] Admin user fetched:', {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role
  });
  
  if (!adminUser) {
    console.log('[adminAuth] Admin user not found in database');
    throw new Error('Admin access required');
  }

  if (adminUser.role !== 'admin' && adminUser.role !== 'super_admin') {
    console.log('[adminAuth] Insufficient role:', adminUser.role);
    throw new Error('Admin access required');
  }

  console.log('[adminAuth] Authentication successful for:', adminUser.email);
  
  req.admin = adminUser;
  req.adminToken = token;
  
  next();
};

export default adminAuth;