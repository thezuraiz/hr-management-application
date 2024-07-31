import express from "express";
import { getLeaveTypes } from "./leaveController";
import authenticate from "../middleware/authenticationHandler";

const leaveRouter = express.Router();

leaveRouter.get("/leavetypes", authenticate, getLeaveTypes);

export { leaveRouter };
