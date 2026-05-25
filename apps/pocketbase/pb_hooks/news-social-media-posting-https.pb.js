// Hook: Auto-post approved news to social media platforms (production HTTPS)
// Triggers when published_news or reporter_news status changes to 'approved'

$app.onRecordAfterUpdateSuccess((e) => {
  e.next();
  
  const record = e.record;
  const original = record.original();
  
  // Only trigger if status changed to 'approved'
  const newStatus = record.get("status");
  const oldStatus = original.get("status");
  
  if (newStatus === "approved" && oldStatus !== "approved") {
    console.log(`[Social Media HTTPS] News approved: ${record.id} - triggering social media post`);
    
    // Prepare news data for social media posting
    const newsData = {
      id: record.id,
      title: record.get("title") || record.get("headline") || "",
      content: record.get("content") || "",
      image: record.get("image") || "",
      category: record.get("category") || "",
      status: newStatus
    };
    
    console.log("[Social Media HTTPS] Posting to platforms:", JSON.stringify(newsData));
    
    // Send async HTTP POST to social media service (production HTTPS)
    try {
      const response = $http.send({
        url: "https://api.nms.news/social-media/post-to-platforms",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newsData),
        timeout: 30
      });
      
      console.log(`[Social Media HTTPS] Post request sent successfully. Status: ${response.statusCode}`);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("[Social Media HTTPS] Platforms notified successfully");
      } else {
        console.log(`[Social Media HTTPS] Warning: Unexpected status code ${response.statusCode}`);
      }
    } catch (error) {
      // Log error but don't block the approval process
      console.log(`[Social Media HTTPS] Error posting to platforms: ${error.message || error}`);
      console.log("[Social Media HTTPS] News approval will continue despite posting error");
    }
  }
}, "published_news");

$app.onRecordAfterUpdateSuccess((e) => {
  e.next();
  
  const record = e.record;
  const original = record.original();
  
  // Only trigger if status changed to 'approved'
  const newStatus = record.get("status");
  const oldStatus = original.get("status");
  
  if (newStatus === "approved" && oldStatus !== "approved") {
    console.log(`[Social Media HTTPS] Reporter news approved: ${record.id} - triggering social media post`);
    
    // Prepare news data for social media posting
    const newsData = {
      id: record.id,
      title: record.get("title") || record.get("headline") || "",
      content: record.get("content") || "",
      image: record.get("image") || "",
      category: record.get("category") || "",
      status: newStatus
    };
    
    console.log("[Social Media HTTPS] Posting to platforms:", JSON.stringify(newsData));
    
    // Send async HTTP POST to social media service (production HTTPS)
    try {
      const response = $http.send({
        url: "https://api.nms.news/social-media/post-to-platforms",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newsData),
        timeout: 30
      });
      
      console.log(`[Social Media HTTPS] Post request sent successfully. Status: ${response.statusCode}`);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("[Social Media HTTPS] Platforms notified successfully");
      } else {
        console.log(`[Social Media HTTPS] Warning: Unexpected status code ${response.statusCode}`);
      }
    } catch (error) {
      // Log error but don't block the approval process
      console.log(`[Social Media HTTPS] Error posting to platforms: ${error.message || error}`);
      console.log("[Social Media HTTPS] News approval will continue despite posting error");
    }
  }
}, "reporter_news");