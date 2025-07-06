import sendEmail from '../utils/sendEmail.js';

export const handleContactForm = async (req, res) => {
  try {
    const { name, email, userType, message } = req.body;
    if (!name || !email || !userType || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>User Type:</strong> ${userType}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `;
    await sendEmail({
      to: 'kavindup040@gmail.com',
      subject: 'New Contact Form Submission',
      html,
      replyTo: email
    });
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
};
