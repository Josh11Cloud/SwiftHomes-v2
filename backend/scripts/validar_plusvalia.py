import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection

def normalizar_zona(zona):
    return zona.lower().strip()

def main():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nombre, ubicacion, valor_actual, area
        FROM propiedades
        WHERE valor_actual IS NOT NULL AND area IS NOT NULL AND area > 0
    """)
    propiedades = cur.fetchall()

    cur.execute("""
        SELECT zona, AVG(precio_m2)
        FROM historico_precios
        WHERE fuente = 'propiedades.com'
        GROUP BY zona
    """)
    promedios = {zona.lower(): avg for zona, avg in cur.fetchall()}

    print("📊 Resultados de Validación de Plusvalía:\n")
    for id_, nombre, ubicacion, valor_actual, area in propiedades:
        ubicacion_norm = ubicacion.lower()
        zona_match = next((zona for zona in promedios if zona in ubicacion_norm), None)

        if not zona_match:
            print(f"⚠️  Propiedad '{nombre}' no se pudo asociar a una zona conocida.")
            continue

        valor_m2_real = valor_actual / area
        valor_m2_promedio = promedios[zona_match]
        diferencia = ((valor_m2_real / valor_m2_promedio) - 1) * 100
        alerta = abs(diferencia) > 30

        estado = "🟥 ALERTA" if alerta else "🟩 OK"
        print(f"🏠 {nombre} ({zona_match.title()})")
        print(f"   💰 Valor real por m²: ${valor_m2_real:,.2f}")
        print(f"   📈 Promedio zona:     ${valor_m2_promedio:,.2f}")
        print(f"   📊 Diferencia:        {diferencia:.2f}% → {estado}\n")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()