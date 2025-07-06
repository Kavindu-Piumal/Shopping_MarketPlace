import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.FROM_EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
    replyTo
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
