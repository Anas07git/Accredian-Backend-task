const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/referral', async (req, res) => {
  const { name, email, phone, referredBy } = req.body;

  // Basic validation
  if (!name || !email || !phone || !referredBy) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Save referral data to the database
    const referral = await prisma.referral.create({
      data: { name, email, phone, referredBy },
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: referral.email,
      subject: 'Referral Confirmation',
      text: `Hi ${referral.name},\n\nThank you for your referral.\n\nBest Regards`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your referral' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
