import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyD1Nm_qhwYUH452x5tjPpm8eUc0lzIwWVc",
  authDomain: "swifthomes-v3.firebaseapp.com",
  projectId: "swifthomes-v3",
  storageBucket: "swifthomes-v3.firebasestorage.app",
  messagingSenderId: "93014302627",
  appId: "1:93014302627:web:21e2dfe0a7589d13a28416"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app); 
export default db;
export { auth };