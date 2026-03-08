import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4NEjj2Xl0sDVnaUQ3R0cOTkJz9aAIfY0",
  authDomain: "co-op-application.firebaseapp.com",
  projectId: "co-op-application",
  storageBucket: "co-op-application.firebasestorage.app",
  messagingSenderId: "826417597194",
  appId: "1:826417597194:web:1ca1759888c5068c8548f3",
  measurementId: "G-21G3FVGC1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

createRoot(document.getElementById("root")!).render(<App />);
