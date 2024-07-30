import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "../config/db";
import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";

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

export { getPriorities };
