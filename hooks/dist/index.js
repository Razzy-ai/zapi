"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../src/generated/prisma");
const client = new prisma_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;
    console.log("reached here");
    try {
        yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("reached 2");
            const run = yield tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body,
                },
            });
            console.log("reached 3");
            yield tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id,
                },
            });
        }));
        res.json({ message: "Webhook received" });
    }
    catch (err) {
        console.error("Error in transaction:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
}));
app.listen(3002, () => {
    console.log("Server running on http://localhost:3000");
});
