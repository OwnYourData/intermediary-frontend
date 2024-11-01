import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

type EmailPayload = {
  to: string
  subject: string
  html: string
}

const smtpOptions: SMTPTransport.Options = {
    host: process.env.SMTP_HOST!!,
    port: parseInt(process.env.SMTP_PORT!!),
    from: process.env.SMTP_FROM!!,
    tls: {
        servername: process.env.NODE_ENV === "development" ? process.env.TLS_SERVERNAME_OVERRIDE : undefined
    },
    auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
        "user": process.env.SMTP_USER,
        "pass": process.env.SMTP_PASS
    } : undefined
};

export const sendEmail = async (data: EmailPayload) => {
    const transporter = nodemailer.createTransport(smtpOptions);
    return await transporter.sendMail({
        from: process.env.SMTP_FROM!!,    
        ...data
    });
};