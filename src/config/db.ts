import { config } from "./config";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

let app: FirebaseApp;
let firestoreDB: Firestore;

const initializFirebaseApp = () => {
  try {
    app = initializeApp(firebaseConfig);
    firestoreDB = getFirestore(app);
    console.log("DB Connected");
    return app;
  } catch (e) {
    throw `Firestore DB connection erorr ${e}`;
  }
};

const getFirebaseApp = () => app;

export { initializFirebaseApp, getFirebaseApp, firestoreDB };
