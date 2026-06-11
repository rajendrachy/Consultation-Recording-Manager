import nodemailer from 'nodemailer';

/**
 * Send an email using Nodemailer.
 * Falls back to console logging if SMTP environment variables are missing or incorrect.
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!isSmtpConfigured) {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text}`);
    if (options.html) {
      console.log(`HTML Body:\n${options.html}`);
    }
    console.log('=======================================================\n');
    return { mock: true, message: 'SMTP not configured, email printed to console.' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || `"CRM Support" <noreply@crm.com>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Nodemailer failed to send email. Falling back to console log:');
    console.error(error.message);
    
    console.log('\n=================== MOCK EMAIL FALLBACK ===================');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text}`);
    console.log('===========================================================\n');
    return { mock: true, error: error.message };
  }
};

export default sendEmail;
