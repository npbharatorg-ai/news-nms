/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  const oldRecord = e.originalRecord;

  // ✅ सिर्फ तभी trigger जब status change होकर approved बने
  if (
    record.get("status") === "approved" &&
    oldRecord.get("status") !== "approved"
  ) {
    console.log("🔥 News Approved → Auto Posting Start");

    const payload = {
      newsId: record.id,
      title: record.get("headline"),
      description: record.get("content"),
      imageUrl: record.get("image")
    };

    try {
      const response = $http.send({
        url: "http://localhost:3001/social-media/post-to-platforms",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("✅ Social media post response:", response);
    } catch (error) {
      console.error("❌ Error posting to social media:", error);
    }
  }

  e.next();
}, "published_news");