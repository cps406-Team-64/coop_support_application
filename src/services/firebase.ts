// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcd0S2M58jgEit4YSMjZAErhIWKe7U3sw",
  authDomain: "co-op-application-platform.firebaseapp.com",
  projectId: "co-op-application-platform",
  storageBucket: "co-op-application-platform.firebasestorage.app",
  messagingSenderId: "692333236358",
  appId: "1:692333236358:web:d60e45b3d7a300114ac107"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);