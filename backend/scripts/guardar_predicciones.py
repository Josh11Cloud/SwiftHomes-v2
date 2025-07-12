from joblib import load
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db import get_connection
from utils.preparar_datos import cargar_datos

print("📦 Cargando modelo...")
modelo = load("modelo_plusvalia.joblib")
df = cargar_datos()

conn = get_connection()
cur = conn.cursor()

print("🧠 Generando predicciones...")
for _, row in df.iterrows():
    X = row[["precio", "area", "lat", "lon", "antiguedad"]].values.reshape(1, -1)
    prediccion = modelo.predict(X)[0]

    clasificacion = "alta" if prediccion >= 10 else "media" if prediccion >= 6 else "baja"

    cur.execute("""
        INSERT INTO predicciones_plusvalia (propiedad_id, nombre, plusvalia_esperada, clasificacion)
        VALUES (%s, %s, %s, %s)
    """, (
        int(row["id"]),
        row["nombre"],
        float(round(prediccion, 2)),
        clasificacion
    ))
    print(f"✅ {row['nombre']} → {round(prediccion, 2)}% ({clasificacion})")

conn.commit()
cur.close()
conn.close()

print("🎯 Predicciones guardadas.")