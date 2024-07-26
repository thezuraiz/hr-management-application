import app from "./src/app";
import { config } from "./src/config/config";
import { initializFirebaseApp } from "./src/config/db";

initializFirebaseApp();

const startServer = async () => {
  const port = config.port || 3000;

  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
};

startServer();
