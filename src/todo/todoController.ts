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
import { firestoreDB } from "../config/db";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authenticationHandler";
import { storage } from "../../server";
import { uploadFileToStorage } from "../uploadFile";
import { deleteObject, ref } from "firebase/storage";

const getPriorities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("Priorities Api Hit");

  try {
    const q = query(collection(firestoreDB, "todoPriority"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs[0].data();
    res.json({ priorities: data["Priorities "] });
  } catch (e) {
    return next(createHttpError(400, `Error: ${e}`));
  }
};

const submitTodo = async (req: Request, res: Response, next: NextFunction) => {
  console.debug("Submit Todo Hit");
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!req.files) {
      console.log(req.body);
      return next(createHttpError(400, "Required file not uploaded"));
    }

    const _req = req as AuthRequest;

    const todo_FileURL = await uploadFileToStorage(
      storage,
      files.todo[0],
      `todo/${_req.userId}${Date.now()}`
    );

    const { todoName, todoDescription } = req.body;

    if (!todoName || !todoDescription) {
      return next(createHttpError(400, "Required field"));
    }

    const q = query(
      collection(firestoreDB, "users"),
      where("userId", "==", _req.userId)
    );
    const snapshot = await getDocs(q);
    const refDocument = snapshot.docs[0].ref;

    const newDocRef = doc(collection(refDocument, "todoes"));
    const document = {
      todoName,
      todoDescription,
      todoRef: todo_FileURL,
      date: new Date().toDateString(),
      userId: _req.userId,
      documentId: newDocRef.id,
    };
    await setDoc(newDocRef, document);

    res.status(200).send({
      message: "Document submitted successfully",
      document,
    });
  } catch (e) {
    console.error("Error submitting todo: ", e);
    return next(createHttpError(500, `Error: ${e}`));
  }
};

const getAllTodos = async (req: Request, res: Response, next: NextFunction) => {
  console.debug("get all todoes hit");
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return next(createHttpError(404, "User not found"));
    }

    const userDocRef = snapshot.docs[0].ref;
    const todoCollectionRef = collection(userDocRef, "todoes");
    const todoSnapshot = await getDocs(todoCollectionRef);

    const documents: DocumentData[] = [];
    todoSnapshot.forEach((doc) => {
      documents.push(doc.data());
    });

    res.json({ length: documents.length, documents });
  } catch (e) {
    return next(createHttpError(500, `Error fetching documents: ${e}`));
  }
};

const getTodo = async (req: Request, res: Response, next: NextFunction) => {
  console.debug("Get todo called");
  try {
    const id = req.params.id;
    if (!id) {
      return next(createHttpError(400, "Id required"));
    }
    const _req = req as AuthRequest;

    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return next(createHttpError(500, "User Not found"));
    }
    const userDocRef = snapshot.docs[0].ref;
    const todoCollectionRef = collection(userDocRef, "todoes");
    const todoSnapshot = await getDocs(todoCollectionRef);

    let document: DocumentData;
    todoSnapshot.forEach((e) => {
      if (e.id == id) {
        document = e.data();
      }
    });

    if (document!) {
      res.json({ msg: "document found", document });
    } else {
      res.json({ msg: "document not found" });
    }
  } catch (e) {
    return next(createHttpError(500, `Error: ${e}`));
  }
};

const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return next(createHttpError(500, "Invalid user"));
    }

    const userSnapshot = snapshot.docs[0].ref;
    const documentControllerRef = collection(userSnapshot, "todoes");
    const documentsSnapshot = await getDocs(documentControllerRef);

    if (documentsSnapshot.empty) {
      return next(createHttpError(500, "No Documents found"));
    }

    const _documentId = req.params.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let todo: any;
    documentsSnapshot.forEach((e) => {
      if (e.id == _documentId) {
        todo = e;
        return;
      }
    });

    if (todo) {
      // Delete document from Firestore
      await deleteDoc(doc(firestoreDB, todo.ref.path));

      const filePath = todo.data();
      const fileReference = ref(storage, filePath.todoRef);
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

export { getPriorities, getAllTodos, submitTodo, getTodo, deleteTodo };
