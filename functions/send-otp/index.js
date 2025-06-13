import { Client, Databases, Query } from 'node-appwrite';
import { createTransport } from 'nodemailer';

module.exports = async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    if (!req.body || !req.body.email) {
      return res.json({ success: false, message: 'Email is required' }, 400);
    }

    const { email } = JSON.parse(req.body);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await databases.createDocument(
      process.env.OTP_DATABASE_ID,
      process.env.OTP_COLLECTION_ID,
      'unique()',
      { email, otp, expiresAt, used: false }
    );

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP Code',
      html: `Your OTP is: <strong>${otp}</strong> (valid for 10 minutes)`
    });

    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    error(err.message);
    return res.json({ success: false, message: 'Failed to send OTP' }, 500);
  }
};