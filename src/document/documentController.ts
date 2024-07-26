import { NextFunction, Request, Response } from "express";

import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import createHttpError from "http-errors";
import { AuthRequest } from "../middleware/authenticationHandler";
import { firestoreDB, initializFirebaseApp } from "../config/db";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const storage = getStorage(initializFirebaseApp());

const uploadFileToStorage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage: any,
  file: Express.Multer.File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, `file/${path}`);
  const snapshot = await uploadBytesResumable(storageRef, file.buffer, {
    contentType: file.mimetype,
  });
  return getDownloadURL(snapshot.ref);
};

const submitDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files?.document?.[0]) {
      console.log(files?.document);
      return next(createHttpError(400, "Required file not uploaded"));
    }

    const _req = req as AuthRequest;

    const document_FileURL = await uploadFileToStorage(
      storage,
      files.document[0],
      `documents/${_req.userId}`
    );

    const { documentName, description } = req.body;

    const userQuery = query(
      collection(firestoreDB, "users"),
      where("userId", "==", _req.userId)
    );
    const querySnapshot = await getDocs(userQuery);

    console.log(_req.userId);

    if (querySnapshot.empty) {
      return next(createHttpError(404, "User not found"));
    }

    const userDocRef = querySnapshot.docs[0].ref;
    const newDocRef = doc(collection(userDocRef, "documents"));
    const document = {
      documentName,
      description,
      document: document_FileURL,
      date: new Date(),
      userId: _req.userId,
      documentId: newDocRef.id,
    };
    await setDoc(newDocRef, document);

    console.debug(
      `Files uploaded successfully. Document URL: ${document_FileURL}`
    );
    console.debug(
      `Text data - Document Name: ${documentName}, Description: ${description}`
    );

    res.status(200).send({
      message: "Document submitted successfully",
      document,
    });
  } catch (e) {
    console.debug(`Error: ${e}`);
    res.status(400).send({ error: e });
  }
};



export { submitDocument };
