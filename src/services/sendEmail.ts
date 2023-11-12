import nodemailer from "nodemailer";

type TOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

const sendEmail = async (options: TOptions) => {
  if (process.env.NODE_ENV === "test") return;

  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    // host: process.env.MAIL_HOST,
    // port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_OPTIONS_FROM,
    subject: `OGADA SWIFT BANKING - ${options.subject}!`,
    ...options,
  };

  await transport.sendMail(mailOptions);
};

export default sendEmail;
