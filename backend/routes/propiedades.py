from flask import Blueprint, jsonify, request
from db import get_connection
import json
from functools import wraps
import jwt
import os
from jwt import ExpiredSignatureError, InvalidTokenError
from dotenv import load_dotenv

propiedades_bp = Blueprint("propiedades", __name__)
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

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

def error_response(message="Error interno", status=500):
    return jsonify({"error": message}), status

@propiedades_bp.route("/api/propiedades", methods=["GET"])
def obtener_propiedades(user_id=None):
    try:
        conn = get_connection()
        cur = conn.cursor()

        filtros = {
            'category': request.args.get('category', 'venta'),
            'min_price': int(request.args.get('minPrice', 0)),
            'max_price': int(request.args.get('maxPrice', 1000000000)),
            'texto': request.args.get("texto"),
            'ubicacion': request.args.get('ubicacion', ''),
            'property_type': request.args.get('propertyType', ''),
            'superficie_min': request.args.get('superficieMin', ''),
            'superficie_max': request.args.get('superficieMax', ''),
            'antiguedad': request.args.get('antiguedad', ''),
            'piscina': request.args.get('piscina', '') == 'true',
            'seguridad': request.args.get('seguridad', '') == 'true',
            'financiamiento': request.args.get('financiamiento', '') == 'true'
        }

        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))

        if page < 1 or limit < 1:
            return error_response("Los parámetros page y limit deben ser números enteros positivos", 400)
        
        offset = (page - 1) * limit
        sort_order = request.args.get('sortOrder', '')

        def construir_query(filtros, user_id=None, query_type="select"):
            params = []
            join = ""
            where = ""

            if user_id and query_type == "select":
                join = "LEFT JOIN favoritos f ON p.id = f.propiedadid AND f.userid = %s"
                params.insert(0, user_id)

            conditions = []

            if filtros['texto']:
                conditions.append("(p.nombre ILIKE %s OR p.descripcion ILIKE %s)")
                params.extend([f"%{filtros['texto']}%", f"%{filtros['texto']}%"])

            if filtros['category']:
                conditions.append("p.categoria = %s")
                params.append(filtros['category'])

            if filtros['min_price']:
                conditions.append("p.precio >= %s")
                params.append(filtros['min_price'])

            if filtros['max_price']:
                conditions.append("p.precio <= %s")
                params.append(filtros['max_price'])

            if filtros['ubicacion']:
                conditions.append("LOWER(p.ubicacion) LIKE %s")
                params.append(f"%{filtros['ubicacion'].lower()}%")

            if filtros['property_type']:
                conditions.append("LOWER(p.tipo) = %s")
                params.append(filtros['property_type'].lower())

            if filtros['superficie_min']:
                conditions.append("p.area >= %s")
                params.append(filtros['superficie_min'])

            if filtros['superficie_max']:
                conditions.append("p.area <= %s")
                params.append(filtros['superficie_max'])

            if filtros['antiguedad']:
                if filtros['antiguedad'] == "0-5":
                    conditions.append("p.antiguedad <= 5")
                elif filtros['antiguedad'] == "5-10":
                    conditions.append("p.antiguedad > 5 AND p.antiguedad <= 10")
                elif filtros['antiguedad'] == "10+":
                    conditions.append("p.antiguedad > 10")

            if filtros['piscina']:
                conditions.append("'piscina' = ANY(p.servicios)")

            if filtros['seguridad']:
                conditions.append("'seguridad' = ANY(p.servicios)")

            if filtros['financiamiento']:
                conditions.append("p.financiamiento = TRUE")

            if 'investment' in request.args and request.args.get('investment') == 'true':
                conditions.append("p.isinvestment = TRUE")

            if conditions:
                where = "WHERE " + " AND ".join(conditions)

            if query_type == "select":
                if user_id:
                    query = f"""
                        SELECT p.*, 
                        (f.id IS NOT NULL) AS isFavorited
                        FROM propiedades p
                        {join}
                        {where}
                    """
                else:
                    query = f"""
                        SELECT p.*, 
                        NULL AS isFavorited
                        FROM propiedades p
                        {where}
                    """
                if sort_order in ['asc', 'desc']:
                    query += f" ORDER BY p.precio {sort_order.upper()}"
                query += " LIMIT %s OFFSET %s"
                if user_id:
                    params.extend([limit, offset])
                else:
                    params.extend([limit, offset])
            elif query_type == "count":
                query = f"SELECT COUNT(*) FROM propiedades p {where}"
            return query, params

        query, params = construir_query(filtros)
        cur.execute(query, tuple(params))
        propiedades = cur.fetchall()

        keys = [desc[0] for desc in cur.description]
        propiedades_dicts = [dict(zip(keys, row)) for row in propiedades]

        count_query, count_params = construir_query(filtros, query_type="count")
        cur.execute(count_query, tuple(count_params))
        total = cur.fetchone()[0]

        cur.close()
        conn.close()

        return jsonify({
            "properties": propiedades_dicts,
            "total": total,
            "page": page,
            "limit": limit
        }), 200

    except ValueError as e:
        return error_response(f"Error de validación: {str(e)}", 400)
    except Exception as e:
        print("Error:", str(e))
        return error_response(f"Error interno: {str(e)}", 500)

@propiedades_bp.route("/api/propiedades/<int:propiedad_id>", methods=["GET"])
@token_required
def obtener_propiedad_por_id(user_id, propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM propiedades WHERE id = %s AND userid = %s", (propiedad_id, str(user_id)))
        propiedad = cur.fetchone()

        if not propiedad:
            return jsonify({"mensaje": "Propiedad no encontrada"}), 404

        keys = [desc[0] for desc in cur.description]
        propiedad_dict = dict(zip(keys, propiedad))

        cur.close()
        conn.close()

        return jsonify(propiedad_dict), 200

    except ValueError as e:
        return error_response(f"Error de validación: {str(e)}", 400)
    except Exception as e:
        return error_response(f"Error interno: {str(e)}", 500)

@propiedades_bp.route("/api/propiedades/<int:propiedad_id>", methods=["PUT"])
@token_required
def editar_propiedad(user_id, propiedad_id):
    try:
        data = request.get_json()
        conn = get_connection()
        cur = conn.cursor()

        print("Propiedad ID:", propiedad_id)
        print("User ID:", user_id)
        print("Data:", data)

        cur.execute("SELECT * FROM propiedades WHERE id = %s AND userid = %s", (propiedad_id, str(user_id)))
        propiedad = cur.fetchone()
        if not propiedad:
            return jsonify({"error": "Propiedad no encontrada o acceso denegado"}), 404

        # Lista de campos editables
        campos = ["nombre", "precio", "renta", "tipo", "habitaciones", "banos", "area", "estacionamientos", 
        "descripcion", "categoria","antiguedad", 
        "financiamiento", "servicios", "remodelar", "precionegociable", "seguridad", "piscina", 
        "imagen", "status", "fecha", "visitas"]

        actualizaciones = []
        valores = []

        for campo in campos:
            if campo in data:
                actualizaciones.append(f"{campo} = %s")
                if campo == "visitas":
                    valores.append(json.dumps(data[campo]))
                else:
                    valores.append(data[campo])

        if not actualizaciones:
            return jsonify({"mensaje": "Ningún campo para actualizar"}), 400

        query = f"UPDATE propiedades SET {', '.join(actualizaciones)} WHERE id = %s AND userid = %s"
        valores.extend([propiedad_id, str(user_id)])

        cur.execute(query, tuple(valores))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"mensaje": "Propiedad actualizada correctamente"}), 200

    except ValueError as e:
        return error_response(f"Error de validación: {str(e)}", 400)
    except Exception as e:
        return error_response(f"Error interno: {str(e)}", 500)
    
@propiedades_bp.route("/api/propiedades/<int:propiedad_id>", methods=["DELETE"])
@token_required
def eliminar_propiedad(user_id, propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM propiedades WHERE id = %s AND userid = %s", (propiedad_id, str(user_id)))
        propiedad = cur.fetchone()

        if not propiedad:
            return jsonify({"error": "Propiedad no encontrada o acceso denegado"}), 404

        cur.execute("DELETE FROM propiedades WHERE id = %s AND userid = %s", (propiedad_id, str(user_id)))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"mensaje": "Propiedad eliminada correctamente"}), 200

    except Exception as e:
        import traceback
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500