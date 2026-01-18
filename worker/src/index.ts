import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {

  const consumer = kafka.consumer({ groupId: 'main-worker' });
  await consumer.connect()

  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      })

      //pulling values from kafka
      if (!message.value?.toString()) {
        return;
      }
      const parsedValue = JSON.parse(message.value?.toString())
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage

      const zapRunDetails = await prismaClient.zapRun.findFirst({
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

      const currentActions = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

      if (!currentActions) {
        console.log("Current action not found");
      }

      if (currentActions?.type.id === "send-email") {
        console.log("Sending out an email");
        //parse out the email,body to send

      }
      if (currentActions?.type.id === "send-solana") {
        console.log("Sending out solana");
        // parse out the amount , address to send
      }


      //
      await new Promise(r => setTimeout(r, 5000))

      
      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;

      if (lastStage !== stage) {
        //push the next stage in the kafka queue

        await producer.send({
          topic: TOPIC_NAME,
          messages: [{
            
            value: JSON.stringify({
              stage : stage + 1 ,
              zapRunId
            })

          }]

          })
        }
        
          console.log("Processing done");

          //
          await consumer.commitOffsets([{
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString()

        }])
        }
    })

}



main()