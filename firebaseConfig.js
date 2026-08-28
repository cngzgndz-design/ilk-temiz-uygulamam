import { initializeApp } from "firebase/app";
import { initializeFirestore, AxiosConfig } from "firebase/firestore";

// Firebase web uygulamanızın yapılandırma ayarları
const firebaseConfig = {
  apiKey: "AIzaSyAsX-YOUR-API-KEY", // Sizin projenizin orijinal anahtarları
  authDomain: "ordu-mumessilleri.firebaseapp.com",
  projectId: "ordu-mumessilleri",
  storageBucket: "ordu-mumessilleri.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:123456"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını başlat ve dışa aktar
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});