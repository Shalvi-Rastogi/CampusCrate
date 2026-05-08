
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmzbS8YsxQXp_hl6o8rZIM5w3a8m2bNl8",
  authDomain: "lost-and-found-b9d59.firebaseapp.com",
  projectId: "lost-and-found-b9d59",
  storageBucket: "lost-and-found-b9d59.appspot.com",
  messagingSenderId: "393536110069",
  appId: "1:393536110069:web:53fd464126e89c850374bc",
  measurementId: "G-BL51GKSLRC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export { app, analytics, auth, provider };
