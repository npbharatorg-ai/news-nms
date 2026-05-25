import 'dotenv/config';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
import logger from '../utils/logger.js';

// Initialize Twitter API client
const twitterClient = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

const twitterApiV2 = twitterClient.readWrite;

/**
 * Post to Facebook using Graph API
 * @param {Object} newsData - News data with id, title, content, image, category, author_name, excerpt
 * @returns {Object} - { status: 'success'|'failed', postId: string, error?: string }
 */
export const postToFacebook = async (newsData) => {
  const { id, title, content, image, category, author_name, excerpt } = newsData;

  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken || !pageId) {
    logger.warn('Facebook credentials not configured');
    throw new Error('Facebook credentials not configured');
  }

  logger.info(`Posting to Facebook: ${title}`);

  try {
    // Generate caption with hashtags
    const hashtags = ['#News', '#Breaking', '#Latest', '#NMS'];
    const caption = `${title}\n\n${excerpt || content}\n\n${hashtags.join(' ')}`;

    // Prepare request data
    const postData = {
      message: caption,
      link: `https://nms.news/news/${id}`,
    };

    // If image is provided, add it to the post
    if (image) {
      postData.picture = image;
    }

    // Post to Facebook
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      postData,
      {
        params: {
          access_token: pageAccessToken,
        },
      }
    );

    logger.info(`Facebook post successful: ${response.data.id}`);

    return {
      status: 'success',
      postId: response.data.id,
    };
  } catch (error) {
    logger.error(`Facebook posting failed: ${error.message}`);
    throw new Error(`Facebook API error: ${error.message}`);
  }
};

/**
 * Post to Instagram using Graph API (two-step process)
 * @param {Object} newsData - News data with id, title, content, image, category, author_name, excerpt
 * @returns {Object} - { status: 'success'|'failed', postId: string, error?: string }
 */
export const postToInstagram = async (newsData) => {
  const { id, title, content, image, category, author_name, excerpt } = newsData;

  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!businessAccountId || !accessToken) {
    logger.warn('Instagram credentials not configured');
    throw new Error('Instagram credentials not configured');
  }

  logger.info(`Posting to Instagram: ${title}`);

  try {
    // Generate caption with hashtags
    const hashtags = ['#News', '#Breaking', '#Latest', '#NMS'];
    const caption = `${title}\n\n${excerpt || content}\n\n${hashtags.join(' ')}`;

    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media`,
      {
        image_url: image,
        caption: caption,
      },
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    const mediaId = containerResponse.data.id;
    logger.info(`Instagram media container created: ${mediaId}`);

    // Step 2: Publish the media
    const publishResponse = await axios.post(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media_publish`,
      {
        creation_id: mediaId,
      },
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    logger.info(`Instagram post published: ${publishResponse.data.id}`);

    return {
      status: 'success',
      postId: publishResponse.data.id,
    };
  } catch (error) {
    logger.error(`Instagram posting failed: ${error.message}`);
    throw new Error(`Instagram API error: ${error.message}`);
  }
};

/**
 * Post to Twitter/X using API v2
 * @param {Object} newsData - News data with id, title, content, image, category, author_name, excerpt
 * @returns {Object} - { status: 'success'|'failed', postId: string, error?: string }
 */
export const postToTwitter = async (newsData) => {
  const { id, title, content, image, category, author_name, excerpt } = newsData;

  logger.info(`Posting to Twitter/X: ${title}`);

  try {
    // Generate tweet text with hashtags (Twitter has 280 char limit)
    const hashtags = ['#News', '#Breaking', '#Latest'];
    const link = `https://nms.news/news/${id}`;

    // Create concise tweet
    let tweetText = `${title}\n${link}`;

    // Add hashtags if space allows
    const hashtagString = hashtags.join(' ');
    if (tweetText.length + hashtagString.length + 1 <= 280) {
      tweetText += `\n${hashtagString}`;
    }

    // Post to Twitter
    const response = await twitterApiV2.v2.tweet(tweetText);

    logger.info(`Twitter post successful: ${response.data.id}`);

    return {
      status: 'success',
      postId: response.data.id,
    };
  } catch (error) {
    logger.error(`Twitter posting failed: ${error.message}`);
    throw new Error(`Twitter API error: ${error.message}`);
  }
};

/**
 * Post to all platforms (Facebook, Instagram, Twitter)
 * @param {Object} newsData - News data with id, title, content, image, category, author_name, excerpt
 * @returns {Object} - { success: true, platforms: { facebook: {...}, instagram: {...}, twitter: {...} } }
 */
export const postToAllPlatforms = async (newsData) => {
  logger.info(`Starting multi-platform posting for news: ${newsData.id}`);

  const results = {
    facebook: { status: 'pending', postId: null, error: null },
    instagram: { status: 'pending', postId: null, error: null },
    twitter: { status: 'pending', postId: null, error: null },
  };

  // Post to Facebook
  try {
    const facebookResult = await postToFacebook(newsData);
    results.facebook = facebookResult;
    logger.info(`Facebook posting completed: ${facebookResult.status}`);
  } catch (error) {
    results.facebook = {
      status: 'failed',
      postId: null,
      error: error.message,
    };
    logger.error(`Facebook posting error: ${error.message}`);
  }

  // Post to Instagram
  try {
    const instagramResult = await postToInstagram(newsData);
    results.instagram = instagramResult;
    logger.info(`Instagram posting completed: ${instagramResult.status}`);
  } catch (error) {
    results.instagram = {
      status: 'failed',
      postId: null,
      error: error.message,
    };
    logger.error(`Instagram posting error: ${error.message}`);
  }

  // Post to Twitter
  try {
    const twitterResult = await postToTwitter(newsData);
    results.twitter = twitterResult;
    logger.info(`Twitter posting completed: ${twitterResult.status}`);
  } catch (error) {
    results.twitter = {
      status: 'failed',
      postId: null,
      error: error.message,
    };
    logger.error(`Twitter posting error: ${error.message}`);
  }

  logger.info(`Multi-platform posting completed for news: ${newsData.id}`);

  return {
    success: true,
    platforms: results,
  };
};