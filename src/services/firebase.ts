// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDokaQwX5K-yW0gBCn-zH6OOkwhfvIWYPc",
  authDomain: "co-op-support-application.firebaseapp.com",
  projectId: "co-op-support-application",
  storageBucket: "co-op-support-application.firebasestorage.app",
  messagingSenderId: "1098502627837",
  appId: "1:1098502627837:web:7f0ad4a7077d0d09ac3994"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);