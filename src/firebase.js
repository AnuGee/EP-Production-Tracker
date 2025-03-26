// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 เพิ่มตรงนี้

const firebaseConfig = {
  apiKey: "AIzaSyCPkKn0_e76UNhEfYWWdexTwe_HJOuA5u0",
  authDomain: "epproductionworkflow.firebaseapp.com",
  projectId: "epproductionworkflow",
  storageBucket: "epproductionworkflow.appspot.com",
  messagingSenderId: "497543686415",
  appId: "1:497543686415:web:e250ad8cd994468402767a",
  measurementId: "G-HFRBR0MTBW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 👈 เพิ่มตรงนี้

export { app, db, auth }; // ✅ export ทั้ง 3 ตัว
