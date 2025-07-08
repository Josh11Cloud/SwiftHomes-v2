from flask import Blueprint, request, jsonify
from db import get_connection
import bcrypt
import jwt
from functools import wraps
import datetime
from flask_cors import CORS
import re
import os

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = os.getenv("SECRET_KEY")

@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    print("Datos recibidos:", data)
    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")
    imagen = data.get("imagen")

    if not all([nombre, email, password, imagen]):
        return jsonify({"error": "Faltan campos"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Correo electrónico inválido"}), 400

    if len(password) < 8:
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    print(bcrypt.checkpw(password.encode("utf-8"), hashed_password))

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO usuarios (nombre, email, password, imagen, role)
            VALUES (%s, %s, %s, %s, 'usuario')
        """, (nombre, email, hashed_password, imagen))
        conn.commit()
        return jsonify({"message": "Usuario registrado con éxito"}), 201
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Correo ya registrado o error interno"}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT userid, password FROM usuarios WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    userid, hashed_pw = user

    if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw.tobytes()):
        return jsonify({"error": "Contraseña incorrecta"}), 401

    access_token = jwt.encode({
        "userid": userid,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }, SECRET_KEY, algorithm="HS256")

    refresh_token = jwt.encode({
        "userid": userid,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }, SECRET_KEY, algorithm="HS256")

    print("Usuario:", email)
    print("Hash desde la DB:", hashed_pw)
    print("Password ingresada:", password)
    print("Resultado comparación:", bcrypt.checkpw(password.encode("utf-8"), hashed_pw.tobytes()))


    return jsonify({"access_token": access_token, "refresh_token": refresh_token})
    
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
            userid = data["userid"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        return f(userid, *args, **kwargs)
    return decorated_function

revoked_tokens = set()

@auth_bp.route("/api/logout", methods=["POST"])
@token_required
def logout(userid):
    refresh_token = request.json.get("refresh_token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO revoked_tokens (token) VALUES (%s)", (refresh_token,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Sesión cerrada con éxito"}), 200

@auth_bp.route("/api/refresh-token", methods=["POST"])
def refresh_token():
    refresh_token = request.json.get("refresh_token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM revoked_tokens WHERE token = %s", (refresh_token,))
    if cursor.fetchone():
        return jsonify({"error": "Token de refresco revocado"}), 401

    try:
        data = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        user_id = data["userid"]

        access_token = jwt.encode({
            "userid": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"access_token": access_token})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token de refresco expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token de refresco inválido"}), 401

@auth_bp.route("/api/profile", methods=["GET"])
@token_required
def get_profile(userid):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT userid, nombre, email, imagen, role FROM usuarios WHERE userid = %s", (userid,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    userid, nombre, email, imagen, role = user
    cursor.close()
    conn.close()
    return jsonify({
        "userid": userid,
        "nombre": nombre,
        "email": email,
        "imagen": imagen,
        "role": role
    }), 200

@auth_bp.route("/api/profile/update", methods=["PUT"])
@token_required
def update_profile(userid):
    data = request.get_json()
    nuevo_nombre = data.get("nombre")
    nuevo_email = data.get("email")
    nueva_imagen = data.get("imagen")

    if not nuevo_nombre or not nuevo_email:
        return jsonify({"error": "Nombre y email son requeridos"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE usuarios
            SET nombre = %s, email = %s, imagen = %s
            WHERE userid = %s
        """, (nuevo_nombre, nuevo_email, nueva_imagen, userid))
        conn.commit()

        return jsonify({"message": "Perfil actualizado con éxito"}), 200

    except Exception as e:
        print("Error al actualizar perfil:", str(e))
        return jsonify({"error": "Error interno al actualizar"}), 500

    finally:
        cursor.close()
        conn.close()

@auth_bp.route("/api/profile/delete", methods=["DELETE"])
@token_required
def delete_profile(userid):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM usuarios WHERE userid = %s", (userid,))
        conn.commit()
        return jsonify({"message": "Cuenta eliminada con éxito"}), 200

    except Exception as e:
        print("Error al eliminar cuenta:", str(e))
        return jsonify({"error": "Error interno al eliminar cuenta"}), 500

    finally:
        cursor.close()
        conn.close()

CORS(auth_bp)