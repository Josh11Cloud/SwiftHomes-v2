export default async function handler(req, res) {
  console.log("Solicitud recibida en /api/openAI");
  const { mensaje } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: mensaje }],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).send({ error: errorData.error.message });
    }

    const data = await response.json();
    console.log("Respuesta de OpenAI:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en la API de OpenAI:", error);
    res.status(500).send({ error: "Error interno" });
  }
}