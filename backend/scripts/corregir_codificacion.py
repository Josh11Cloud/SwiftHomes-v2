import sys
import os
import argparse
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection

conn = get_connection()
cur = conn.cursor()

cur.execute("SELECT DISTINCT zona_corrupta FROM historico_precios")
zonas_raw = [row[0] for row in cur.fetchall()]

for z in zonas_raw:
    try:
        z_bytes = z.encode('latin1', errors='replace')
        z_fix = z_bytes.decode('utf-8', errors='replace')
        print(f"🔧 {z} → {z_fix}")

        cur.execute("""
            UPDATE historico_precios
            SET zona = %s
            WHERE zona_corrupta = %s
        """, (z_fix, z))

    except Exception as e:
        print(f"⚠️ Error al corregir '{z}':", e)

conn.commit()
print("✅ Zonas corregidas y guardadas en la columna 'zona'")

cur.close()
conn.close()