import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if(!process.env.RESEND_API){
    console.log("Provide RESEND_API in side the .env file")
}

const resend = new Resend(process.env.RESEND_API);

// Function to send an email using Resend
const sendEmail = async ({sendTo, subject, html}) => {
    try{
        console.log(`📧 Attempting to send email to: ${sendTo}`);
        console.log(`📧 Subject: ${subject}`);

        if (!process.env.RESEND_API) {
            console.error('❌ RESEND_API not configured in environment variables');
            return false;
        }

        // Check if we're in test mode (no verified domain)
        const fromEmail = process.env.VERIFIED_EMAIL || 'onboarding@resend.dev';
        const fromName = process.env.FROM_NAME || 'ABC';
        const fromAddress = `${fromName} <${fromEmail}>`;

        // In test mode, log a warning that we can only send to verified emails
        if (fromEmail === 'onboarding@resend.dev') {
            console.warn('��️ Using Resend test mode - emails can only be sent to verified email addresses');
            console.warn('⚠️ To send to any recipient, verify a domain at resend.com/domains');
        }

        const {data, error} = await resend.emails.send({
            from: fromAddress,
            to: sendTo,
            subject: subject,
            html: html,
        });

        if(error){
            console.error("❌ Error sending email:", error);
            return false;
        }

        console.log("✅ Email sent successfully:", data);
        return data;

    }catch(error){
        console.error("❌ Exception while sending email:", error.message);
        return false;
    }
}

export default sendEmail;
