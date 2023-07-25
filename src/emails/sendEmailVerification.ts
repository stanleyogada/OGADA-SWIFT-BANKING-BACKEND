const getSendEmailVerificationEmailTemplate = ({ one_time_password }: { one_time_password: string }) => `
  <div>
    <h1 style="text-align: center; color: #333; font-size: 2rem; margin: 20px 0; font-weight: 500; line-height: 1.2;">
      Verify Your Email Address</h1>

    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      Your one time password is <strong>${one_time_password}</strong></p>
    
    <a href="https://opay-demo-peach.vercel.app/confirm-email-verification/${one_time_password}" style="display: block; text-align: center; color: #fff; background-color: #333; padding: 20px 2rem; border-radius: 0.5rem; text-decoration: none; font-size: 1.2rem; margin-bottom: 1rem; font-weight: 400; line-height: 1.2; width: fit-content; margin: 0 auto;">
     Click here to verify your email address</a>
    
    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 40px; font-weight: 400; line-height: 1.2;">
      If you did not request a new Login Passcode, please ignore this email.</p>

    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      Thanks,<br />
      The OPay DEMO Team</p>
    
    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      © 2023 OPay DEMO. All rights reserved.</p>
  </div>
`;

export default getSendEmailVerificationEmailTemplate;
