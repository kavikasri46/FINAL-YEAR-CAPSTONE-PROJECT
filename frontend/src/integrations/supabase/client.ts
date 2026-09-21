// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBADYKDhcK3pjEj8ckLKG4y_uM612Wd6WI",
  authDomain: "student-dropout-predction.firebaseapp.com",
  projectId: "student-dropout-predction",
  storageBucket: "student-dropout-predction.firebasestorage.app",
  messagingSenderId: "343246960282",
  appId: "1:343246960282:web:269bd9d98ca5e5ffe7d123",
  measurementId: "G-3CE4G7B7JD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For backward compatibility, export a combined object
export const firebase = {
  auth,
  db,
  storage,
  app
};