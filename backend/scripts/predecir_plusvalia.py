import joblib
import pandas as pd
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from db import get_connection
import numpy as np

modelo = joblib.load("modelo_plusvalia.joblib")

conn = get_connection()
cur = conn.cursor()
cur.execute("""
    SELECT id, nombre, precio, area, lat, lon, antiguedad
    FROM propiedades
    WHERE lat IS NOT NULL AND lon IS NOT NULL AND area IS NOT NULL AND precio IS NOT NULL
""")
rows = cur.fetchall()
conn.close()

cols = ["id", "nombre", "precio", "area", "lat", "lon", "antiguedad"]
df = pd.DataFrame(rows, columns=cols)

X = df[["precio", "area", "lat", "lon", "antiguedad"]]
predicciones = modelo.predict(X)
df["plusvalia_predicha"] = np.round(predicciones, 2)

print("📊 Predicciones de Plusvalía:\n")
for _, row in df.iterrows():
    icono = "🟩" if row["plusvalia_predicha"] >= 8 else "🟨" if row["plusvalia_predicha"] >= 5 else "🟥"
    print(f"{icono} {row['nombre']} → {row['plusvalia_predicha']}% anual esperada")