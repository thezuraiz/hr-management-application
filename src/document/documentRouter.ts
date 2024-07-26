import express from "express";
import authenticate from "../middleware/authenticationHandler";
import { submitDocument } from "./documentController";
import multer from "multer";

const documentRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

documentRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "documentName", maxCount: 1 },
    { name: "description", maxCount: 1 },
  ]),
  submitDocument
);



export { documentRouter };
