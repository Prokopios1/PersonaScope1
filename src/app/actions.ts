
'use server';

import nodemailer from 'nodemailer';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';

interface SendResultsPayload {
  name: string; // Changed from email to name
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  console.log("Server Action: sendResultsToAdmin called with payload:", payload);

  const { name: userName, scores, locale } = payload; // Changed from email to userName for clarity
  const adminEmail = "marketingopen10@gmail.com"; 

  let resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n`; // Changed from User Email, added Mini-IPIP
  for (const trait in scores) {
    resultsText += `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${scores[trait as TraitKey]}/20\n`;
  }
  
  if (process.env.NODE_ENV === 'development_email_mock') { 
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST, 
        port: parseInt(process.env.MAIL_PORT || "587"), 
        secure: (process.env.MAIL_PORT === "465"), 
        auth: {
          user: process.env.MAIL_USER, 
          pass: process.env.MAIL_PASS, 
        },
      });

      await transporter.sendMail({
        from: `"PersonaScope App" <${process.env.MAIL_FROM || 'noreply@example.com'}>`,
        to: adminEmail,
        subject: `New PersonaScope Mini-IPIP Assessment: ${userName}`, // Updated subject
        text: resultsText,
        html: `<p>User Name: ${userName}</p><p>Locale: ${locale}</p><h3>Assessment Results (Mini-IPIP):</h3><pre>${resultsText.split('\n\n')[1]}</pre>`, // Updated HTML content
      });
      
      console.log(`Email successfully sent to ${adminEmail}`);
      return { success: true, message: "Results emailed to admin." };

    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, message: "Failed to send email to admin." };
    }
  } else {
    console.log(`MOCK: Email (for user ${userName}) would be sent to ${adminEmail} with content:\n${resultsText}`); // Updated log
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Results noted (mock email)." };
  }
}
