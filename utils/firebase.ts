// utils/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth
} from "firebase/auth";
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Type-safe Firebase configuration interface
interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
}

// Firebase configuration using environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
} as const;

// Validate configuration
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || value === 'undefined')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('Environment variables check:');
  console.error('EXPO_PUBLIC_FIREBASE_API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Found' : 'Missing');
  console.error('EXPO_PUBLIC_FIREBASE_APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'Found' : 'Missing');
  
  throw new Error(`Firebase configuration missing: ${missingKeys.join(', ')}`);
}

// Initialize Firebase app
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with proper persistence
let auth: Auth;

try {
  if (Platform.OS === 'web') {
    // For web, use default auth (localStorage persistence)
    auth = getAuth(app);
  } else {
    // For React Native, use AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  console.log('Firebase Auth initialized successfully with persistence');
} catch (error: any) {
  // If already initialized, get existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('Using existing Firebase Auth instance');
  } else {
    console.error('Failed to initialize Firebase Auth:', error);
    throw error;
  }
}

// Initialize Firestore
const db: Firestore = getFirestore(app);

console.log('Firebase initialized successfully');

// Export instances
export { app, auth, db };
export default app;

// Type exports
export type { FirebaseApp } from "firebase/app";
export type { Auth } from "firebase/auth";
export type { Firestore } from "firebase/firestore";

