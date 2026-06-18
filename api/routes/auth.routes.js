import express from "express";
import { signin, signup, logout, getUsers, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


//  get all users:
router.get("/get-users", protect, getUsers);
//  who is actually logged in on THIS browser, per the httpOnly cookie:
router.get("/me", protect, getCurrentUser);
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);



export default router;
