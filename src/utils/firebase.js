// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGPtjSazHTFdpsBvPmPnYjYJAT5EMDGao",
  authDomain: "agripro-app-484cd.firebaseapp.com",
  projectId: "agripro-app-484cd",
  storageBucket: "agripro-app-484cd.firebasestorage.app",
  messagingSenderId: "857460675706",
  appId: "1:857460675706:web:72c9bd3a334b1f491797c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
