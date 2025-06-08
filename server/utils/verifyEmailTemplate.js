const verifyEmailTemplate = ({name,url}) => {
    return `<p>Hi ${name},</p>
    <p>Thank you for signing up! Please click the link below to verify your email address:</p>
    <a href="${url}" style="color:white;background:blue;margin-top:10px">Verify Email</a>`
}

export default verifyEmailTemplate;
