import {createTransport} from "nodemailer";

export const sendEmail = async(to,subject,text)=>{
    //mailtrap.io ki website pr mailtrap.io/inbox pr jakr myInbox pr click kr nodemailer se createTransport k liye object mila hai
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });;

    await transporter.sendMail({
        to,
        subject,
        text,
    });
}