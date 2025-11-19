// node supports import if type: module; otherwise convert to require
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // adjust path

import { getTransporter } from './utils/mailer.js';

(async () => {
  try {
    console.log('ENV SMTP_HOST:', process.env.SMTP_HOST);
    const t = getTransporter(); // will throw if env missing
    const info = await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: 'your-personal-test@gmail.com',
      subject: 'Test email from Smart Ordering',
      text: 'Hello — test email.'
    });
    console.log('sendMail result:', info);
    process.exit(0);
  } catch (err) {
    console.error('mailer test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
