from flask import Blueprint, jsonify, request
from db import get_connection
from unidecode import unidecode

zonas_bp = Blueprint("zonas", __name__)

@zonas_bp.route("/api/zonas/historico", methods=["GET"])
def get_historico_precios():
    conn, cur = None, None
    try:
        zona_param_raw = request.args.get("zona", "")
        zona_param = unidecode(zona_param_raw).lower()

        conn = get_connection()
        cur = conn.cursor()

        # Obtener todo el histórico agrupado por zona y fecha
        cur.execute("""
            SELECT zona, AVG(precio_m2) as precio_m2, MAX(fuente) as fuente, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha
            FROM historico_precios
            GROUP BY zona, fecha
            ORDER BY zona, fecha
        """)
        rows = cur.fetchall()

        # Agrupar por zona original
        historico = {}
        for zona, precio_m2, fuente, fecha in rows:
            if zona not in historico:
                historico[zona] = []
            historico[zona].append({
                "precio_m2": float(precio_m2),
                "fecha": fecha,
                "fuente": fuente
            })

        # Si se busca una zona específica
        if zona_param:
            resultado = {}
            for zona_original in historico:
                zona_normalizada = unidecode(zona_original).lower()
                if zona_normalizada == zona_param:
                    resultado[zona_original] = historico[zona_original]
                    print(f"⚙️ Coincidencia encontrada: {zona_original}")
                    break
            return jsonify(resultado)

        return jsonify(historico)

    except Exception as e:
        print(f"❌ Error al obtener histórico: {e}")
        return jsonify({"error": "Error al obtener histórico"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()