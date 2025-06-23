from flask import Blueprint, request, jsonify
from db import get_connection
from datetime import datetime
from utils.utils import token_required  

actividades_bp = Blueprint("actividades", __name__)

@actividades_bp.route("/api/actividad", methods=["POST"])
@token_required
def agregar_actividad(user_id):
    try:
        data = request.get_json()
        tipo = data.get("activityType")
        descripcion = data.get("description")
        fecha = datetime.utcnow()

        if not tipo or not descripcion:
            return jsonify({"error": "Faltan campos requeridos"}), 400

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO actividades (userid, tipo, descripcion, fecha)
            VALUES (%s, %s, %s, %s)
        """, (user_id, tipo, descripcion, fecha))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"mensaje": "Actividad registrada"}), 201

    except Exception as e:
        print("Error al guardar actividad:", e)
        return jsonify({"error": "Error interno al guardar actividad"}), 500

@actividades_bp.route("/api/actividad", methods=["GET"])
@token_required
def obtener_actividades(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT tipo, descripcion, fecha
            FROM actividades
            WHERE userid = %s
            ORDER BY fecha DESC
        """, (user_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        actividades = [
            {"activityType": row[0], "description": row[1], "timestamp": row[2].isoformat()}
            for row in rows
        ]

        return jsonify(actividades), 200

    except Exception as e:
        print("Error al obtener actividades:", e)
        return jsonify({"error": "Error interno al obtener actividades"}), 500