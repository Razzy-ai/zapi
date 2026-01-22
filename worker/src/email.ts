import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
})

export async function sendEmail(to:string , body:string){

    //send out the user email
    await transport.sendMail({
        from: "rasikamohite731@gmail.com",
        sender: "raskamohite731@gmail.com",
        to,
        subject: "Hello from ZAPIER",
        text:body
    })
}