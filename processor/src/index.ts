import dotenv from "dotenv";
dotenv.config(); 

import { PrismaClient } from "./generated/prisma/client";
import { Kafka } from "kafkajs";
import { log } from "node:console";

const TOPIC_NAME = "zap-events";
const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  console.log("✅ Processor started...");
  console.log("Connected to Kafka and DB at:", process.env.DATABASE_URL);

  while (true) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    console.log(pendingRows)

    if (pendingRows.length === 0) {
      await new Promise((r) => setTimeout(r, 2000)); // prevent busy loop
      continue;
    }

    await producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: r.zapRunId,
      })),
    });

    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((r) => r.id),
        },
      },
    });
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
