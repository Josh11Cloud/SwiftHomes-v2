export const addActivity = async (token, activityType, description) => {
  try {
    const response = await fetch("http://192.168.100.64:5500/api/actividad", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        activityType,
        description: description.substring(0, 100),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al registrar actividad");
    }

    console.log("✅ Actividad registrada exitosamente");
  } catch (error) {
    console.error("❌ Error al registrar actividad:", error);
  }
};