'use server';

import nodemailer from 'nodemailer';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';
// This is a mock. In a real app, use proper configuration for email.
// Ensure environment variables are set for MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS

interface SendResultsPayload {
  email: string;
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  console.log("Server Action: sendResultsToAdmin called with payload:", payload);

  const { email: userEmail, scores, locale } = payload;
  const adminEmail = "marketingopen10@gmail.com"; // Hardcoded admin email

  // Constructing the email content
  let resultsText = `User Email: ${userEmail}\nLocale: ${locale}\n\nAssessment Results:\n`;
  for (const trait in scores) {
    resultsText += `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${scores[trait as TraitKey]}/20\n`;
  }
  
  // Basic email sending setup (mocked - replace with actual SMTP or email service)
  // This part is illustrative and will likely not work without proper setup.
  if (process.env.NODE_ENV === 'development_email_mock') { // Change this condition to enable actual sending
    try {
      // Example using Nodemailer - requires setup
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST, // e.g., 'smtp.example.com'
        port: parseInt(process.env.MAIL_PORT || "587"), // e.g., 587 or 465
        secure: (process.env.MAIL_PORT === "465"), // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER, // your email user
          pass: process.env.MAIL_PASS, // your email password
        },
      });

      await transporter.sendMail({
        from: `"PersonaScope App" <${process.env.MAIL_FROM || 'noreply@example.com'}>`,
        to: adminEmail,
        subject: `New PersonaScope Assessment: ${userEmail}`,
        text: resultsText,
        html: `<p>User Email: ${userEmail}</p><p>Locale: ${locale}</p><h3>Assessment Results:</h3><pre>${resultsText.split('\n\n')[1]}</pre>`,
      });
      
      console.log(`Email successfully sent to ${adminEmail}`);
      return { success: true, message: "Results emailed to admin." };

    } catch (error) {
      console.error("Failed to send email:", error);
      // In a real app, you might throw an error or return a more detailed error object
      // For now, we'll just log it and return success:false
      // throw new Error("Failed to send email.");
      return { success: false, message: "Failed to send email to admin." };
    }
  } else {
    console.log(`MOCK: Email would be sent to ${adminEmail} with content:\n${resultsText}`);
    // Simulate a delay as if an email was sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Results noted (mock email)." };
  }
}
