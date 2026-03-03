import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBSJEFsBKGwd3Q2LRprWr7TK32n_4ODBIk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartcal-ai.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bro-app-234b7",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bro-app-234b7.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "219481622173",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:219481622173:web:3d8c78497c9a084af9b674"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
