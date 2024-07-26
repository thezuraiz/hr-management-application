import express, { NextFunction, Request, Response } from "express";
import authenticate, { AuthRequest } from "../middleware/authenticationHandler";
import {
  getAllDocuments,
  getDocumentById,
  submitDocument,
} from "./documentController";
import multer from "multer";
import {
  collection,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firestoreDB } from "../config/db";
import createHttpError from "http-errors";

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
