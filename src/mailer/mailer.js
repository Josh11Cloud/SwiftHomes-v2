// mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'swifthomes.mx@gmail.com',
    pass: 'khdk taib rbbm hjpd'
  }
});

export default transporter;