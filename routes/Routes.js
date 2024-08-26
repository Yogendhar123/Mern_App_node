import express from "express";
import { loginIn, logOut, signUp } from "../controllers/router.controllers.js";



const router = express.Router();

router.post("/signup", signUp);
router.post("/login", loginIn);
router.post("/logout", logOut);


export default router;