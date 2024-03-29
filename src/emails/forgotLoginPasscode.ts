const getForgetLoginPasscodeEmailTemplate = ({ one_time_password }: { one_time_password: string }) => `
  <div>
    <h1 style="text-align: center; color: #333; font-size: 2rem; margin: 20px 0; font-weight: 500; line-height: 1.2;">
      Reset Your Login Passcode</h1>

    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      Your one time password is <strong>${one_time_password}</strong></p>
    
    <a href="https://ogada-swift-banking.vercel.app/auth/reset-passcode?code=${one_time_password}" style="display: block; text-align: center; color: #fff; background-color: #333; padding: 20px 2rem; border-radius: 0.5rem; text-decoration: none; font-size: 1.2rem; margin-bottom: 1rem; font-weight: 400; line-height: 1.2; width: fit-content; margin: 0 auto;">
      Click here to reset your Login Passcode</a>
    
    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 40px; font-weight: 400; line-height: 1.2;">
      If you did not request a new Login Passcode, please ignore this email.</p>

    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      Thanks,<br />
      The OGADA SWIFT BANKING Team</p>
    
    <p style="text-align: center; color: #333; font-size: 1.2rem; margin-bottom: 20px; font-weight: 400; line-height: 1.2;">
      © ${new Date().getFullYear()} OGADA SWIFT BANKING. All rights reserved.</p>
  </div>
`;

export default getForgetLoginPasscodeEmailTemplate;
