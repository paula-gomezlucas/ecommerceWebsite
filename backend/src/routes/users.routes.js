import { Router } from "express";
import { login, register } from "../controllers/users.controller.js";

const router = Router();

router.post("/", login);
router.post("/register", register);

export default router;