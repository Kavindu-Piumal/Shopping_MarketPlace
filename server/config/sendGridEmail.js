import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Check for API key and set it
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not configured in environment variables');
} else {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid API key configured successfully');
  } catch (error) {
    console.error('❌ Error setting SendGrid API key:', error);
  }
}

/**
 * Send an email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.sendTo - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<boolean|Object>} - Success status or response data
 */
const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    console.log(`📧 Attempting to send email to: ${sendTo}`);
    console.log(`📧 Subject: ${subject}`);

    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not configured in environment variables');
      return false;
    }

    // Use your actual Gmail address that you can verify
    const fromEmail = process.env.FROM_EMAIL || 'kavindup040@gmail.com';
    const fromName = process.env.FROM_NAME || 'EcoMarket';

    console.log(`📧 Sending from: ${fromName} <${fromEmail}>`);

    const msg = {
      to: sendTo,
      from: `${fromName} <${fromEmail}>`, // Use your verified Gmail address
      subject: subject,
      html: html,
    };

    console.log('📧 Email message prepared:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('✅ Response status:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('❌ SendGrid Error Details:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status Code:', error.response?.status);

    if (error.response && error.response.body) {
      console.error('   Response Body:', JSON.stringify(error.response.body, null, 2));
    }

    // Check if we're in development mode - return false to trigger OTP in response
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_OTP_IN_RESPONSE === 'true') {
      console.log('⚠️ In development mode - email sending failed, will return OTP in API response');
      return false;
    }

    return false;
  }
};

export default sendEmail;
