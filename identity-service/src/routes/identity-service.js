import express from "express";

import { resgiterUser, loginUser, refreshTokenUser, logoutUser, findUser, registerAgent } from "../controllers/identity-controller.js";


const router = express.Router();

router.post("/register", resgiterUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/logout", logoutUser);
router.get("/find/:user", findUser);
router.post("/agents/register", registerAgent);

export default router