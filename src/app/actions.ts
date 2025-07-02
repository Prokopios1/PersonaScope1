
'use server';

import nodemailer from 'nodemailer';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';

interface SendResultsPayload {
  name: string;
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  const { name: userName, scores, locale } = payload;
  const adminEmail = "marketingopen10@gmail.com";

  const resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n${TRAITS.map(
    (trait) =>
      `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${
        scores[trait as TraitKey]
      }/20`
  ).join('\n')}`;

  // The database write operation has been removed as requested.
  // The function will now only handle email notifications.

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
        subject: `New PersonaScope Mini-IPIP Assessment: ${userName}`,
        text: resultsText,
        html: `<p>User Name: ${userName}</p><p>Locale: ${locale}</p><h3>Assessment Results (Mini-IPIP):</h3><pre>${resultsText.split('\n\n')[1]}</pre>`,
      });

      console.log(`✉️ Email successfully sent to ${adminEmail}`);
      return { success: true, message: `An email with the results has been sent to the administrator.` };

    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return { success: false, message: `There was an error sending the results email.` };
    }
  } else {
    console.log(`✉️ MOCK: Email (for user ${userName}) would be sent to ${adminEmail}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: `Assessment for ${userName} noted. Email sending is mocked in this environment.` };
  }
}

const TRAITS: TraitKey[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
