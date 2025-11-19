// src/backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ensure .env loaded (safe even if your server already loads dotenv)

let transporter = null;

/**
 * Create (or return cached) transporter.
 * - If SMTP_* env vars are present, use them.
 * - Otherwise, fall back to Nodemailer/Ethereal test account (dev only).
 */
export async function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE // optional: "true" or "false"
  } = process.env;

  // Debug: show presence of values (don't log secrets)
  console.log("Mailer: env present:", {
    SMTP_HOST: !!SMTP_HOST,
    SMTP_PORT: !!SMTP_PORT,
    SMTP_USER: !!SMTP_USER,
    SMTP_PASS: !!SMTP_PASS,
  });

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    // Use provided SMTP provider (Mailtrap, Gmail, SendGrid SMTP, etc)
    const portNum = Number(SMTP_PORT) || 587;
    const secure = (typeof SMTP_SECURE !== "undefined")
      ? SMTP_SECURE === "true" || SMTP_SECURE === "1"
      : portNum === 465; // 465 commonly means secure

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: portNum,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: false }, // helpful for dev; remove in locked-down prod if not needed
    });

    // verify and log
    try {
      await transporter.verify();
      console.log("Mailer: transporter verified (using SMTP_HOST).");
    } catch (err) {
      console.error("Mailer: transporter verify failed:", err && err.message ? err.message : err);
      // still return transporter — sendMail will surface errors if any
    }

    // mark that this is a "real" SMTP transporter
    transporter._isEthereal = false;
    return transporter;
  }

  // If no SMTP env provided, fall back to Ethereal (nodemailer test account)
  console.warn("Mailer: SMTP config missing — falling back to Ethereal test account for development.");
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  try {
    await transporter.verify();
    console.log("Mailer: transporter verified (Ethereal test account).");
  } catch (err) {
    console.error("Mailer: Ethereal verify failed:", err && err.message ? err.message : err);
  }

  transporter._isEthereal = true;
  transporter._testAccount = testAccount;
  return transporter;
}

/**
 * Send email (async). Will create transporter lazily.
 * logs preview URL when using Ethereal.
 */
export async function sendEmail({ to, subject, html, text }) {
  const t = await getTransporter();
  if (!t) throw new Error("Mailer: transporter unavailable");

  console.log(`Mailer: sending email to=${to} subject=${subject}`);

  try {
    const fromAddress = process.env.MAIL_FROM || (process.env.SMTP_USER ? `"Smart Ordering" <${process.env.SMTP_USER}>` : `"Smart Ordering" <no-reply@example.com>`);

    const info = await t.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text,
    });

    console.log("Mailer: sendMail success:", info && (info.messageId || info.response));

    // If using Ethereal (dev), print preview URL
    if (t._isEthereal) {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log("Mailer: Ethereal preview URL:", preview);
    }

    return info;
  } catch (err) {
    console.error("Mailer: sendMail error:", err && err.message ? err.message : err);
    throw err;
  }
}
