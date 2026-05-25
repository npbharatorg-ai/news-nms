import { useState, useEffect } from 'react';

// CRITICAL: This hook no longer makes any API calls to prevent 404 errors
// It simply returns 'Unknown Reporter' for all reporter IDs
export const useReporterName = (reporterId) => {
  const [name] = useState('Unknown Reporter');
  const [loading] = useState(false);

  // No API calls, no caching, no database fetching
  // Just return static values immediately
  return { name, loading };
};