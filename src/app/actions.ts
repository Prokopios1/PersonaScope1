
'use server';

import nodemailer from 'nodemailer';
import type { TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';
import { db } from '@/lib/firebase'; // db can be undefined
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SendResultsPayload {
  name: string;
  scores: Record<TraitKey, number>;
  locale: Locale;
}

export async function sendResultsToAdmin(payload: SendResultsPayload) {
  console.log("Server Action: sendResultsToAdmin called with payload:", payload);

  const { name: userName, scores, locale } = payload;
  const adminEmail = "marketingopen10@gmail.com";

  let resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n`;
  for (const trait in scores) {
    resultsText += `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${scores[trait as TraitKey]}/20\n`;
  }

  let dbSuccess = false;
  let dbMessage = "Failed to save results to database.";

  try {
    if (!db) {
      // This check is crucial if firebase.ts can result in an undefined db
      throw new Error("Firebase not initialized (db instance is undefined). Check server logs for missing/incorrect Firebase environment variables (e.g., FIREBASE_PROJECT_ID, FIREBASE_API_KEY) or initialization errors.");
    }

    // If db is defined, we expect it to be a valid Firestore instance.
    // The collection() and addDoc() calls will throw if db is not valid or if there are permission issues.
    const assessmentsCollectionRef = collection(db, 'assessments');
    await addDoc(assessmentsCollectionRef, {
      name: userName,
      scores: scores,
      locale: locale,
      createdAt: serverTimestamp(),
    });
    dbSuccess = true;
    dbMessage = "Results successfully saved to database.";
    console.log("Assessment results saved to Firestore for user:", userName);
  } catch (error: any) {
    console.error("Error saving assessment to Firestore action:", error); // Log the actual error
    dbMessage = `Error saving to DB: ${error.message || "Unknown Firestore error"}. Please ensure Firebase is configured correctly with all environment variables and Firestore rules allow writes.`;
    // dbSuccess remains false
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

      console.log(`Email successfully sent to ${adminEmail}`);
      return { success: dbSuccess, message: `${dbMessage} Email also sent to admin.` };

    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: dbSuccess, message: `${dbMessage} However, failed to send email to admin.` };
    }
  } else {
    console.log(`MOCK: Email (for user ${userName}) would be sent to ${adminEmail} with content:\n${resultsText}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: dbSuccess, message: `${dbMessage} Mock email noted.` };
  }
}
