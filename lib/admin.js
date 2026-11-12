import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured.");
  initializeApp({ credential: cert(JSON.parse(raw)) });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export { FieldValue };
