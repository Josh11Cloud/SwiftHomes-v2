export const fetchProperties = async ({ query }) => {
    try {
        const res = await fetch(`http://127.0.0.1:5500/api/propiedades?${query}`);
        if (!res.ok) {
            throw new Error(`Error al obtener propiedades: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error en al obtener propiedades en fetchProperties:", error);
        throw error;
    }
};