export const emailVerificationTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Echo - Email Verification</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background-color: #f8f9fa;
      padding: 20px 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    
    .header {
      padding: 40px 40px 20px 40px;
      background: linear-gradient(135deg, #785DBA 0%, #9575CD 100%);
      color: white;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    
    .main-content {
      padding: 40px;
    }
    
    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 30px 0;
      line-height: 1.2;
    }
    
    .description {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }
    
    .otp-container {
      background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
      border: 3px solid #785DBA;
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      margin: 30px 0;
      position: relative;
      overflow: hidden;
    }
    
    .otp-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(120, 93, 186, 0.1), transparent);
      animation: shimmer 3s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .otp-code {
      font-size: 48px;
      color: #785DBA;
      font-weight: bold;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .validity-notice {
      font-size: 16px;
      color: #6B7280;
      line-height: 1.6;
      margin: 0 0 25px 0;
      padding: 15px;
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      border-radius: 0 8px 8px 0;
    }
    
    .instructions {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin: 0 0 25px 0;
    }
    
    .closing {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin: 30px 0 0 0;
      padding-top: 30px;
      border-top: 2px solid #E5E7EB;
    }
    
    /* Mobile responsive styles */
    @media screen and (max-width: 640px) {
      body {
        padding: 10px 0;
      }
      
      .email-container {
        margin: 0 10px;
        border-radius: 12px;
      }
      
      .header {
        padding: 30px 20px 15px 20px;
      }
      
      .header-top {
        margin-bottom: 20px;
      }
      
      .logo {
        font-size: 24px;
      }
      

      
      .main-content {
        padding: 30px 20px;
      }
      
      .welcome-title {
        font-size: 28px;
        margin-bottom: 20px;
      }
      
      .description {
        font-size: 15px;
        margin-bottom: 20px;
      }
      
      .otp-container {
        padding: 30px 15px;
        margin: 20px 0;
        border-radius: 12px;
      }
      
      .otp-code {
        font-size: 36px;
        letter-spacing: 4px;
      }
      
      .validity-notice {
        font-size: 14px;
        padding: 12px;
        margin-bottom: 20px;
      }
      
      .instructions {
        font-size: 15px;
        margin-bottom: 20px;
      }
      
      .closing {
        font-size: 15px;
        margin-top: 25px;
        padding-top: 25px;
      }
    }
    
    @media screen and (max-width: 480px) {
      .header {
        padding: 25px 15px 10px 15px;
      }
      
      .main-content {
        padding: 25px 15px;
      }
      
      .welcome-title {
        font-size: 24px;
      }
      
      .otp-code {
        font-size: 32px;
        letter-spacing: 2px;
      }
      
      .otp-container {
        padding: 25px 10px;
      }
    }
    
    @media screen and (max-width: 360px) {
      .header-top {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .otp-code {
        font-size: 28px;
        letter-spacing: 1px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with logo and social icons -->
    <div class="header">
      <div class="header-top">
        <div class="logo">Echo</div>
      </div>
    </div>
    
    <div class="main-content">
      <!-- Main heading -->
      <h1 class="welcome-title">Welcome to Echo!</h1>
      
      <!-- Main content -->
      <p class="description">
        Thank you for signing up with Echo. To complete your registration and verify your email address, please use the OTP below:
      </p>
      
      <!-- OTP Display -->
      <div class="otp-container">
        <div class="otp-code">${otp}</div>
      </div>
      
      <!-- Validity notice -->
      <p class="validity-notice">
        ⏰ This OTP is valid for the next 15 minutes. Please enter this code in the verification form to activate your account.
      </p>
      
      <!-- Additional instructions -->
      <p class="instructions">
        If you did not create an account with Echo, please ignore this email and no further action is required.
      </p>
      
      <!-- Closing -->
      <p class="closing">
        Welcome aboard!<br>
        — The Echo Team
      </p>
    </div>
  </div>
</body>
</html>
`;

export const welcomeUserTemplate = (name?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Echo - Account Created Successfully</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px 0;
      min-height: 100vh;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;
    }
    
    .header {
      padding: 40px 40px 20px 40px;
      background: linear-gradient(135deg, #785DBA 0%, #9575CD 100%);
      color: white;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(135deg, #785DBA 0%, #9575CD 100%);
      border-radius: 0 0 50% 50%;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .main-content {
      padding: 50px 40px 40px 40px;
    }
    
    .success-title {
      font-size: 32px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 30px 0;
      line-height: 1.2;
      text-align: center;
    }
    
    .celebration-container {
      text-align: center;
      margin: 30px 0;
      position: relative;
    }
    
    .celebration-img {
      width: 100px;
      height: auto;
      margin: 20px 0;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(120, 93, 186, 0.2);
    }
    
    .confetti {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      animation: confetti 3s infinite ease-in-out;
    }
    
    @keyframes confetti {
      0%, 100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
      50% { transform: translateX(-50%) translateY(-20px) scale(1.2); opacity: 0.8; }
    }
    
    .congratulations-text {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin: 0 0 30px 0;
      text-align: center;
    }
    
    .features-box {
      background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
      border: 3px solid #785DBA;
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
      position: relative;
      overflow: hidden;
    }
    
    .features-box::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #785DBA, #9575CD, #785DBA);
      border-radius: 16px;
      z-index: -1;
      animation: borderGlow 3s infinite;
    }
    
    @keyframes borderGlow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .features-title {
      font-size: 20px;
      font-weight: 600;
      color: #785DBA;
      margin: 0 0 20px 0;
      text-align: center;
    }
    
    .features-list {
      font-size: 16px;
      color: #785DBA;
      line-height: 2;
      margin: 0;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .feature-item:hover {
      background-color: rgba(120, 93, 186, 0.1);
      padding-left: 12px;
    }
    
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    
    .cta-button {
      background: linear-gradient(135deg, #785DBA 0%, #9575CD 100%);
      color: #ffffff;
      padding: 18px 40px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(120, 93, 186, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: all 0.5s;
    }
    
    .cta-button:hover::before {
      left: 100%;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(120, 93, 186, 0.4);
    }
    
    .support-text {
      font-size: 16px;
      color: #6B7280;
      line-height: 1.6;
      margin: 0 0 25px 0;
      background-color: #FEF3C7;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #F59E0B;
    }
    
    .closing {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin: 30px 0 0 0;
      padding-top: 30px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
    }
    
    /* Mobile responsive styles */
    @media screen and (max-width: 640px) {
      body {
        padding: 10px 0;
      }
      
      .email-container {
        margin: 0 10px;
        border-radius: 16px;
      }
      
      .header {
        padding: 30px 20px 15px 20px;
      }
      
      .header-top {
        margin-bottom: 20px;
      }
      
      .logo {
        font-size: 24px;
      }
      
      .social-icon {
        width: 20px;
        height: 20px;
      }
      
      .main-content {
        padding: 40px 20px 30px 20px;
      }
      
      .success-title {
        font-size: 28px;
        margin-bottom: 20px;
      }
      
      .celebration-img {
        width: 80px;
      }
      
      .congratulations-text {
        font-size: 15px;
        margin-bottom: 20px;
      }
      
      .features-box {
        padding: 25px 20px;
        margin: 20px 0;
        border-radius: 12px;
      }
      
      .features-title {
        font-size: 18px;
        margin-bottom: 15px;
      }
      
      .features-list {
        font-size: 15px;
        line-height: 1.8;
      }
      
      .feature-item {
        margin-bottom: 10px;
        padding: 6px 0;
      }
      
      .cta-button {
        padding: 16px 35px;
        font-size: 15px;
        border-radius: 20px;
      }
      
      .support-text {
        font-size: 14px;
        padding: 15px;
        margin-bottom: 20px;
      }
      
      .closing {
        font-size: 15px;
        margin-top: 25px;
        padding-top: 25px;
      }
    }
    
    @media screen and (max-width: 480px) {
      .header {
        padding: 25px 15px 10px 15px;
      }
      
      .main-content {
        padding: 35px 15px 25px 15px;
      }
      
      .success-title {
        font-size: 24px;
      }
      
      .celebration-img {
        width: 70px;
      }
      
      .features-box {
        padding: 20px 15px;
      }
      
      .cta-button {
        padding: 14px 30px;
        font-size: 14px;
        border-radius: 18px;
      }
    }
    
    @media screen and (max-width: 360px) {
      .header-top {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .success-title {
        font-size: 22px;
        line-height: 1.1;
      }
      
      .celebration-img {
        width: 60px;
      }
      
      .features-list {
        font-size: 14px;
      }
      
      .cta-button {
        padding: 12px 25px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with logo and social icons -->
    <div class="header">
      <div class="header-top">
        <div class="logo">Echo</div>
      </div>
    </div>
    
    <div class="main-content">
      <!-- Main heading -->
      <h1 class="success-title">Account Successfully Created!</h1>
      
      <!-- Celebration image with confetti effect -->
      <div class="celebration-container">
        <div class="confetti">🎉</div>
        <img 
          src="https://res.cloudinary.com/dixoaggbe/image/upload/v1731841849/thumbs_up_gif.gif" 
          alt="Thumbs up celebration" 
          class="celebration-img" />
        <div class="confetti" style="left: 30%; animation-delay: 1s;">✨</div>
        <div class="confetti" style="left: 70%; animation-delay: 2s;">🎊</div>
      </div>
      
      <!-- Main content -->
      <p class="congratulations-text">
        Congratulations${name ? `, ${name}` : ''}! Your email has been verified and your Echo account is now active. You're all set to explore our amazing AI chat features.
      </p>
      
      <!-- Features/Benefits -->
      <div class="features-box">
        <h2 class="features-title">What's Next?</h2>
        <div class="features-list">
          <div class="feature-item">� Start chatting with Echo</div>
          <div class="feature-item">🤖 Explore AI-powered features</div>
          <div class="feature-item">🎉 Enjoy personalized recommendations</div>
          <div class="feature-item">📊 Track your interactions and progress</div>
        </div>
      </div>
      
      <!-- Call to action -->
      <div class="cta-container">
        <a href="#" class="cta-button">
          Text Echo Now! 🚀
        </a>
      </div>
      
      <!-- Additional message -->
      <p class="support-text">
        💡 Need help getting started? Our support team is here to assist you every step of the way. Simply reply to this email or contact us through our help center.
      </p>
      
      <!-- Closing -->
      <p class="closing">
        Happy Chatting!<br>
        — The Echo Team ❤️
      </p>
    </div>
  </div>
</body>
</html>
`;
