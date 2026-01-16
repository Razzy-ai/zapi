import {PrismaClient} from "@prisma/client"

const prismaClient = new PrismaClient();


async function main() {
    await prismaClient.availableTriggers.create({

        data : {
            id: "webhook",
            name:"webhook",
            image:"https://img.icons8.com/color/1200/webhook.jpg"
        }
    })

    await prismaClient.availableActions.create({
        data: {
            id: "send-solana",
            name:"Send Solana",
            image:"https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
        }
    })

    await prismaClient.availableActions.create({
        data: {
            id: "send-email",
            name:"Send Email",
            image:"https://img.freepik.com/premium-vector/mail-icon-design_996135-41118.jpg?semt=ais_hybrid&w=740&q=80"
        }
    })
}

main()