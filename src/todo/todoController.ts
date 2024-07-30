import {
  collection,
  doc,
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
};

export { getPriorities, getAllTodos, submitTodo };
