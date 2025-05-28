import db from "../src/firebase/config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import express from "express";
import cors from "cors";
import transporter from "../src/mailer/mailer.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Servidor Express funcionando!");
});

app.post("/contacto", async (req, res) => {
  const { name, email, message, tipoConsulta } = req.body;
  console.log("Formulario recibido:", { name, email, message, tipoConsulta });

  try {
    const contactosRef = collection(db, "contactos");
    await addDoc(contactosRef, {
      name,
      email,
      message,
      tipoConsulta,
      fecha: serverTimestamp(),
    });

    const mailOptions = {
      from: email,
      to: "swifthomes.mx@gmail.com",
      subject: "Mensaje de contacto",
      text: `Nombre: ${name}\nCorreo electrónico: ${email}\nMensaje: ${message}\nTipo de consulta: ${tipoConsulta}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        mensaje: "Formulario recibido y correo electrónico enviado con éxito",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        mensaje:
          "Error al guardar el formulario o enviar el correo electrónico",
      });
  }
  await fetch("https://hooks.zapier.com/hooks/catch/21743463/2jpoue9/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      tipoConsulta,
      message,
    }),
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
