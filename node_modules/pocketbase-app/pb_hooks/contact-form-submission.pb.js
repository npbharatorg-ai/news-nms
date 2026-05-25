/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const name = e.record.get("name");
  const email = e.record.get("email");
  const subject = e.record.get("subject");
  const message = e.record.get("message");
  
  // Send confirmation email to user
  const userMessage = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: email }],
    subject: "We received your message - " + subject,
    html: "<h2>Thank you for contacting us!</h2><p>Dear " + name + ",</p><p>We have received your message and will get back to you as soon as possible.</p><p><strong>Your Message:</strong><br>" + message + "</p><p>Best regards,<br>Navdhriti Team</p>"
  });
  $app.newMailClient().send(userMessage);
  
  // Send notification email to admin
  const adminMessage = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: "admin@navdhriti.org" }],
    subject: "New Contact Submission: " + subject,
    html: "<h2>New Contact Form Submission</h2><p><strong>Name:</strong> " + name + "</p><p><strong>Email:</strong> " + email + "</p><p><strong>Phone:</strong> " + (e.record.get("phone") || "Not provided") + "</p><p><strong>Subject:</strong> " + subject + "</p><p><strong>Message:</strong><br>" + message + "</p><p><strong>Submission ID:</strong> " + e.record.id + "</p>"
  });
  $app.newMailClient().send(adminMessage);
  
  e.next();
}, "contact_submissions");