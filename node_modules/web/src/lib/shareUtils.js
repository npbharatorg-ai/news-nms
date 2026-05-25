export const generateShareUrl = (articleId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/news/${articleId}`;
};

export const generateShareMetadata = (article) => {
  if (!article) return null;
  
  const title = article.headline || article.title || 'News Article';
  const description = article.excerpt || article.description || 'Read the latest news on Navdhriti Manawadhikar.';
  const url = generateShareUrl(article.id);
  
  return { title, description, url };
};

export const getShareText = (reportName, articleTitle) => {
  return `Read this report by ${reportName || 'Navdhriti Manawadhikar'}: ${articleTitle}`;
};