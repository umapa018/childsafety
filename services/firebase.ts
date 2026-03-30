import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyDJh0TupmtSjiOubqeG49_G8jeQuw-NO0A',
  authDomain: 'child-safety-c8d17.firebaseapp.com',
  databaseURL: 'https://child-safety-c8d17-default-rtdb.firebaseio.com',
  projectId: 'child-safety-c8d17',
  storageBucket: 'child-safety-c8d17.firebasestorage.app',
  messagingSenderId: '384083933950',
  appId: '1:384083933950:android:b18056c8b29324deefc3af',
};

// Prevent re-initialization on hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
