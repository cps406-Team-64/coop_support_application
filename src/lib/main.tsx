import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvpWzC0gb0cshtvnaCYJFg7XwXRQ0PDJo",
  authDomain: "test-project-644e3.firebaseapp.com",
  projectId: "test-project-644e3",
  storageBucket: "test-project-644e3.firebasestorage.app",
  messagingSenderId: "747961223623",
  appId: "1:747961223623:web:156c1ddf8e93a86788b1e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

createRoot(document.getElementById("root")!).render(<App />);
