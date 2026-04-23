import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigData from '../firebase-applet-config.json';

// Use environment variables if available (for Vercel), otherwise fallback to config file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || firebaseConfigData.firestoreDatabaseId
};

if (!firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check environment variables or firebase-applet-config.json');
}

// Debug log for production (shows only first and last 4 chars for verification)
if (firebaseConfig.apiKey) {
  const start = firebaseConfig.apiKey.substring(0, 4);
  const end = firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length - 4);
  console.log(`Firebase API Key status: Found (${start}...${end})`);
  console.log(`Firestore Database ID: ${firebaseConfig.firestoreDatabaseId}`);
  console.log(`Current Domain: ${window.location.hostname}`);
} else {
  console.log('Firebase API Key status: Missing');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
