import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safely attempt to load the local config file without breaking Vite if it's missing (e.g. in Git/CI)
const configs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const localConfig: any = configs['../firebase-applet-config.json'] ? (configs['../firebase-applet-config.json'] as any).default : {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || localConfig.firestoreDatabaseId
};

export const hasFirebaseConfig = !!firebaseConfig.apiKey;

let app;
let dbExport: any;
let authExport: any;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  dbExport = getFirestore(app, firebaseConfig.firestoreDatabaseId || "ai-studio-bed587c9-5321-4301-89c5-07d4e2213990");
  authExport = getAuth(app);
} else {
  console.error("Firebase config is missing or incomplete. Please ensure environment variables are set in your deployment dashboard!");
  // Dummy objects so the app can mount and render a UI warning instead of a white screen
  dbExport = {} as any;
  authExport = {} as any;
}

export const db = dbExport;
export const auth = authExport;
