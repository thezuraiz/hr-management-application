import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  where,
  query,
} from "firebase/firestore";
import { firestoreDB } from "../config/db";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Todo Validation
    if (!name || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }

    // Todo: Process Data
    const hashPasssword = await bcrypt.hash(password, 10);
    const data = { name, email, hashPasssword };

    // Todo: Check Already Data
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("email", "==", data.email));
    const docSnapshot = await getDocs(q);

    if (!docSnapshot.empty) {
      console.log("User Exist");
      const error = createHttpError(400, "User Already Exists");
      return next(error);
    }

    // Todo: add entries in user
    const document = doc(collection(firestoreDB, "users"));
    const userData = { ...data, userId: document.id };
    await setDoc(document, userData);

    // Todo: generate jw token
    const token = jwt.sign({ sub: userData.userId }, config.jwt_key as string, {
      expiresIn: "7d",
    });

    // Todo: send response
    res.status(201).json({
      msg: `${data.name} registered`,
      token: token,
    });
  } catch (e) {
    return next(createHttpError(500, `Failed to register User. Error: ${e}`));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // --- Validation
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createHttpError(300, "All Fields are required!"));
    }

    // Find user from Database
    const collectionRef = collection(firestoreDB, "users");
    const q = query(collectionRef, where("email", "==", email));
    const docSnapshot = await getDocs(q);
    if (docSnapshot.empty) {
      const error = createHttpError(404, "User Not Found");
      return next(error);
    }

    const user = docSnapshot.docs[0];
    const userData = user.data();

    // Hash Password
    const isMatched = await bcrypt.compare(password, userData.hashPasssword);

    if (!isMatched) {
      return next(createHttpError(401, "Username or password incorrect!"));
    }

    const token = jwt.sign({ sub: userData.userId }, config.jwt_key as string, {
      expiresIn: "7d",
    });
    res.json({ msg: "user login", token });
  } catch (error) {
    return next(createHttpError(500, "Failed to Login: " + error));
  }
};

export { registerUser, loginUser };
