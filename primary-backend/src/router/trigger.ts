import {Router} from "express";
import { authMiddleware } from "../middleware";
import { Request,Response } from "express";
import { SignupSchema , SigninSchema } from "../types";
import { prismaClient } from "../db";
import jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

// api/v1/trigger/available
router.get("/available", async(req,res) => {

    const availableTriggers = await prismaClient.availableTriggers.findMany({})
       res.json({
          availableTriggers
       })
})

export const triggerRoute = router;