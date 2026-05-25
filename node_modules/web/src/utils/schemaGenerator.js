export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Navdhriti Manavadhikar Samachar",
    "alternateName": "NMS News",
    "url": "https://nms.news",
    "logo": {
      "@type": "ImageObject",
      "url": "https://nms.news/favicon.svg"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+919251120059",
      "contactType": "customer service",
      "email": "contact@nms.news",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/navdhritinews",
      "https://twitter.com/navdhritinews",
      "https://www.youtube.com/navdhritinews"
    ]
  };
};

export const generateNewsArticleSchema = (article, url) => {
  if (!article) return null;
  
  const title = article.title || article.headline || 'Untitled News';
  const description = article.description || article.excerpt || '';
  const datePublished = article.created_at || article.published_at || article.created || new Date().toISOString();
  const dateModified = article.updated_at || article.updated || datePublished;
  const authorName = article.author_name || 'Staff Reporter';
  
  // Handle image URL
  let imageUrl = "https://nms.news/favicon.svg";
  if (article.photo1 || article.image) {
    const imageField = article.photo1 || article.image;
    imageUrl = `https://api.nms.news/api/files/${article.collectionId}/${article.id}/${imageField}`;
  }

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url || `https://nms.news/news/${article.id}`
    },
    "headline": title,
    "description": description,
    "image": [imageUrl],
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "Navdhriti Manavadhikar Samachar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nms.news/favicon.svg"
      }
    }
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};