import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  jwt_key: process.env.JWTKEY,
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

export const config = Object.freeze(_config);
