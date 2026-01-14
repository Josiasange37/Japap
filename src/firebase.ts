import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBwQ4qK7lDLuFBXFzpo47q9LB1Pu2MegTI",
    authDomain: "japap-6c438.firebaseapp.com",
    databaseURL: "https://japap-6c438-default-rtdb.firebaseio.com",
    projectId: "japap-6c438",
    storageBucket: "japap-6c438.firebasestorage.app",
    messagingSenderId: "944006139932",
    appId: "1:944006139932:web:9181aca6e06bb944c6cfd9",
    measurementId: "G-KFLTF3S2CF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
