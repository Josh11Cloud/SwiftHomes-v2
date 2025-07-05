from flask import Blueprint, jsonify, request
from db import get_connection
from unidecode import unidecode

zonas_bp = Blueprint("zonas", __name__)

@zonas_bp.route("/api/zonas/historico", methods=["GET"])
def get_historico_precios():
    conn, cur = None, None
    try:
        zona_param = request.args.get("zona")
        if zona_param:
            zona_param = unidecode(zona_param).lower()

        conn = get_connection()
        cur = conn.cursor()

        if zona_param:
            cur.execute("""
                SELECT zona, AVG(precio_m2) as precio_m2, MAX(fuente) as fuente, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha
                FROM historico_precios
                GROUP BY zona, fecha
                ORDER BY fecha
            """)
        else:
            cur.execute("""
                SELECT zona, AVG(precio_m2) as precio_m2, MAX(fuente) as fuente, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha
                FROM historico_precios
                GROUP BY zona, fecha
                ORDER BY zona, fecha
            """)

        rows = cur.fetchall()
        historico = {}

        for zona, precio_m2, fuente, fecha in rows:
            clave = unidecode(zona).lower()
            if zona_param and clave != zona_param:
                continue
            if zona not in historico:
                historico[zona] = []
            historico[zona].append({
                "precio_m2": float(precio_m2),
                "fecha": fecha,
                "fuente": fuente
            })

        return jsonify(historico)

    except Exception as e:
        print(f"❌ Error al obtener histórico: {e}")
        return jsonify({"error": "Error al obtener histórico"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()