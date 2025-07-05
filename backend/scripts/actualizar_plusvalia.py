import sys
import os
import argparse
import logging
import csv
from datetime import datetime
from decimal import Decimal
from unidecode import unidecode

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import get_connection
from utils.plusvalia_utils import extraer_zona, calcular_plusvalia
from utils.scraper_propiedades import scrap_propiedades
from utils.geo_utils import geolocalizar_direccion

logging.basicConfig(level=logging.INFO)


def actualizar_plusvalia_db(dry_run=False, export_csv=False):
    conn, cur = None, None
    try:
        if not dry_run:
            conn = get_connection()
            cur = conn.cursor()

        zonas_lista = [
            ("Valle Imperial", "zapopan"),
            ("Ladrón de Guevara", "guadalajara"),
            ("Jardines del Valle", "zapopan"),
            ("La Cima", "zapopan"),
            ("Las Cañadas", "zapopan"),
            ("Providencia", "guadalajara"),
        ]

        precios_m2_default = {
            "Valle Imperial": 24000,
            "Ladrón de Guevara": 38000,
            "Jardines del Valle": 21000,
            "La Cima": 19500,
            "Las Cañadas": 26000,
            "Providencia": 42000,
        }

        precios_m2_zonas = {}
        historico_csv = []

        print("📡 Obteniendo precios promedio por m²...")
        for zona, ciudad in zonas_lista:
            slug_zona = unidecode(
                zona.lower().replace(" ", "-").replace("residencial", "")
            )
            tipo_dominante = "casa"

            if zona == "Providencia":
                secciones = ["1a-secc", "2a-secc", "3a-secc", "4a-secc", "5a-secc"]
                precios_m2_secciones = []

                for seccion in secciones:
                    slug_seccion = unidecode(f"providencia-{seccion}")
                    precios_por_tipo = scrap_propiedades(
                        slug_seccion,
                        ciudad,
                        debug=False,
                        tipos_permitidos=["casa", "departamento"],
                    )

                    tipo_precios = precios_por_tipo.get(tipo_dominante)
                    if isinstance(tipo_precios, list) and tipo_precios:
                        try:
                            promedio = sum(tipo_precios) / len(tipo_precios)
                            precio_m2_seccion = Decimal(str(round(promedio, 2)))
                            precios_m2_secciones.append(precio_m2_seccion)
                            print(
                                f"[✅] Precio promedio en Providencia {seccion.upper()} para {tipo_dominante}: ${precio_m2_seccion} MXN/m² con {len(tipo_precios)} propiedades"
                            )
                        except Exception as e:
                            print(f"[!] Error al calcular promedio en {seccion}: {e}")
                    else:
                        print(
                            f"[!] No hay datos válidos de tipo '{tipo_dominante}' en Providencia {seccion.upper()}"
                        )

                if precios_m2_secciones:
                    promedio_total = sum(precios_m2_secciones) / len(
                        precios_m2_secciones
                    )
                    precio_m2 = Decimal(str(round(promedio_total, 2)))
                    print(
                        f"[✓] Precio estimado por m² para '{zona}': ${precio_m2} MXN/m² ({tipo_dominante})"
                    )
                else:
                    precio_m2 = Decimal(str(precios_m2_default[zona]))
                    print(
                        f"[!] Usando precio por defecto para '{zona}': ${precio_m2} MXN/m²"
                    )
            else:
                precios_por_tipo = scrap_propiedades(
                slug_zona,
                ciudad,
                debug=False,
                tipos_permitidos=["casa", "departamento"],
            )

            for tipo in ["casa", "departamento"]:
                tipo_precios = precios_por_tipo.get(tipo)
                if isinstance(tipo_precios, list) and tipo_precios:
                    try:
                        promedio = sum(tipo_precios) / len(tipo_precios)
                        precio_m2 = Decimal(str(round(promedio, 2)))
                        print(f"[✓] Precio estimado por m² para '{zona}' ({tipo}): ${precio_m2} MXN/m²")
                        break
                    except Exception as e:
                        print(f"[!] Error calculando promedio para {zona}: {e}")
                        continue
            else:
                precio_m2 = Decimal(str(precios_m2_default[zona]))
                print(f"[!] Usando precio por defecto para '{zona}': ${precio_m2} MXN/m²")

            precios_m2_zonas[zona] = precio_m2

            historico_csv.append(
                {
                    "zona": zona,
                    "precio_m2": float(precio_m2),
                    "fuente": "propiedades.com",
                    "fecha": datetime.now().strftime("%Y-%m-%d %H:%M"),
                }
            )

            if not dry_run:
                try:
                    cur.execute(
                        """
                        INSERT INTO zonas (nombre, precio_m2)
                        VALUES (%s, %s)
                        ON CONFLICT (nombre) DO UPDATE
                        SET precio_m2 = EXCLUDED.precio_m2, actualizacion = NOW()
                    """,
                        (zona, precio_m2),
                    )

                    cur.execute(
                        """
                        INSERT INTO historico_precios (zona, precio_m2, fuente)
                        VALUES (%s, %s, %s)
                    """,
                        (zona, precio_m2, "propiedades.com"),
                    )

                except Exception as e:
                    logging.error(f"Error al insertar en DB zona {zona}: {e}")

        if export_csv:
            with open(
                "historico_plusvalia.csv", "w", newline="", encoding="utf-8"
            ) as f:
                writer = csv.DictWriter(
                    f, fieldnames=["zona", "precio_m2", "fuente", "fecha"]
                )
                writer.writeheader()
                writer.writerows(historico_csv)
            print("📁 CSV de precios promedio guardado como 'historico_plusvalia.csv'")

        if not dry_run:
            cur.execute(
                "SELECT id, area, ubicacion, valor_inicial, precio FROM propiedades"
            )
            propiedades = cur.fetchall()

        actualizadas = 0
        print("\n🏗️  Calculando plusvalía por propiedad...\n")

        for id_prop, area, ubicacion, valor_inicial, precio in propiedades:
            if not area or not valor_inicial or not precio:
                print(f"[!] Propiedad ID {id_prop} tiene datos faltantes.")
                continue

            zona = extraer_zona(ubicacion, list(precios_m2_zonas.keys()))
            if not zona:
                print(f"[!] Zona no reconocida para propiedad ID {id_prop}")
                continue

            ciudad = (
                ubicacion.split(",")[1].strip() if "," in ubicacion else "Desconocida"
            )
            print("Ciudad: ", ciudad)

            valor_estimado = area * precios_m2_zonas[zona]
            # ... (todo tu código arriba sin cambios)

            plusvalia = calcular_plusvalia(valor_inicial, valor_estimado)
            if plusvalia is None:
                logging.warning(
                    f"No se pudo calcular la plusvalía para la propiedad ID {id_prop}"
                )
                continue

            if plusvalia < 0:
                logging.warning(
                    f"⚠️ Plusvalía negativa para propiedad ID {id_prop}: {plusvalia:.2f}%"
                )
                continue

            if plusvalia > 300:
                logging.warning(
                    f"⚠️ Plusvalía demasiado alta para propiedad ID {id_prop}: {plusvalia:.2f}% (posible dato anómalo)"
                )

            if not dry_run:
                try:
                    geo = geolocalizar_direccion(ubicacion)
                    lat, lon, codigo_postal = (
                        geo.get("lat"),
                        geo.get("lon"),
                        geo.get("codigo_postal"),
                    )

                    cur.execute("""
                        UPDATE propiedades
                        SET valor_actual = %s,
                            valor_estimado = %s,
                            plusvalia = %s,
                            lat = %s,
                            lon = %s,
                            codigo_postal = %s
                        WHERE id = %s
                    """, (
                        valor_estimado,  # ✅ valor_actual basado en precios m2
                        valor_estimado,
                        plusvalia,
                        lat,
                        lon,
                        codigo_postal,
                        id_prop,
                    ))

                    actualizadas += 1
                except Exception as e:
                    logging.error(f"Error actualizando propiedad ID {id_prop}: {e}")

            print(
                f"[✓] ID {id_prop} ({zona}, {ciudad}): actual=${valor_estimado:,.2f}, estimado=${valor_estimado:,.2f}, plusvalía={plusvalia:.2f}%"
            )

        if not dry_run:
            conn.commit()
            print(f"\n✅ Total de propiedades actualizadas: {actualizadas}")

    except Exception as e:
        logging.error(f"❌ Error general: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ejecutar en modo simulación (sin escribir en DB)",
    )
    parser.add_argument(
        "--export-csv", action="store_true", help="Exportar histórico de zonas a CSV"
    )
    args = parser.parse_args()

    actualizar_plusvalia_db(dry_run=args.dry_run, export_csv=args.export_csv)
