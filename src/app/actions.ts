
'use server';

import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';

interface SendResultsPayload {
  name: string;
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  const { name: userName, scores, locale } = payload;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'undefined';

  // --- Database Operation ---
  if (!db) {
    const errorMessage = `Firebase not initialized (db instance is undefined). Cannot save to database. Project ID is '${projectId}'. Check server logs for configuration errors.`;
    console.error(`❌ Firestore Error: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  
  try {
    const docRef = await addDoc(collection(db, "assessments"), {
      name: userName,
      scores: scores,
      locale: locale,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Assessment results saved to Firestore with document ID: ${docRef.id} in project ${projectId}`);
  } catch (error) {
    console.error("❌ Error writing assessment to Firestore: ", error);
    const errorMessage = `Failed to save results to database for project '${projectId}'. Please check server logs for details.`;
    return { success: false, message: errorMessage };
  }


  // --- Email Operation (runs only if DB write is successful) ---
  const adminEmail = "marketingopen10@gmail.com";
  const resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n${TRAITS.map(
    (trait) =>
      `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${
        scores[trait as TraitKey]
      }/20`
  ).join('\n')}`;

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
      return { success: true, message: `Results for ${userName} saved to project '${projectId}' and an email was sent to the administrator.` };

    } catch (error) {
      console.error("❌ Failed to send email:", error);
      // DB write was successful, but email failed.
      return { success: false, message: `Results saved to database, but there was an error sending the results email.` };
    }
  } else {
    // This is the mock environment
    console.log(`✉️ MOCK: Email (for user ${userName}) would be sent to ${adminEmail}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: `Results for ${userName} saved to project '${projectId}'. Email sending is mocked.` };
  }
}

const TRAITS: TraitKey[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
