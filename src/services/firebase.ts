// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAG-p4gv-t9crk635MTcQYkemKfvfDuW-Y",
  authDomain: "test-570bf.firebaseapp.com",
  projectId: "test-570bf",
  storageBucket: "test-570bf.firebasestorage.app",
  messagingSenderId: "879474221729",
  appId: "1:879474221729:web:def07b32878587f54c86e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;