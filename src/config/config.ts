import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
  jwt_key: process.env.JWTKEY,
};

export const config = Object.freeze(_config);
