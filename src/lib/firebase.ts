import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "knowledgeos-enterpriseai",
  appId: "1:176114178649:web:7fef113334b2fa20d52f48",
  apiKey: "AIzaSyC3wsWwtB-FC_9sO86mkWkxUfomCSpLkHc",
  authDomain: "knowledgeos-enterpriseai.firebaseapp.com",
  storageBucket: "knowledgeos-enterpriseai.firebasestorage.app",
  messagingSenderId: "176114178649"
};

const databaseId = "ai-studio-omnimindaistudyw-21bf74d1-cb71-4130-910e-cd523a16ceda";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId
const db = getFirestore(app, databaseId);

// Initialize Authentication
const auth = getAuth(app);

export { app, db, auth };
