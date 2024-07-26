import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  jwt_key: process.env.JWTKEY,
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

export const config = Object.freeze(_config);
