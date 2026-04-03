// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import authLib from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_PROJECT_ID.firebaseapp.com",
  databaseURL: "PLACEHOLDER_DATABASE_URL",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_PROJECT_ID.appspot.com",
  messagingSenderId: "PLACEHOLDER_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID"
};

let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = database();
const auth = authLib();

export { app, db, auth };
