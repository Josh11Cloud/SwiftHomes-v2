import pandas as pd
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("""
    SELECT id, nombre, precio, area, lat, lon, antiguedad, plusvalia
    FROM propiedades
    WHERE precio IS NOT NULL AND area IS NOT NULL AND lat IS NOT NULL AND lon IS NOT NULL AND antiguedad IS NOT NULL AND plusvalia IS NOT NULL
""")

rows = cur.fetchall()
cols = ['id', 'nombre', 'precio', 'area', 'lat', 'lon', 'antiguedad', 'plusvalia']
df = pd.DataFrame(rows, columns=cols)

print("📊 Datos cargados:")
print(df)

df.to_csv("datos_plusvalia.csv", index=False)

def cargar_datos():
    return pd.read_csv("datos_plusvalia.csv")

df_cargado = cargar_datos()

cur.close()
conn.close()