import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6xpf11uKlEanzLDD8LH2Ppw17w5yhjeQ",
  authDomain: "so-textilehub.firebaseapp.com",
  projectId: "so-textilehub",
  storageBucket: "so-textilehub.firebasestorage.app",
  messagingSenderId: "1069557492843",
  appId: "1:1069557492843:web:5d5bfde51ba596bd9dd52e",
  measurementId: "G-ZKRWBRQXJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth

// Enable Firestore offline persistence and configure settings for better reliability
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

// Configure Firestore settings for better network resilience
try {
  // Enable offline persistence (this helps with network issues)
  import('firebase/firestore').then(({ enableMultiTabIndexedDbPersistence }) => {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
  });
} catch (error) {
  console.warn('Firestore persistence setup failed:', error);
}

// Optional: Enable offline persistence
// This allows the app to work offline and sync when back online
export const enableOfflineSupport = () => {
  // This is automatically handled by Firebase v9+
  console.log("Firestore offline support is enabled by default");
};

// Add network state monitoring
export const monitorNetworkState = () => {
  window.addEventListener('online', () => {
    console.log('Network connection restored');
    enableNetwork(db).catch(console.error);
  });
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost');
  });
};

// Initialize network monitoring
if (typeof window !== 'undefined') {
  monitorNetworkState();
}

export { db, auth };
