from flask import Blueprint, jsonify
from db import get_connection
from utils.roi_utils import calcular_metricas

roi_bp = Blueprint("roi", __name__)

@roi_bp.route("/api/roi/<int:propiedad_id>", methods=["GET"])
def calcular_roi(propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT precio, ingresos_mensuales, gastos_anuales, isInvestment
            FROM propiedades
            WHERE id = %s
        """, (propiedad_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Propiedad no encontrada"}), 404

        precio, ingresos_mensuales, gastos_anuales, is_investment = row

        if not is_investment:
            return jsonify({"error": "La propiedad no es una inversión"}), 400

        if precio is None or ingresos_mensuales is None or gastos_anuales is None:
            return jsonify({
                "error": "Datos insuficientes para calcular ROI",
                "faltantes": {
                    "precio": precio is None,
                    "ingresos_mensuales": ingresos_mensuales is None,
                    "gastos_anuales": gastos_anuales is None
                }
            }), 400

        resultados = calcular_metricas(precio, ingresos_mensuales, gastos_anuales)

        cur.execute("""
            UPDATE propiedades
            SET paybackyears = %s
            WHERE id = %s
        """, (resultados["payback_years"], propiedad_id))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify(resultados), 200

    except Exception as e:
        print("Error al calcular ROI:", e)
        return jsonify({"error": "Error interno al calcular ROI"}), 500
        
@roi_bp.route("/api/roi/promedio", methods=["GET"])
def calcular_roi_promedio():
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT precio, ingresos_mensuales, gastos_anuales
            FROM propiedades
            WHERE precio IS NOT NULL AND ingresos_mensuales IS NOT NULL AND isInvestment = true
        """)
        rows = cur.fetchall()

        total_roi = 0
        total_payback_years = 0
        count = 0

        for row in rows:
            resultado = calcular_metricas(*row[:3])

            if resultado["payback_years"] is not None:
                total_roi += resultado["roi"]
                total_payback_years += resultado["payback_years"]
                count += 1

        if count == 0:
            return jsonify({"error": "No hay propiedades de inversión con datos suficientes"}), 400

        avg_roi = round(total_roi / count, 2)
        avg_payback_years = round(total_payback_years / count, 2)

        return jsonify({
            "avg_roi": avg_roi,
            "avg_payback_years": avg_payback_years,
            "total_propiedades_validas": count
        }), 200

    except Exception as e:
        print("Error al calcular ROI promedio:", e)
        return jsonify({"error": "Error interno al calcular ROI promedio"}), 500