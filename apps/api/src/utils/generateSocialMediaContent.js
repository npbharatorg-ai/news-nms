import logger from './logger.js';

const CATEGORY_HASHTAGS = {
  Politics: ['#Politics', '#Government', '#Policy'],
  Sports: ['#Sports', '#Cricket', '#Football', '#Tennis'],
  Technology: ['#Technology', '#Tech', '#Innovation', '#AI'],
  Business: ['#Business', '#Economy', '#Finance', '#Markets'],
  Entertainment: ['#Entertainment', '#Movies', '#Music', '#Celebrity'],
  Health: ['#Health', '#Wellness', '#Medical', '#Fitness'],
  Education: ['#Education', '#Learning', '#Students', '#Schools'],
  Science: ['#Science', '#Research', '#Discovery', '#Innovation'],
  World: ['#World', '#International', '#Global', '#News'],
  India: ['#India', '#Indian', '#Nation', '#Country'],
};

const GENERAL_HASHTAGS = ['#News', '#Breaking', '#Latest', '#NMS'];

const generateHashtags = (category) => {
  const categoryTags = CATEGORY_HASHTAGS[category] || [];
  return [...categoryTags, ...GENERAL_HASHTAGS];
};

const generateFacebookContent = (postData) => {
  const { title, description, category, link } = postData;
  const hashtags = generateHashtags(category);
  
  const content = `${title}\n\n${description}\n\n${link}\n\n${hashtags.join(' ')}`;
  
  return {
    platform: 'facebook',
    content,
    hashtags,
    formatted: {
      message: content,
      link,
    },
  };
};

const generateInstagramContent = (postData) => {
  const { title, description, category, link } = postData;
  const hashtags = generateHashtags(category);
  
  // Instagram caption with hashtags at the end
  const caption = `${title}\n\n${description}\n\n${link}\n\n${hashtags.join(' ')}`;
  
  return {
    platform: 'instagram',
    content: caption,
    hashtags,
    formatted: {
      caption,
      link,
    },
  };
};

const generateXContent = (postData) => {
  const { title, description, category, link } = postData;
  const hashtags = generateHashtags(category);
  
  // X (Twitter) has character limit, so we need to be concise
  const maxLength = 280;
  let tweet = `${title}\n${link}`;
  
  if (tweet.length + hashtags.join(' ').length + 1 <= maxLength) {
    tweet += `\n${hashtags.join(' ')}`;
  } else {
    // If too long, just use title and link with minimal hashtags
    const minimalHashtags = hashtags.slice(0, 2);
    tweet = `${title}\n${link} ${minimalHashtags.join(' ')}`;
  }
  
  return {
    platform: 'x',
    content: tweet,
    hashtags,
    formatted: {
      text: tweet,
      link,
    },
  };
};

const generateTelegramContent = (postData) => {
  const { title, description, category, link } = postData;
  const hashtags = generateHashtags(category);
  
  const message = `<b>${title}</b>\n\n${description}\n\n<a href="${link}">Read More</a>\n\n${hashtags.join(' ')}`;
  
  return {
    platform: 'telegram',
    content: message,
    hashtags,
    formatted: {
      text: message,
      parse_mode: 'HTML',
      link,
    },
  };
};

const generateWhatsAppContent = (postData) => {
  const { title, description, category, link } = postData;
  const hashtags = generateHashtags(category);
  
  const message = `*${title}*\n\n${description}\n\n${link}\n\n${hashtags.join(' ')}`;
  
  return {
    platform: 'whatsapp',
    content: message,
    hashtags,
    formatted: {
      text: message,
      link,
    },
  };
};

const generateSocialMediaContent = (postData, platform) => {
  if (!postData || !platform) {
    throw new Error('postData and platform are required');
  }

  const { title, description, category, link } = postData;

  if (!title || !description || !category || !link) {
    throw new Error('postData must contain title, description, category, and link');
  }

  logger.info(`Generating ${platform} content for post: ${title}`);

  switch (platform.toLowerCase()) {
    case 'facebook':
      return generateFacebookContent(postData);
    case 'instagram':
      return generateInstagramContent(postData);
    case 'x':
      return generateXContent(postData);
    case 'telegram':
      return generateTelegramContent(postData);
    case 'whatsapp':
      return generateWhatsAppContent(postData);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export { generateSocialMediaContent };