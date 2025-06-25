
'use server';

import nodemailer from 'nodemailer';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';
import { db, app } from '@/lib/firebase'; // Import app, db and app can be undefined
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SendResultsPayload {
  name: string;
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  const { name: userName, scores, locale } = payload;
  const adminEmail = "marketingopen10@gmail.com";
  const configuredProjectId = process.env.FIREBASE_PROJECT_ID || 'NOT_CONFIGURED';

  let dbSuccess = false;
  let dbMessage = '';

  if (!db || !app) {
    dbMessage = `Database connection failed. Project ID appears to be '${configuredProjectId}'. Please ensure all FIREBASE_... variables are correct in your .env.local file and that the server has been restarted.`;
    console.error(`❌ DB Write Failure: Firebase not initialized. Configured Project ID: '${configuredProjectId}'. Check server logs.`);
  } else {
    const currentProjectId = app.options.projectId;
    console.log(`Attempting to save assessment to Firestore project: '${currentProjectId}' for user:`, userName);
    try {
      await addDoc(collection(db, 'assessments'), {
        name: userName,
        scores: scores,
        locale: locale,
        createdAt: serverTimestamp(),
      });
      dbSuccess = true;
      dbMessage = `✅ Results successfully saved to database project: '${currentProjectId}'.`;
      console.log(dbMessage);
    } catch (error: any) {
      dbMessage = `Error saving to DB project '${currentProjectId}': ${error.message || "Unknown Firestore error"}. Check Firestore rules in the Firebase console.`;
      console.error("❌ Error saving assessment to Firestore:", error);
    }
  }

  let resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n`;
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
        subject: `New PersonaScope Mini-IPIP Assessment: ${userName}`,
        text: resultsText,
        html: `<p>User Name: ${userName}</p><p>Locale: ${locale}</p><h3>Assessment Results (Mini-IPIP):</h3><pre>${resultsText.split('\n\n')[1]}</pre>`,
      });

      console.log(`✉️ Email successfully sent to ${adminEmail}`);
      return { success: dbSuccess, message: `${dbMessage} Email also sent to admin.` };

    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return { success: dbSuccess, message: `${dbMessage} However, failed to send email to admin.` };
    }
  } else {
    console.log(`✉️ MOCK: Email (for user ${userName}) would be sent to ${adminEmail}`);
    // Simulate some delay for mock email
    await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
    return { success: dbSuccess, message: `${dbMessage}` };
  }
}
