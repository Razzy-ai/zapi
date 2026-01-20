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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const parser_1 = require("./parser");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: 'main-worker' });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g, _h, _j;
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                //pulling values from kafka
                if (!((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_d = message.value) === null || _d === void 0 ? void 0 : _d.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: {
                        id: zapRunId
                    },
                    include: {
                        zap: {
                            include: {
                                actions: {
                                    include: {
                                        type: true
                                    }
                                }
                            }
                        }
                    }
                });
                const currentActions = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find(x => x.sortingOrder === stage);
                if (!currentActions) {
                    console.log("Current action not found");
                }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                if ((currentActions === null || currentActions === void 0 ? void 0 : currentActions.type.id) === "send-email") {
                    //parse out the email,body to send which was given by zapier user while selecting actions
                    const body = (0, parser_1.parse)((_e = currentActions.metadata) === null || _e === void 0 ? void 0 : _e.body, zapRunMetadata); // you just recv {comment.amount}
                    const to = (0, parser_1.parse)((_f = currentActions.metadata) === null || _f === void 0 ? void 0 : _f.email, zapRunMetadata); //{comment.email}
                    //parse original metadata of external app ie.{comment: {email: "name@gmail.com" , etc}}
                    console.log(`Sending out email to ${to} body is ${body}`);
                }
                if ((currentActions === null || currentActions === void 0 ? void 0 : currentActions.type.id) === "send-solana") {
                    // parse out the amount , address to send
                    const amount = (0, parser_1.parse)((_g = currentActions.metadata) === null || _g === void 0 ? void 0 : _g.amount, zapRunMetadata); // you just recv {comment.amount}
                    const address = (0, parser_1.parse)((_h = currentActions.metadata) === null || _h === void 0 ? void 0 : _h.address, zapRunMetadata); //{comment.email}
                    console.log(`Sending out Sol of ${amount} to address ${address}`);
                }
                //
                yield new Promise(r => setTimeout(r, 5000));
                //
                const lastStage = (((_j = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _j === void 0 ? void 0 : _j.length) || 1) - 1;
                if (lastStage !== stage) {
                    //push the next stage in the kafka queue
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: [{
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId
                                })
                            }]
                    });
                }
                console.log("Processing done");
                //
                yield consumer.commitOffsets([{
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString()
                    }]);
            })
        });
    });
}
main();
