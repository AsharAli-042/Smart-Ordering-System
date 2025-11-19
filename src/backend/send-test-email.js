// node send-test-email.js (type: module)
import { getTransporter } from "./utils/mailer.js";

async function run() {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"Smart Ordering" <${process.env.SMTP_USER}>`,
      to: "your-test-email@gmail.com",
      subject: "Test email from Smart Ordering",
      text: "This is a test",
      html: "<b>This is a test</b>"
    });
    console.log("sent:", info);
  } catch (e) {
    console.error("send failed:", e && e.message ? e.message : e);
  }
}
run();
