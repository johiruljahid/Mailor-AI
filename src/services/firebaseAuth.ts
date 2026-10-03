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
import { GmailService } from './gmailService';
import { GoogleDriveService } from './googleDriveService';
import { GoogleSheetsService } from './googleSheetsService';
import { GoogleDocsService } from './googleDocsService';
import { GoogleCalendarService } from './googleCalendarService';

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

// Standard least-privilege Gmail scopes for reading inbox, sending replies, and thread marking
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// Google Drive scopes for reading knowledge base docs & sync
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Google Sheets scope for live activity reporting & knowledge tables
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

// Google Docs scope for reading & creating business knowledge documents
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/documents.readonly');

// Google Calendar scopes for scheduling client appointments & availability checking
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Force Google consent screen to ensure permissions are explicitly granted
googleProvider.setCustomParameters({
  prompt: 'consent select_account',
  access_type: 'offline'
});

// Restore token from localStorage/sessionStorage if previously granted
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('mailora_oauth_token') || sessionStorage.getItem('mailora_oauth_token');
  } catch {
    return null;
  }
};

const setStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem('mailora_oauth_token', token);
      sessionStorage.setItem('mailora_oauth_token', token);
    } else {
      localStorage.removeItem('mailora_oauth_token');
      sessionStorage.removeItem('mailora_oauth_token');
    }
  } catch {}
};

let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = getStoredToken();
  if (cachedAccessToken) {
    GmailService.setAccessToken(cachedAccessToken);
    GoogleDriveService.setAccessToken(cachedAccessToken);
    GoogleSheetsService.setAccessToken(cachedAccessToken);
    GoogleDocsService.setAccessToken(cachedAccessToken);
    GoogleCalendarService.setAccessToken(cachedAccessToken);
  }
} catch {}

let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) return () => {};

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const activeToken = cachedAccessToken || getStoredToken() || '';
      if (activeToken) {
        cachedAccessToken = activeToken;
        GmailService.setAccessToken(activeToken);
        GoogleDriveService.setAccessToken(activeToken);
        GoogleSheetsService.setAccessToken(activeToken);
        GoogleDocsService.setAccessToken(activeToken);
        GoogleCalendarService.setAccessToken(activeToken);
      }
      if (onAuthSuccess) onAuthSuccess(user, activeToken);
    } else {
      // Note: Do not destroy the server autopilot token on browser logout
      cachedAccessToken = null;
      GmailService.setAccessToken(null);
      GoogleDriveService.setAccessToken(null);
      GoogleSheetsService.setAccessToken(null);
      GoogleDocsService.setAccessToken(null);
      GoogleCalendarService.setAccessToken(null);
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
      setStoredToken(token);
      GmailService.setAccessToken(token);
      GoogleDriveService.setAccessToken(token);
      GoogleSheetsService.setAccessToken(token);
      GoogleDocsService.setAccessToken(token);
      GoogleCalendarService.setAccessToken(token);
    }

    return { user: result.user, accessToken: token || cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw new Error(error.message || 'Failed to authenticate with Google');
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken || getStoredToken();
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  setStoredToken(token);
  if (token) {
    GmailService.setAccessToken(token);
    GoogleDriveService.setAccessToken(token);
    GoogleSheetsService.setAccessToken(token);
    GoogleDocsService.setAccessToken(token);
    GoogleCalendarService.setAccessToken(token);
  } else {
    GmailService.setAccessToken(null);
    GoogleDriveService.setAccessToken(null);
    GoogleSheetsService.setAccessToken(null);
    GoogleDocsService.setAccessToken(null);
    GoogleCalendarService.setAccessToken(null);
  }
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
  try {
    sessionStorage.removeItem('mailora_oauth_token');
  } catch {}
  GmailService.setAccessToken(null);
  GoogleDriveService.setAccessToken(null);
  GoogleSheetsService.setAccessToken(null);
  if (auth) {
    await signOut(auth);
  }
};
