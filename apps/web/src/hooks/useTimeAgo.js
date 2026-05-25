import { formatDistanceToNow } from 'date-fns';

export const useTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};