import express from "express";
import {
  getLeavePriority,
  getLeaves,
  getLeavesByID,
  getLeaveTypes,
  submitLeaves,
} from "./leaveController";
import authenticate from "../middleware/authenticationHandler";
import multer from "multer";

const leaveRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

leaveRouter.post(
  "/submit",
  authenticate,
  upload.fields([
    { name: "leave", maxCount: 1 },
    { name: "leavePriority", maxCount: 1 },
    { name: "leaveDiscription", maxCount: 1 },
    { name: "leaveType", maxCount: 1 },
  ]),
  submitLeaves
);
leaveRouter.get("/", authenticate, getLeaves);
leaveRouter.get("/leavetypes", authenticate, getLeaveTypes);
leaveRouter.get("/leavepriority", authenticate, getLeavePriority);
leaveRouter.get("/:id", authenticate, getLeavesByID);

export { leaveRouter };
