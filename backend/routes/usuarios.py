from flask import Blueprint, jsonify
from db import get_connection

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/api/usuarios/<int:userid>", methods=["GET"])
def obtener_usuario_por_id(userid):
    try:
        conn = get_connection()
        cur = conn.cursor()

        query = """
            SELECT *
            FROM usuarios
            WHERE userid = %s
        """

        cur.execute(query, (userid,))
        usuario = cur.fetchone()

        if not usuario:
            return jsonify({"mensaje": "Usuario no encontrado"}), 404

        keys = [desc[0] for desc in cur.description]
        usuario_dict = dict(zip(keys, usuario))

        for key, value in usuario_dict.items():
            if isinstance(value, (bytes, memoryview)):
                usuario_dict[key] = value.decode('utf-8') if isinstance(value, bytes) else value.tobytes().decode('utf-8')

        calificacion = usuario_dict.get('calificacion', 0)
        estrellas_llenas = int(calificacion)
        estrellas_vacias = 5 - estrellas_llenas

        usuario_dict['estrellas'] = {
            'llenas': estrellas_llenas,
            'vacias': estrellas_vacias
        }

        cur.close()
        conn.close()

        return jsonify(usuario_dict), 200

    except ValueError as e:
        return jsonify({"error": f"Error de validación: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500