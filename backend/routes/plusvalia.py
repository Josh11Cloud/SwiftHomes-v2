from flask import Blueprint, jsonify
from db import get_connection
from datetime import datetime
import subprocess

plusvalia_bp = Blueprint("plusvalia", __name__)

def calcular_valor_estimado(propiedad):
    anio_actual = 2025
    anos_transcurridos = anio_actual - propiedad["anio_compra"]
    tasa_crecimiento_anual = (1 + float(propiedad["plusvalia"]) / 100) ** (1 / anos_transcurridos) - 1
    valor_estimado = float(propiedad["valor_actual"]) * (1 + tasa_crecimiento_anual) ** 10
    return valor_estimado

@plusvalia_bp.route("/api/plusvalia/actualizar_plusvalia", methods=["POST"])
def ejecutar_actualizacion_plusvalia():
    try:
        resultado = subprocess.run(
            ["python", "scripts/actualizar_plusvalia.py"],
            capture_output=True,
            text=True,
            check=True
        )
        return jsonify({
            "status": "success",
            "output": resultado.stdout
        })
    except subprocess.CalledProcessError as e:
        print(f"[!] Error al ejecutar script: {e.stderr}")
        return jsonify({
            "status": "error",
            "error": e.stderr
        }), 500

@plusvalia_bp.route("/api/plusvalia/<int:propiedad_id>", methods=["GET"])
def obtener_propiedad(propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, nombre, valor_inicial, valor_actual, plusvalia, anio_compra
            FROM propiedades
            WHERE id = %s
        """, (propiedad_id,))
        resultado = cur.fetchone()

        if not resultado:
            return jsonify({"error": "Propiedad no encontrada"}), 404

        id_prop, nombre, valor_inicial, valor_actual, plusvalia, anio_compra = resultado

        propiedad_dict = {
            "id": id_prop,
            "nombre": nombre,
            "valor_inicial": float(valor_inicial),
            "valor_actual": float(valor_actual),
            "plusvalia": float(plusvalia) * 100,
            "anio_compra": anio_compra,
            "valor_estimado": calcular_valor_estimado({
                "anio_compra": anio_compra,
                "valor_actual": valor_actual,
                "plusvalia": round(float(plusvalia) * 100, 2)
            })
        }

        return jsonify(propiedad_dict)

    except Exception as e:
        print(f"[!] Error al obtener propiedad: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@plusvalia_bp.route("/api/plusvalia", methods=["GET"])
def obtener_propiedades():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nombre, valor_inicial, valor_actual, plusvalia, anio_compra
            FROM propiedades
            WHERE plusvalia IS NOT NULL
        """)
        propiedades = cur.fetchall()

        resultado = []
        for prop in propiedades:
            id_prop, nombre, inicial, actual, plusvalia, anio_compra = prop
            propiedad_dict = {
                "id": id_prop,
                "nombre": nombre,
                "valor_inicial": float(inicial),
                "valor_actual": float(actual),
                "plusvalia": round(float(plusvalia) * 100, 2),
                "anio_compra": anio_compra,
                "valor_estimado": calcular_valor_estimado({
                    "anio_compra": anio_compra,
                    "valor_actual": actual,
                    "plusvalia": round(float(plusvalia) * 100, 2)
                })
            }
            resultado.append(propiedad_dict)

        return jsonify(resultado)

    except Exception as e:
        print(f"[!] Error al obtener propiedades: {e}")
        return jsonify({"error": "Error interno"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@plusvalia_bp.route("/api/plusvalia/detallado/<int:propiedad_id>", methods=["GET"])
def obtener_tabla_plusvalia(propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT valor_inicial, valor_actual, anio_compra, plusvalia
            FROM propiedades
            WHERE id = %s
        """, (propiedad_id,))
        resultado = cur.fetchone()

        if not resultado:
            return jsonify({"error": "Propiedad no encontrada"}), 404

        valor_inicial, valor_actual, anio_compra, plusvalia = resultado
        anio_actual = 2025
        anos_transcurridos = anio_actual - anio_compra
        tasa_crecimiento_anual = (1 + float(plusvalia) / 100) ** (1 / anos_transcurridos) - 1

        tabla = []
        valor = float(valor_actual)

        for i in range(11):
            valor_futuro = valor * (1 + tasa_crecimiento_anual) ** i
            plusvalia_acumulada = ((valor_futuro / float(valor_inicial)) - 1) * 100
            tabla.append({
                "anio": anio_actual + i,
                "valor": round(valor_futuro, 2),
                "plusvalia_acumulada": round(plusvalia_acumulada, 2)
            })

        return jsonify(tabla)

    except Exception as e:
        print(f"[!] Error al generar tabla de plusvalía: {e}")
        return jsonify({"error": "Error interno"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()