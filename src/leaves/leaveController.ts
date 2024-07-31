import { NextFunction, Request, Response } from "express";
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
import { AuthRequest } from "../middleware/authenticationHandler";
import { uploadFileToStorage } from "../uploadFile";
import { storage } from "../../server";

const getLeaveTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.debug("get leave types hit");
    const collectionRef = collection(firestoreDB, "leaveTypes");
    const q = query(collectionRef);
    const leaveSnapshot = await getDocs(q);
    const data = leaveSnapshot.docs[0].data();
    res.json({ leaveTypes: data["types"] });
  } catch (e) {
    return next(
      createHttpError(500, `Error while getting Leave Types. Error: ${e}`)
    );
  }
};

const getLeavePriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.debug("Get leave prioriy hit");
    const collectionRef = collection(firestoreDB, "leavePriority");
    const q = query(collectionRef);
    const leaveSnapshot = await getDocs(q);
    const leaves = leaveSnapshot.docs[0].data();
    res.json(leaves);
  } catch (err) {
    return next(
      createHttpError(500, `Error while getting leave priority. Error: ${err}`)
    );
  }
};

const submitLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("Submit Leave Hit");
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files?.leave) {
      console.log(files?.document);
      return next(createHttpError(400, "Required file not uploaded"));
    }

    const _req = req as AuthRequest;

    const leave_FileURL = await uploadFileToStorage(
      storage,
      files.leave[0],
      `leave/${_req.userId}${Date.now()}`
    );

    const { leavePriority, leaveDiscription, leaveType } = req.body;

    if (!leavePriority || !leaveDiscription || !leaveType) {
      return next(createHttpError(400, "required fileds"));
    }

    const userQuery = query(
      collection(firestoreDB, "users"),
      where("userId", "==", _req.userId)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return next(createHttpError(404, "User not found"));
    }

    const userLeaveRef = querySnapshot.docs[0].ref;
    const newLeaveRef = doc(collection(userLeaveRef, "leaves"));
    const leave = {
      leaveDiscription,
      leavePriority,
      leaveType,
      document: leave_FileURL,
      date: new Date().toDateString(),
      userId: _req.userId,
      documentId: newLeaveRef.id,
    };
    await setDoc(newLeaveRef, leave);

    res.status(200).send({
      message: "Leave submitted for review",
      leave,
    });
  } catch (e) {
    console.debug(`Error: ${e}`);
    return next(createHttpError(500, `Error: ${e}`));
  }
};

const getLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.debug("Get Leaves hit");
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
      return next(createHttpError(500, `User not found`));
    }
    const data = userSnapshot.docs[0].ref;
    const leaveCollection = collection(data, "leaves");
    const leaveSnapshot = await getDocs(leaveCollection);

    if (leaveSnapshot.empty) {
      return next(createHttpError(500, `No leaves found`));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-const
    let leaves: any = [];

    leaveSnapshot.forEach((e) => {
      leaves.push(e.data());
    });

    res.status(200).json({ length: leaves.length, leaves });
  } catch (err) {
    return next(
      createHttpError(500, `Error while getting leaves. Error: ${err}`)
    );
  }
};

const getLeavesByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.debug("Get by ID Leave API Hit");
  try {
    const _req = req as AuthRequest;
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("userId", "==", _req.userId));
    const userSnapshot = await getDocs(q);
    if (userSnapshot.empty) {
      return next(createHttpError(500, `User not found`));
    }

    const userRef = userSnapshot.docs[0].ref;
    const leaveRef = collection(userRef, "leaves");
    const leaveSnapshot = await getDocs(leaveRef);
    if (leaveSnapshot.empty) {
      res.json({ msg: "No Leaves" });
    }

    const id = req.params.id;
    leaveSnapshot.forEach((e) => {
      const data = e.data();
      if (data["documentId"] == id) {
        res.status(200).json({ message: "leave found", leaves: data });
        return;
      }
      res.status(200).json({ message: "No leaves founds" });
    });
  } catch (e) {
    return next(
      createHttpError(500, `Error while getting leave by ID. Error ${e}`)
    );
  }
};

export {
  getLeaveTypes,
  getLeavePriority,
  submitLeaves,
  getLeaves,
  getLeavesByID,
};
