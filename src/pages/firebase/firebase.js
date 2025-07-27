// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5bZj6eiY9e3iCV2AAHnYnsFwbCprivg8",
  authDomain: "shpere-v2.firebaseapp.com",
  projectId: "shpere-v2",
  storageBucket: "shpere-v2.firebasestorage.app",
  messagingSenderId: "918549817924",
  appId: "1:918549817924:web:13532cab85639547f56a11",
  measurementId: "G-KDZZGKVFBX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default { app, db };
