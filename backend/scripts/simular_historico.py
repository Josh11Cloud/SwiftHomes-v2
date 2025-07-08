from datetime import datetime
import sys
import os
import argparse
import logging
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection

ANIOS = 5
TASA_ANUAL = Decimal('0.05')
def generar_historico_simulado():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT zona, precio_m2
        FROM historico_precios
        WHERE fecha = (SELECT MAX(fecha) FROM historico_precios)
    """)
    zonas = cur.fetchall()

    hoy = datetime.today()

    registros = []

    for zona, precio_actual in zonas:
        for i in range(1, ANIOS + 1):
            anio = hoy.year - i
            fecha_simulada = f"{anio}-01-01" 
            precio_simulado = float(round(precio_actual / ((1 + TASA_ANUAL) ** i), 2))

            registros.append((zona, precio_simulado, "simulado", fecha_simulada))

    for zona, precio_m2, fuente, fecha in registros:
        cur.execute("""
            SELECT 1 FROM historico_precios WHERE zona = %s AND fecha = %s
        """, (zona, fecha))
        if cur.fetchone() is None:
            cur.execute("""
                INSERT INTO historico_precios (zona, precio_m2, fuente, fecha)
                VALUES (%s, %s, %s, %s)
            """, (zona, precio_m2, fuente, fecha))

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Precios simulados insertados correctamente.")

if __name__ == "__main__":
    generar_historico_simulado()