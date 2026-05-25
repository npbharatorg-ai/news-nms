/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // Only process if payment status is 'success' or approval_status is 'approved'
  const paymentStatus = e.record.get("status");
  const approvalStatus = e.record.get("approval_status");

  if (paymentStatus !== "success" && approvalStatus !== "approved") {
    e.next();
    return;
  }

  try {
    // Get the registration_id from the payment record
    const registrationId = e.record.get("registration_id");

    if (!registrationId) {
      e.next();
      return;
    }

    // Fetch the corresponding reporter_registrations record
    const registration = $app.findRecordById("reporter_registrations", registrationId);

    if (!registration) {
      e.next();
      return;
    }

    // Update the registration record with approved status
    registration.set("approval_status", "approved");
    registration.set("status", "ACTIVE");
    const uniqueUserId = "NMS" + Date.now();
    registration.set("user_id", uniqueUserId);
    registration.set("approval_status", "approved");
    registration.set("status", "ACTIVE");

    // Save the updated registration record
    $app.save(registration);

    // Send confirmation email with User ID and login instructions
    const email = registration.get("email");
    const name = registration.get("name");
    const userId = registration.get("user_id");

    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: email }],
      subject: "Your Reporter Account is Approved!",
      html: "<h2>Welcome to Our News Platform!</h2>" +
        "<p>Dear " + name + ",</p>" +
        "<p>Congratulations! Your reporter account has been approved and is now active.</p>" +
        "<h3>Your Account Details:</h3>" +
        "<p><strong>User ID:</strong> " + userId + "</p>" +
        "<p><strong>Email:</strong> " + email + "</p>" +
        "<h3>Login Instructions:</h3>" +
        "<p>You can now log in to your account using:</p>" +
        "<ul>" +
        "<li><strong>Email:</strong> " + email + "</li>" +
        "<li><strong>Password:</strong> The password you set during registration</li>" +
        "</ul>" +
        "<p>Visit our platform and log in to start submitting news stories.</p>" +
        "<p>If you have any questions, please contact our support team.</p>" +
        "<p>Best regards,<br>The News Platform Team</p>"
    });
    $app.newMailClient().send(message);


  } catch (error) {
    console.log("Error in reporter account creation hook: " + error.message);
  }

  e.next();
}, "registration_payments");