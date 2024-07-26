import express from "express";
import multer from "multer";
import authenticate from "../middleware/authenticationHandler";
import {
  getAllDocuments,
  getDocumentById,
  submitDocument,
} from "./documentController";
const documentRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

documentRouter.post(
  "/submit",
  authenticate,
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "documentName", maxCount: 1 },
    { name: "description", maxCount: 1 },
  ]),
  submitDocument
);

documentRouter.get("/", authenticate, getAllDocuments);

documentRouter.get("/:id", authenticate, getDocumentById);

export { documentRouter };
