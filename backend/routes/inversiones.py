from flask import Blueprint, jsonify, request
from db import get_connection

inversiones_bp = Blueprint("inversiones", __name__)

@inversiones_bp.route("/api/inversiones", methods=["GET"])
def obtener_inversiones():
    tipo = request.args.get("tipo")
    conn = get_connection()
    cur = conn.cursor()

    if tipo:
        cur.execute("""
            SELECT id, titulo, valor_inicial, valor_actual, tipo_inversion,
                   ROUND((valor_actual - valor_inicial) / valor_inicial * 100, 2) AS plusvalia
            FROM propiedades
            WHERE tipo_inversion = %s
        """, (tipo,))
    else:
        cur.execute("""
            SELECT id, titulo, valor_inicial, valor_actual, tipo_inversion,
                   ROUND((valor_actual - valor_inicial) / valor_inicial * 100, 2) AS plusvalia
            FROM propiedades
        """)

    rows = cur.fetchall()
    conn.close()

    propiedades = [
        {
            "id": r[0],
            "titulo": r[1],
            "valor_inicial": float(r[2]),
            "valor_actual": float(r[3]),
            "tipo_inversion": r[4],
            "plusvalia": float(r[5])
        }
        for r in rows
    ]
    return jsonify(propiedades)