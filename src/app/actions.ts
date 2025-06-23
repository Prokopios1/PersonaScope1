
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
  console.log("\n\n--- Server Action: sendResultsToAdmin TRIGGERED ---");
  console.log("Payload received:", JSON.stringify(payload));

  const { name: userName, scores, locale } = payload;
  const adminEmail = "marketingopen10@gmail.com";
  const projectId = app?.options.projectId || 'UNKNOWN (check .env.local)';

  let resultsText = `User Name: ${userName}\nLocale: ${locale}\n\nAssessment Results (Mini-IPIP):\n`;
  for (const trait in scores) {
    resultsText += `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${scores[trait as TraitKey]}/20\n`;
  }

  let dbSuccess = false;
  let dbMessage = `Failed to save results to database project: ${projectId}.`;

  if (!db || !app) {
    dbMessage = `Firebase not initialized. Cannot connect to project '${projectId}'. Check server logs for missing/incorrect Firebase environment variables (e.g., FIREBASE_PROJECT_ID, FIREBASE_API_KEY).`;
    console.error("❌ sendResultsToAdmin Error:", dbMessage);
  } else {
    const currentProjectId = app.options.projectId;
    console.log(`Attempting to save assessment to Firestore project: '${currentProjectId}' for user:`, userName);
    try {
      const assessmentsCollectionRef = collection(db, 'assessments');
      await addDoc(assessmentsCollectionRef, {
        name: userName,
        scores: scores,
        locale: locale,
        createdAt: serverTimestamp(),
      });
      dbSuccess = true;
      dbMessage = `✅ Results successfully saved to database project: '${currentProjectId}'.`;
      console.log("✅ Assessment results saved to Firestore for user:", userName);
    } catch (error: any) {
      console.error("❌ Error saving assessment to Firestore in action:", error.message, error.stack);
      dbMessage = `Error saving to DB project '${currentProjectId}': ${error.message || "Unknown Firestore error"}. Ensure Firestore is enabled, check environment variables, and verify Firestore rules allow writes.`;
    }
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
    return { success: dbSuccess, message: `${dbMessage} Mock email noted.` };
  }
}
