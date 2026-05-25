/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("approval_status");
  const previousStatus = original.get("approval_status");
  
  // Only proceed if approval_status field changed
  if (previousStatus === currentStatus) {
    e.next();
    return;
  }
  
  const reporterName = e.record.get("name") || "Reporter";
  const reporterEmail = e.record.get("email");
  const reporterId = e.record.id;
  
  // Skip if no email address
  if (!reporterEmail) {
    e.next();
    return;
  }
  
  const senderAddress = $app.settings().meta.senderAddress;
  const senderName = $app.settings().meta.senderName;
  
  if (currentStatus === "approved") {
    // Send approval email
    const message = new MailerMessage({
      from: {
        address: senderAddress,
        name: senderName
      },
      to: [{ address: reporterEmail }],
      subject: "Payment Approved",
      html: "<h2>Payment Approval Notification</h2>" +
            "<p>Dear " + reporterName + ",</p>" +
            "<p>Your payment has been <strong>approved</strong>.</p>" +
            "<p><strong>Reporter ID:</strong> " + reporterId + "</p>" +
            "<p><strong>Status:</strong> Approved</p>" +
            "<p>Thank you for your submission.</p>"
    });
    $app.newMailClient().send(message);
  } else if (currentStatus === "rejected") {
    // Send rejection email
    const message = new MailerMessage({
      from: {
        address: senderAddress,
        name: senderName
      },
      to: [{ address: reporterEmail }],
      subject: "Payment Rejected",
      html: "<h2>Payment Rejection Notification</h2>" +
            "<p>Dear " + reporterName + ",</p>" +
            "<p>Your payment has been <strong>rejected</strong>.</p>" +
            "<p><strong>Reporter ID:</strong> " + reporterId + "</p>" +
            "<p><strong>Status:</strong> Rejected</p>" +
            "<p>Please review your submission and try again.</p>"
    });
    $app.newMailClient().send(message);
  }
  
  e.next();
}, "reporters");