// Real Firebase setup
// Using the project configuration provided by the user
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD8ALSu_bbeZtAO91zewWN0Z0DC2pXVBkA",
  authDomain: "kinotap-d7e72.firebaseapp.com",
  projectId: "kinotap-d7e72",
  storageBucket: "kinotap-d7e72.firebasestorage.app",
  messagingSenderId: "515168984174",
  appId: "1:515168984174:web:8647cbd26a4a663d805a7f",
  measurementId: "G-P7HYF0Y03D"
};

const app = initializeApp(firebaseConfig);
try {
  // analytics can throw in non-browser envs; keep it in try/catch
  getAnalytics(app);
} catch (e) {
  // ignore analytics init errors (e.g., SSR/local env)
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Re-export wrappers to keep the same API as the previous mock
export const signInWithPopup = (a: any, p: any) => firebaseSignInWithPopup(a, p);
export const signInWithEmailAndPassword = (a: any, e: string, p: string) => firebaseSignInWithEmailAndPassword(a, e, p);
export const signOut = (a: any) => firebaseSignOut(a);
export const onAuthStateChanged = (a: any, cb: (user: any) => void) => firebaseOnAuthStateChanged(a, cb);

// Keep developer helper for convenience only if needed (deprecated in prod)
export const signInWithPopupAsAdmin = async (a: any, p: any) => {
  // This helper attempts a normal Google popup; if it fails (popup blocked) fall back to signing in
  // with a test admin via email/password is not available here — so we keep it as a convenience
  // that attempts the normal popup and leaves the rest to Firebase.
  return firebaseSignInWithPopup(a, p);
};

