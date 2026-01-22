require('dotenv').config()

import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";

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

      const zapRunMetadata = zapRunDetails?.metadata;
       
      if (currentActions?.type.id === "send-email") {
        
        //parse out the email,body to send which was given by zapier user while selecting actions
        const body = parse((currentActions.metadata as JsonObject)?.body as string, zapRunMetadata);  // you just recv {comment.amount}
        const to = parse((currentActions.metadata as JsonObject)?.email as string , zapRunMetadata) ;   //{comment.email}

        //parse original metadata of external app ie.{comment: {email: "name@gmail.com" , etc}}
         console.log(`Sending out email to ${to} body is ${body}`);
         await sendEmail(to,body)
         
      }
      if (currentActions?.type.id === "send-solana") {
      
        // parse out the amount , address to send
         const amount = parse((currentActions.metadata as JsonObject)?.amount as string, zapRunMetadata);  // you just recv {comment.amount}
         const address = parse((currentActions.metadata as JsonObject)?.address as string , zapRunMetadata) ;   //{comment.email}

        console.log(`Sending out Sol of ${amount} to address ${address}`);
        await sendSol(address,amount);
      }


      //
      await new Promise(r => setTimeout(r, 5000))

      //
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