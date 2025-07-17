// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Add this import

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOVpBCSsEKUgvNuIAf0FCPE23Q8JdXW8g",
  authDomain: "licc-e4dd5.firebaseapp.com",
  projectId: "licc-e4dd5",
  storageBucket: "licc-e4dd5.firebasestorage.app",
  messagingSenderId: "787250006477",
  appId: "1:787250006477:web:e2c58dd0fdd16218e45c84",
  measurementId: "G-6L9EZ57C60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // Add auth export