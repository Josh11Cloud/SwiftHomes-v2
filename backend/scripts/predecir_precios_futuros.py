from datetime import datetime
import sys
import os
import argparse
import logging
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection

TASA_CRECIMIENTO = Decimal("0.06")  # 6%
ANIOS_A_PROYECTAR = 5
FUENTE = "prediccion"

conn = get_connection()
cur = conn.cursor()

try:
    cur.execute("""
        SELECT zona, precio_m2, fecha
        FROM historico_precios
        WHERE (zona, fecha) IN (
            SELECT zona, MAX(fecha)
            FROM historico_precios
            WHERE fuente != %s
            GROUP BY zona
        )
    """, (FUENTE,))

    rows = cur.fetchall()
    nuevos = []

    for zona, precio_actual, fecha_actual in rows:
        for i in range(1, ANIOS_A_PROYECTAR + 1):
            anio_objetivo = datetime.strptime(str(fecha_actual), "%Y-%m-%d").year + i
            fecha_predicha = f"{anio_objetivo}-01-01"

            precio_predicho = float(precio_actual) * (1 + float(TASA_CRECIMIENTO))**i
            precio_predicho = round(precio_predicho, 2)

            cur.execute("""
                SELECT 1 FROM historico_precios WHERE zona = %s AND fecha = %s
            """, (zona, fecha_predicha))
            if cur.fetchone() is None:
                nuevos.append((zona, precio_predicho, FUENTE, fecha_predicha))
                print(f"🔮 {zona} {fecha_predicha} → ${precio_predicho}")

    for zona, precio, fuente, fecha in nuevos:
        cur.execute("""
            INSERT INTO historico_precios (zona, precio_m2, fuente, fecha)
            VALUES (%s, %s, %s, %s)
        """, (zona, precio, fuente, fecha))

    conn.commit()
    print(f"\n✅ Se insertaron {len(nuevos)} predicciones.")

except Exception as e:
    print("❌ Error al predecir precios:", e)

finally:
    cur.close()
    conn.close()