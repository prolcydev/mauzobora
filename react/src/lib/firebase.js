import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDtQdHIWjX9xI_IjyAtcWllGo7c2F0cjpo",
  authDomain: "mauzobora-a1684.firebaseapp.com",
  projectId: "mauzobora-a1684",
  storageBucket: "mauzobora-a1684.firebasestorage.app",
  messagingSenderId: "852679949307",
  appId: "1:852679949307:web:0d6593f4261cd864ba295e",
  measurementId: "G-H53R2Z5WVS"
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

let dbInstance;
try {
  dbInstance = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch {
  dbInstance = getFirestore(firebaseApp);
}
export const db = dbInstance;

if (typeof window !== 'undefined') {
  isSupported().then(ok => { if (ok) getAnalytics(firebaseApp); }).catch(() => {});
}
