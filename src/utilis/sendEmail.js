import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

export async function sendEmail(options) {
    // send mail with defined transport object   
    console.log(process.env.SENDEMAILUSERNAME);
    console.log(process.env.SENDEMAILPASSWORD);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDEMAILUSERNAME,
            pass: process.env.SENDEMAILPASSWORD
        },
    });

    const info = await transporter.sendMail({
        from: "elbendarye6@gmail.com", // sender address
        to: options.to, // list of receivers
        bcc: options.bcc,
        cc: options.cc,
        subject: options.subject, // Subject line
        text: options.text, // plain text body
        html: options.html, // html body
    });

    return info;
}
