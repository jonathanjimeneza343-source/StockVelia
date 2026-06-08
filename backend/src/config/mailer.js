import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify()
    .then(() => console.log("✔ Servidor de correos salientes listo para tus clientes"))
    .catch((err) => console.error("Error crítico en la configuración de correo:", err.message));

export default transporter;
