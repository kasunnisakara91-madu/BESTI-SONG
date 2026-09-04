import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    increment,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyDecEoQOh7zw_Yy1GgqIyOOS3tXyFpNSMs",

    authDomain: "madusanka-base.firebaseapp.com",

    projectId: "madusanka-base",

    storageBucket: "madusanka-base.firebasestorage.app",

    messagingSenderId: "354244531431",

    appId: "1:354244531431:web:66d954b00ef021d503be42",

    measurementId: "G-6BH2DRDV3V"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

const auth = getAuth(app);


export {

    app,

    db,
    storage,
    auth,

    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    increment,
    getDoc,
    setDoc,

    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,

    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
};