// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoLZAW_w9L7m7EYJ8kkmp94JvLC_Iu34E",
  authDomain: "stream-sphere-52fe6.firebaseapp.com",
  projectId: "stream-sphere-52fe6",
  storageBucket: "stream-sphere-52fe6.firebasestorage.app",
  messagingSenderId: "1008287739310",
  appId: "1:1008287739310:web:43a3cb3952ef5b39cbec3f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default { app, db };
