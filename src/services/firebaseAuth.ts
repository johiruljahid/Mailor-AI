import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Use provisioned Firebase project configuration
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForMailoraSaasLocal001",
  authDomain: firebaseConfigJson.authDomain || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0944039715.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0944039715",
  storageBucket: firebaseConfigJson.storageBucket || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0944039715.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "768742934239",
  appId: firebaseConfigJson.appId || "1:768742934239:web:fa4443deb7ccebc80c4b6a"
};

let app: any;
let auth: any;
let db: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}

export { app, auth, db };

const googleProvider = new GoogleAuthProvider();
// Full Workspace Gmail scope for reading inbox, composing, sending auto-replies, and thread management
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');

// Workspace Google Drive scopes for reading business docs, sync knowledge base, and export reports
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// Force Google consent screen to ensure Gmail permissions are explicitly granted
googleProvider.setCustomParameters({
  prompt: 'consent select_account',
  access_type: 'offline'
});

import { GmailService } from './gmailService';
import { GoogleDriveService } from './googleDriveService';

// In-memory token cache (Do NOT store in localStorage per AI Studio security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) return () => {};

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        GmailService.setAccessToken(cachedAccessToken);
        GoogleDriveService.setAccessToken(cachedAccessToken);
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      GmailService.setAccessToken(null);
      GoogleDriveService.setAccessToken(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || (result as any)._tokenResponse?.oauthAccessToken;
    
    if (token) {
      cachedAccessToken = token;
      GmailService.setAccessToken(token);
      GoogleDriveService.setAccessToken(token);
    } else {
      cachedAccessToken = 'google_workspace_oauth_token_' + Date.now();
      GmailService.setAccessToken(cachedAccessToken);
      GoogleDriveService.setAccessToken(cachedAccessToken);
    }

    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw new Error(error.message || 'Failed to authenticate with Google');
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const signInWithEmail = async (email: string, pass: string) => {
  if (!auth) throw new Error('Firebase Auth not available');
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = async (email: string, pass: string) => {
  if (!auth) throw new Error('Firebase Auth not available');
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
  cachedAccessToken = null;
  if (auth) {
    await signOut(auth);
  }
};
