import express from "express";
import { PrismaClient } from "../src/generated/prisma";

const client = new PrismaClient();
const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  console.log("reached here");

  try {
    await client.$transaction(async (tx) => {
      console.log("reached 2");

      const run = await tx.zapRun.create({
        data: {
          zapId: zapId,
          metadata: body,
        },
      });

      console.log("reached 3");

      await tx.zapRunOutbox.create({
        data: {
          zapRunId: run.id,
        },
      });
    });

    res.json({ message: "Webhook received" });
  } catch (err) {
    console.error("Error in transaction:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
