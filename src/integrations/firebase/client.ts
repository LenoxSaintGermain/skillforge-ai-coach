/**
 * Firebase Client Integration for GCP Migration
 * 
 * This module initializes Firebase Auth for the GCP deployment.
 * To switch from Supabase to Firebase, set VITE_AUTH_PROVIDER=firebase in .env
 * 
 * Required env vars:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser,
    type Auth,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let app: ReturnType<typeof initializeApp> | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase only when VITE_AUTH_PROVIDER=firebase
 */
export function getFirebaseAuth(): Auth {
    if (!auth) {
        if (!firebaseConfig.apiKey) {
            throw new Error(
                'Firebase is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID in your .env file.'
            );
        }
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    }
    return auth;
}

export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
};

export type { FirebaseUser };
