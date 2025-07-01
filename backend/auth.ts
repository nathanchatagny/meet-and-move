import express from "express";
import { signup, login, getProfile } from "../controllers/authController";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticateJWT, getProfile);

export default router;