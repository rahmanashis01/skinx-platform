import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyA7DFcRzUgJbwdtiD_LIgVONvW1Dk7dqGA",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skinx-e4206.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skinx-e4206",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "skinx-e4206.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "917004493966",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:917004493966:web:c3cabe7cc90e36dda5d5df",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MRJH5PPMB9",
};

const app = initializeApp(firebaseConfig);
