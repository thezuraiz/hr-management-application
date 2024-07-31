import { NextFunction, Request, Response } from "express";
import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "../config/db";

const getLeaveTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("get leave types hit");
  const collectionRef = collection(firestoreDB, "leaveTypes");
  const q = query(collectionRef);
  const leaveSnapshot = await getDocs(q);
  const data = leaveSnapshot.docs[0].data();
  res.json({ leaveTypes: data["types"] });
};

export { getLeaveTypes };
