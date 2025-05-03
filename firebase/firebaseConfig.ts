// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBIRaKtaNC3o7bVNMUmB0cfQ885tUephaM",
  authDomain: "news-app-ce3c6.firebaseapp.com",
  projectId: "news-app-ce3c6",
  storageBucket: "news-app-ce3c6.appspot.com",
  messagingSenderId: "12376713254",
  appId: "1:12376713254:web:60e6244b1d58a6dda4dee7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
 