from flask import Blueprint, jsonify
from db import get_connection

roi_bp = Blueprint("roi", __name__)

@roi_bp.route("/api/roi/<int:propiedad_id>", methods=["GET"])
def calcular_roi(propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT precio, ingresos_mensuales, gastos_anuales
            FROM propiedades
            WHERE id = %s
        """, (propiedad_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Propiedad no encontrada"}), 404

        precio, ingresos_mensuales, gastos_anuales = row

        if precio is None or ingresos_mensuales is None:
            return jsonify({
                "error": "Datos insuficientes para calcular ROI",
                "faltantes": {
                    "precio": precio is None,
                    "ingresos_mensuales": ingresos_mensuales is None
                }
            }), 400

        ingreso_anual = ingresos_mensuales * 12
        utilidad_anual = ingreso_anual - (gastos_anuales or 0)

        if utilidad_anual <= 0:
            roi = 0
            payback_years = None
        else:
            roi = round((utilidad_anual / precio) * 100, 2)
            payback_years = round(precio / utilidad_anual, 2)

        if payback_years is not None:
            cur.execute("""
                UPDATE propiedades
                SET paybackyears = %s
                WHERE id = %s
            """, (payback_years, propiedad_id))
            conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "roi_anual": roi,
            "payback_years": payback_years,
            "ingreso_anual": ingreso_anual,
            "utilidad_anual": utilidad_anual
        }), 200

    except Exception as e:
        print("Error al calcular ROI:", e)
        return jsonify({"error": "Error interno al calcular ROI"}), 500