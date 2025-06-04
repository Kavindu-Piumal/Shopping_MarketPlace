import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if(!process.env.RESEND_API){
    console.log("Provide RESEND_API in side the .env file")
}

const resend = new Resend(process.env.RESEND_API);

// Function to send an email using Resend

const sendEmail=async ({sendTo,subject,html})=>{
    try{
        const{data,error}=await resend.emails.send({
            from:'ABC <onboarding@resend.dev>',
            to:sendTo,
            subject:subject,
            html:html,
    });

    if(error){
        return console.error("Error sending email",error.message)};

    return data;

    }catch(error){
        console.log("Error sending email",error.message);
    }
  

}

export default sendEmail;

