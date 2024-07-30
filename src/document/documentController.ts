import { NextFunction, Request, Response } from "express";

import {
  ref,
  deleteObject,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import createHttpError from "http-errors";
import { AuthRequest } from "../middleware/authenticationHandler";
import { firestoreDB } from "../config/db";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { storage } from "../../server";

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
      `documents/${_req.userId}${Date.now()}`
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
      date: new Date().toDateString(),
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

const getAllDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return next(createHttpError(404, "User not found"));
    }

    const userDocRef = snapshot.docs[0].ref;
    const documentsCollectionRef = collection(userDocRef, "documents");
    const documentsSnapshot = await getDocs(documentsCollectionRef);

    const documents: DocumentData[] = [];
    documentsSnapshot.forEach((doc) => {
      documents.push(doc.data());
    });

    res.json({ length: documents.length, documents });
  } catch (e) {
    return next(createHttpError(500, `Error fetching documents: ${e}`));
  }
};

const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return next(createHttpError(500, "Invalid user"));
    }

    const userSnapshot = snapshot.docs[0].ref;
    const documentControllerRef = collection(userSnapshot, "documents");
    const documentsSnapshot = await getDocs(documentControllerRef);

    if (documentsSnapshot.empty) {
      return next(createHttpError(500, "No Documents found"));
    }

    const _documentId = req.params.id;

    let document;
    documentsSnapshot.forEach((e) => {
      if (e.id == _documentId) {
        document = e.data();
      }
    });

    if (document!) {
      res.json({ msg: "document found", document });
    } else {
      res.json({ msg: "document not found" });
    }
  } catch (e) {
    next(createHttpError(500, `Error: ${e}`));
  }
};

const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return next(createHttpError(500, "Invalid user"));
    }

    const userSnapshot = snapshot.docs[0].ref;
    const documentControllerRef = collection(userSnapshot, "documents");
    const documentsSnapshot = await getDocs(documentControllerRef);

    if (documentsSnapshot.empty) {
      return next(createHttpError(500, "No Documents found"));
    }

    const _documentId = req.params.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let document: any;
    documentsSnapshot.forEach((e) => {
      if (e.id == _documentId) {
        document = e;
      }
    });

    if (document) {
      // Delete document from Firestore
      await deleteDoc(doc(firestoreDB, document.ref.path));

      // Assume the document has a 'filePath' field storing the Cloud Storage file path
      const filePath = document.data();
      // console.log(`File reference: ${filePath.document}`);
      const fileReference = ref(storage, filePath.document);
      await deleteObject(fileReference)
        .then(() => {
          console.log("FIle deleted from Cloud");
        })
        .catch((error) => {
          console.log("Error: FIle deleted from Cloud ", error);
        });

      res.json({ msg: "Document and associated file deleted successfully" });
    } else {
      res.json({ msg: "Document not found" });
    }
  } catch (e) {
    next(createHttpError(500, `Error: ${e}`));
  }
};

const getDocumentTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.debug("Doument Types Api Hit");
    const q = query(collection(firestoreDB, "documentTypes"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs[0].data();
    console.debug("documentTypes : ", data["types"]);
    res.json({ types: data["types"] });
  } catch (e) {
    return next(createHttpError(400, "Something went wrong"));
  }
};

export {
  submitDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentTypes,
};
