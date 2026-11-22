import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: emailUser && emailPass ? { user: emailUser, pass: emailPass } : undefined,
});

if (process.env.NODE_ENV !== "production") {
  transporter
    .verify()
    .then(() => console.log("✔ Servidor de correos salientes listo para tus clientes"))
    .catch((err) =>
      console.error("Error crítico en la configuración de correo:", err.message),
    );
}

export default transporter;