// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyCVYvpZiHuAkP6ZwhRS7-VVhlFTUYTrZV8",
    authDomain: "scanformenu-d0cf0.firebaseapp.com",
    databaseURL: "https://scanformenu-d0cf0-default-rtdb.firebaseio.com",
    projectId: "scanformenu-d0cf0",
    storageBucket: "scanformenu-d0cf0.appspot.com",
    messagingSenderId: "217661213412",
    appId: "1:217661213412:web:936ff900a546a94766baf1",
    measurementId: "G-6Y8BS663ZZ"
  };

  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);

export  {analytics, storage, database };
