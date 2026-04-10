
const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f5;
      color: #27272a;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 32px 24px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }
    .content {
      padding: 32px 24px;
    }
    .content h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .content p {
      font-size: 15px;
      line-height: 1.7;
      color: #52525b;
      margin-bottom: 16px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      background-color: #f97316;
      color: #ffffff;
      padding: 14px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #ea580c;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 16px;
      border-left: 4px solid #f97316;
      margin: 24px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #fafafa;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    .footer p {
      font-size: 13px;
      color: #78716c;
      margin: 8px 0;
    }
  </style>
`;

export const accountVer = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Account Verification</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please verify your email address to complete your account setup.</p>
          <div class="button-container">
            <a href="${resetLink}" class="button">Verify Account</a>
          </div>
          <p style="font-size: 13px; color: #78716c;">Or copy this link: ${resetLink}</p>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
          <p>This link expires in 24 hours.</p></p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export const productDeleted = (productName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Product Deleted</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Product Notification</p>
        </div>
        <div class="content">
          <h2>Product Has Been Deleted</h2>
          <p>Your product "<strong>${productName}</strong>" has been removed from our platform.</p>
          <div class="highlight">
            <p><strong>Note:</strong> All purchases and inquiries related to this product will be archived.</p>
          </div>
          <p>If you believe this was a mistake, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export const sellerRequestAccepted = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seller Request Approved</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>You're Now a Seller!</p>
        </div>
        <div class="content">
          <h2>Welcome, ${userName}!</h2>
          <p>Great news! Your seller request has been approved. You can now start selling on Handlyy.</p>
          <div class="highlight">
            <p><strong>What's next?</strong> Create your first product and start sharing your creations with our community.</p>
          </div>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/myProducts" class="button">Start Selling</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export const productVerfied = (productName, adminName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Product Verified</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Product Verification</p>
        </div>
        <div class="content">
          <h2>Your Product Is Verified!</h2>
          <p>Your product "<strong>${productName}</strong>" has been reviewed and verified by our admin team.</p>
          <div class="highlight">
            <p><strong>Verified by:</strong> ${adminName.firstName} ${adminName.lastName}</p>
          </div>
          <p>Your product is now live and ready for customers to discover!</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/myProducts" class="button">View Your Products</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export const sendEmailSignUp = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Handlyy</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Welcome to Our Community!</p>
        </div>
        <div class="content">
          <h2>Thanks for Signing Up!</h2>
          <p>We're excited to have you join Handlyy. To complete your registration, please verify your email address.</p>
          <div class="button-container">
            <a href="${resetLink}" class="button">Verify Email</a>
          </div>
          <p style="font-size: 13px; color: #78716c;">Or copy this link: ${resetLink}</p>
          <div class="highlight">
            <p>This link expires in 24 hours. If you didn't sign up for this account, you can ignore this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const resetPassword = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <div class="button-container">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #78716c;">Or copy this link: ${resetLink}</p>
          <div class="highlight">
            <p><strong>Security tip:</strong> Never share this link with anyone. This link expires in 1 hour.</p>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const orderConfirmation = (orderNumber, orderDate, totalAmount, buyerName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Order Confirmed</p>
        </div>
        <div class="content">
          <h2>Thanks for Your Order!</h2>
          <p>Hi ${buyerName},</p>
          <p>Your order has been successfully placed and will be processed shortly.</p>
          <div class="highlight">
            <p><strong>Order #:</strong> ${orderNumber}<br>
            <strong>Date:</strong> ${orderDate}<br>
            <strong>Total:</strong> $${totalAmount}</p>
          </div>
          <p>We'll send you a tracking update soon. You can check your order status anytime in your account.</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/orders" class="button">View Orders</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
          <p>Questions? Contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const cartReset = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cart Reset</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Cart Update</p>
        </div>
        <div class="content">
          <h2>Your Cart Has Been Reset</h2>
          <p>Hi ${userName},</p>
          <p>Your shopping cart has been cleared. You can start fresh and add items whenever you're ready.</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/shop" class="button">Continue Shopping</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const friendRequestSent = (senderName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Friend Request</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Friend Request</p>
        </div>
        <div class="content">
          <h2>You Have a New Friend Request</h2>
          <p><strong>${senderName}</strong> has sent you a friend request on Handlyy!</p>
          <div class="highlight">
            <p>Accept or decline the request to connect with other sellers and buyers in our community.</p>
          </div>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/friends" class="button">View Request</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const friendRequestAccepted = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Friend Request Accepted</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Friend Request Accepted</p>
        </div>
        <div class="content">
          <h2>You're Now Friends!</h2>
          <p><strong>${userName}</strong> has accepted your friend request. You can now chat and collaborate!</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/chat" class="button">Start Chatting</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

export const friendRequestDenied = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Friend Request Status</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Handlyy</h1>
          <p>Friend Request</p>
        </div>
        <div class="content">
          <h2>Friend Request Declined</h2>
          <p>${userName} has declined your friend request. Don't worry, you can send another request later!</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/friends" class="button">Back to Friends</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 Handlyy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};
