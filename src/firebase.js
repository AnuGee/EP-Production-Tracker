import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ config ต้องถูกต้อง
const firebaseConfig = {
  apiKey: "AIzaSyCPkKn0_e76UNhEfYWWdexTwe_HJOuA5u0",
  authDomain: "epproductionworkflow.firebaseapp.com",
  projectId: "epproductionworkflow",
  storageBucket: "epproductionworkflow.appspot.com",
  messagingSenderId: "497543686415",
  appId: "1:497543686415:web:e250ad8cd994468402767a",
  measurementId: "G-HFRBR0MTBW"
};

// ✅ ต้อง initializeApp ก่อนถึงจะใช้ Firestore ได้
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
