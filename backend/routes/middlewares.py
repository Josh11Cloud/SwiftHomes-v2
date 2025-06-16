from flask import request, jsonify
import jwt

SECRET_KEY = "swifthomesdavid1010"

def token_required(f):
    def wrapper(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"error": "Token requerido"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = data["user_id"]
        except:
            return jsonify({"error": "Token inválido o expirado"}), 401

        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper