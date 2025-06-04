import db from "../src/firebase/config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import express from "express";
import cors from "cors";
import transporter from "../src/mailer/mailer.js";
import fetch from "node-fetch";
import { doc, updateDoc } from "firebase/firestore";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      estado: "Nuevo",
    });

    const mailOptions = {
      from: email,
      to: "swifthomes.mx@gmail.com",
      subject: "Mensaje de contacto",
      text: `Nombre: ${name}\nCorreo electrónico: ${email}\nMensaje: ${message}\nTipo de consulta: ${tipoConsulta}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      mensaje: "Formulario recibido y correo electrónico enviado con éxito",
    });

    await fetch("https://hooks.zapier.com/hooks/catch/21743463/2jpoue9/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, tipoConsulta, message }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al guardar el formulario o enviar el correo electrónico",
    });
  }
});

app.post("/api/propiedades", async (req, res) => {
  try {
    const {
      nombre,
      ubicacion,
      precio,
      renta,
      tipo,
      habitaciones,
      banos,
      area,
      estacionamientos,
      descripcion,
      categoria,
      imagen,
      roi,
      paybackYears,
      isInvestment,
      userId,
      antiguedad,
      financiamiento,
      servicios,
      precioNegociable,
    } = req.body;

    if (!nombre || !ubicacion || !categoria) {
      return res.status(400).json({ error: "Campos requeridos faltantes" });
    }

    const propiedadesRef = collection(db, "propiedades");
    await addDoc(propiedadesRef, {
      nombre,
      precio: precio ? Number(precio) : null,
      ubicacion,
      descripcion,
      tipo,
      habitaciones: Number(habitaciones),
      banos: Number(banos),
      area: Number(area),
      imagen,
      categoria,
      estacionamientos: Number(estacionamientos),
      renta: renta ? Number(renta) : null,
      fecha: serverTimestamp(),
      roi: roi !== null && roi !== undefined ? Number(roi) : null,
      paybackYears:
        paybackYears !== null && paybackYears !== undefined
          ? paybackYears
          : null,
      isInvestment:
        isInvestment !== null && isInvestment !== undefined
          ? isInvestment
          : false,
      userId,
      antiguedad: antiguedad ? Number(antiguedad) : null,
      financiamiento,
      servicios,
      precioNegociable:
        precioNegociable !== null && precioNegociable !== undefined
          ? precioNegociable
          : false,
    });

    res.status(201).json({ mensaje: "Propiedad guardada con éxito" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno", detalles: error.message });
  }
});

app.patch("/api/propiedades/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const propiedadRef = doc(db, "propiedades", id);
    await updateDoc(propiedadRef, req.body);
    res.status(200).json({ mensaje: "Propiedad actualizada con éxito" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno", detalles: error.message });
  }
});

app.get("/api/propiedades", async (req, res) => {
  try {
    const propiedadesRef = collection(db, "propiedades");
    const querySnapshot = await getDocs(propiedadesRef);
    const propiedades = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(propiedades);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno", detalles: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
