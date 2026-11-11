import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore database ID. Leave unset for the standard "(default)" database.
const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)";

function createDb(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        ignoreUndefinedProperties: true,
        // Plain HTTP long-polling instead of a streaming WebChannel. Streams are
        // often cut by browser extensions, VPNs, antivirus and proxies, which
        // shows up as repeated "WebChannelConnection ... transport errored".
        experimentalForceLongPolling: true,
      },
      databaseId,
    );
  } catch {
    // Already initialised (hot reload).
    return getFirestore(app, databaseId);
  }
}

export const db = createDb();
