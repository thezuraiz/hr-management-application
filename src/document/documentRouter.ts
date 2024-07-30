import express from "express";
import multer from "multer";
import authenticate from "../middleware/authenticationHandler";
import {
  deleteDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentTypes,
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
documentRouter.get("/documenttypes", authenticate, getDocumentTypes);
documentRouter.get("/:id", authenticate, getDocumentById);
documentRouter.post("/delete/:id", authenticate, deleteDocument);

export { documentRouter };
