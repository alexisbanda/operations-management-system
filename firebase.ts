import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tus credenciales de Firebase para la aplicación web
// Es seguro exponer estas claves en el cliente. Se usan para identificar tu proyecto.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás (por ahora, solo Auth)
export const auth = getAuth(app);
export const db = getFirestore(app);