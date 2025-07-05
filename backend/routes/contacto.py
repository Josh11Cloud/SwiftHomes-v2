from flask import Blueprint, request, jsonify
from db import get_connection
import re

contacto_bp = Blueprint("contacto", __name__)

def validar_email(email):
    patron = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(patron, email))

@contacto_bp.route('/api/contacto', methods=['POST'])
def recibir_lead():
    conn = get_connection()
    data = request.get_json()
    nombre = data.get('name')
    email = data.get('email')
    tipo_consulta = data.get('tipoConsulta')
    mensaje = data.get('message')
    fecha = data.get('fecha')

    if not nombre or not email or not mensaje:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if not validar_email(email):
        return jsonify({"error": "Email inválido"}), 400

    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO leads (nombre, email, tipo_consulta, mensaje, fecha)
                VALUES (%s, %s, %s, %s, %s)
            """, (nombre, email, tipo_consulta, mensaje, fecha))
            conn.commit()
        return jsonify({"mensaje": "Lead recibido correctamente"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Error al guardar lead", "detalle": str(e)}), 500