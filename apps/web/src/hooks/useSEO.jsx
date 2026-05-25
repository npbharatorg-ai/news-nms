import React from 'react';
import { Helmet } from 'react-helmet';

export const useSEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website', 
  schemas = [] 
}) => {
  const siteName = 'Navdhriti Manavadhikar Samachar';
  const defaultTitle = `${siteName} - Breaking News, Latest Updates`;
  const defaultDesc = 'Get latest news, breaking news, live updates on politics, business, sports, entertainment, technology, health and more. Navdhriti Manavadhikar Samachar - Your trusted news source.';
  const defaultKeywords = 'news, breaking news, latest news, live news, India news, politics, business, sports, entertainment, technology, health';
  const defaultImage = 'https://nms.news/favicon.svg';
  const baseUrl = 'https://nms.news';

  const finalTitle = title ? `${title} - ${siteName}` : defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url ? `${baseUrl}${url}` : baseUrl;

  const SEOTags = (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        schema && (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        )
      ))}
    </Helmet>
  );

  return SEOTags;
};