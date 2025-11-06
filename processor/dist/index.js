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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("./generated/prisma/client");
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = "zap-events";
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafka.producer();
        yield producer.connect();
        console.log("✅ Processor started...");
        console.log("Connected to Kafka and DB at:", process.env.DATABASE_URL);
        while (true) {
            const pendingRows = yield client.zapRunOutbox.findMany({
                where: {},
                take: 10,
            });
            if (pendingRows.length === 0) {
                yield new Promise((r) => setTimeout(r, 2000)); // prevent busy loop
                continue;
            }
            yield producer.send({
                topic: TOPIC_NAME,
                messages: pendingRows.map((r) => ({
                    value: r.zapRunId,
                })),
            });
            yield client.zapRunOutbox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map((r) => r.id),
                    },
                },
            });
        }
    });
}
main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
