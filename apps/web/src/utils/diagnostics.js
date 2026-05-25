import pb from '@/lib/pocketbaseClient.js';

/**
 * Utility to test PocketBase database connectivity on application startup.
 * Attempts to fetch 1 record from 'published_news' to verify connection and read access.
 */
export const testDatabaseConnectivity = async () => {
  try {
    console.log('[Diagnostics] 🔄 Testing PocketBase connectivity...');
    
    // Attempting to fetch a single item from published_news collection
    const res = await pb.collection('published_news').getList(1, 1, {
      $autoCancel: false,
    });
    
    console.log('[Diagnostics] ✅ PocketBase connection SUCCESS.');
    console.log(`[Diagnostics] Collection "published_news" is accessible. Total items: ${res.totalItems}`);
    return { success: true, totalItems: res.totalItems };
  } catch (error) {
    console.error('[Diagnostics] ❌ PocketBase connection FAILED:');
    console.error(`Status: ${error.status}`);
    console.error(`Message: ${error.message}`);
    console.error(`Data:`, error.data);
    return { success: false, error };
  }
};