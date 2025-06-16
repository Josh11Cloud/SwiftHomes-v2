from flask import Blueprint, jsonify, request
from db import get_connection
from functools import wraps
import jwt

favoritos_bp = Blueprint("favoritos", __name__)

SECRET_KEY = "swifthomesdavid1010"

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return jsonify({"error": "Token faltante"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data["userid"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        return f(user_id, *args, **kwargs)
    return decorated_function

@favoritos_bp.route("/api/favoritos", methods=["POST"])
@token_required
def agregar_favorito(user_id):
    try:
        data = request.get_json()
        propiedad_id = data.get("propiedadid")

        if not isinstance(propiedad_id, int) or propiedad_id <= 0:
            return jsonify({"error": "ID de propiedad inválido"}), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM favoritos WHERE userid = %s AND propiedadid = %s", (user_id, propiedad_id))
        if cur.fetchone():
            return jsonify({"mensaje": "Ya está en favoritos"}), 200

        cur.execute(
            "INSERT INTO favoritos (userid, propiedadid) VALUES (%s, %s)",
            (user_id, propiedad_id)
        )
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"mensaje": "Agregado a favoritos"}), 201

    except Exception as e:
        print("Error al agregar favorito:", e)
        return jsonify({"error": "Error interno"}), 500
    
@favoritos_bp.route("/api/favoritos", methods=["GET"])
@token_required
def ver_favoritos(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT p.* FROM propiedades p
            JOIN favoritos f ON p.id = f.propiedadid
            WHERE f.userid = %s
        """, (user_id,))
        favoritos = cur.fetchall()

        columnas = [desc[0] for desc in cur.description]
        resultado = [dict(zip(columnas, fila)) for fila in favoritos]

        cur.close()
        conn.close()

        return jsonify(resultado), 200

    except Exception as e:
        print("Error al obtener favoritos:", e)
        return jsonify({"error": "Error interno"}), 500

@favoritos_bp.route("/api/favoritos/<int:propiedad_id>", methods=["DELETE"])
@token_required
def quitar_favorito(user_id, propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM favoritos WHERE userid = %s AND propiedadid = %s", (user_id, propiedad_id))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"mensaje": "Favorito eliminado"}), 200

    except Exception as e:
        print("Error al eliminar favorito:", e)
        return jsonify({"error": "Error interno"}), 500