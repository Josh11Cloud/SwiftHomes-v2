from flask import Blueprint, jsonify, request
from db import get_connection
import json
from collections import defaultdict
import os
from dotenv import load_dotenv
from datetime import datetime
from utils.utils import token_required

def error_response(message, status_code):
    return jsonify({"error": message}), status_code

propiedades_bp = Blueprint("propiedades", __name__)
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

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
                conditions.append("p.ubicacion ILIKE %s")
                params.append(f"%{filtros['ubicacion']}%")

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
        }), 200, {'Content-Type': 'application/json; charset=utf-8'}

    except ValueError as e:
        return error_response(f"Error de validación: {str(e)}", 400)
    except Exception as e:
        print("Error:", str(e))
        return error_response(f"Error interno: {str(e)}", 500)

@propiedades_bp.route("/api/propiedades", methods=["POST"])
@token_required
def crear_propiedad(user_id):
    try:
        data = request.get_json()

        # Validar los datos
        required_fields = ["nombre", "precio", "categoria", "userid", "ubicacion", "imagenes"]
        for field in required_fields:
            if field not in data:
                return error_response(f"El campo {field} es requerido", 400)

        # Crear la propiedad
        conn = get_connection()
        cur = conn.cursor()

        query = """
            INSERT INTO propiedades (
                nombre, precio, renta, tipo, habitaciones, banos, area, estacionamientos,
                descripcion, categoria, userid, antiguedad, financiamiento, servicios,
                remodelar, precionegociable, seguridad, piscina, status, fecha, visitas,
                ingresos_mensuales, gastos_anuales, imagenes, ubicacion
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) RETURNING id
        """

        params = (
            data["nombre"],
            data["precio"],
            data.get("renta"),
            data.get("tipo"),
            data.get("habitaciones"),
            data.get("banos"),
            data.get("area"),
            data.get("estacionamientos"),
            data.get("descripcion"),
            data["categoria"],
            data["userid"],
            data.get("antiguedad"),
            data.get("financiamiento", False),
            data.get("servicios", []),
            data.get("remodelar", False),
            data.get("precionegociable", False),
            data.get("seguridad", False),
            data.get("piscina", False),
            "activo",
            datetime.now(),
            [],
            data.get("ingresos_mensuales"),
            data.get("gastos_anuales"),
            data["imagenes"],
            data["ubicacion"]
        )

        cur.execute(query, params)
        propiedad_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"mensaje": "Propiedad creada correctamente", "id": propiedad_id}), 201

    except Exception as e:
        return error_response(f"Error interno: {str(e)}", 500)

@propiedades_bp.route("/api/propiedades/<int:propiedad_id>", methods=["GET"])
def obtener_propiedad_por_id(propiedad_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        query = """
            SELECT p.*, 
            u.nombre AS publicador_nombre,
            u.email AS publicador_email,
            u.telefono AS publicador_telefono,
            u.imagen AS publicador_imagen
            FROM propiedades p
            JOIN usuarios u ON u.userid = p.userid::int
            WHERE p.id = %s
        """

        cur.execute(query, (propiedad_id,))
        propiedad = cur.fetchone()

        if not propiedad:
            return jsonify({"mensaje": "Propiedad no encontrada"}), 404

        keys = [desc[0] for desc in cur.description]
        propiedad_dict = dict(zip(keys, propiedad))

        cur.close()
        conn.close()

        return jsonify(propiedad_dict), 200, {'Content-Type': 'application/json; charset=utf-8'}


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

        return jsonify({"mensaje": "Propiedad actualizada correctamente"}), 200, {'Content-Type': 'application/json; charset=utf-8'}

    except ValueError as e:
        return error_response(f"Error de validación: {str(e)}", 400)
    except Exception as e:
        return error_response(f"Error interno: {str(e)}", 500)

@propiedades_bp.route("/api/mis-propiedades", methods=["GET"])
@token_required
def obtener_mis_propiedades(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM propiedades WHERE userid = %s", (str(user_id),))
        rows = cur.fetchall()
        columnas = [desc[0] for desc in cur.description]

        propiedades = []
        for row in rows:
            propiedad_dict = dict(zip(columnas, row))
            propiedades.append(propiedad_dict)

        cur.close()
        conn.close()
        return jsonify(propiedades), 200, {'Content-Type': 'application/json; charset=utf-8'}

    except Exception as e:
        print("Error al obtener propiedades:", e)
        return error_response("Error al obtener propiedades", 500)

@propiedades_bp.route("/api/propiedades/<int:id>", methods=["DELETE"])
@token_required
def eliminar_propiedad(user_id, id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM propiedades WHERE id = %s AND userid = %s", (id, user_id))
        propiedad = cur.fetchone()

        if not propiedad:
            return jsonify({"error": "Propiedad no encontrada o no autorizada"}), 404

        cur.execute("DELETE FROM propiedades WHERE id = %s", (id,))
        conn.commit()

        cur.close()
        conn.close()
        return jsonify({"mensaje": "Propiedad eliminada"}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    except Exception as e:
        print("Error al eliminar propiedad:", e)
        return error_response("Error al eliminar propiedad", 500)
@propiedades_bp.route('/api/propiedades/estados', methods=['GET'])
@token_required
def obtener_estados_propiedades(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT status, COUNT(*) 
            FROM propiedades 
            WHERE userid = %s 
            GROUP BY status
        """, (str(user_id),))
        rows = cur.fetchall()
        resumen = {estado: cantidad for estado, cantidad in rows}
        return jsonify(resumen)
    except Exception as e:
        print(f"Error en obtener_estados_propiedades: {str(e)}")
        return jsonify({'error': str(e)}), 500
@propiedades_bp.route('/api/propiedades/visitas', methods=['GET'])
@token_required
def obtener_visitas_mensuales(user_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT visitas FROM propiedades WHERE userid = %s", (str(user_id),))
        visitas_raw = cur.fetchall()

        visitas_por_mes = defaultdict(int)
        for (visitas,) in visitas_raw:
            if visitas and 'fecha' in visitas and 'cantidad' in visitas:
                fecha = datetime.fromisoformat(visitas['fecha'])
                mes = fecha.strftime('%b')
                visitas_por_mes[mes] += visitas['cantidad']

        datos = [{"mes": mes, "visitas": cantidad} for mes, cantidad in visitas_por_mes.items()]
        return jsonify(datos), 200, {'Content-Type': 'application/json; charset=utf-8'}
    except Exception as e:
        print(f"Error en obtener_visitas_propiedades: {str(e)}")
        return jsonify({'error': str(e)}), 500
@propiedades_bp.route('/api/propiedades/usuario', methods=['GET'])
@token_required
def obtener_propiedades_usuario(user_id_from_token):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM propiedades WHERE userid = %s
        """, (str(user_id_from_token),))
        rows = cur.fetchall()
        keys = [desc[0] for desc in cur.description]
        propiedades = []

        for row in rows:
            prop_dict = dict(zip(keys, row))
            precio = prop_dict.get("precio")
            ingresos_mensuales = prop_dict.get("ingresos_mensuales")
            gastos_anuales = prop_dict.get("gastos_anuales")

            if precio is not None and ingresos_mensuales is not None:
                ingreso_anual = ingresos_mensuales * 12
                utilidad_anual = ingreso_anual - (gastos_anuales or 0)

                if utilidad_anual > 0:
                    roi = round((utilidad_anual / precio) * 100, 2)
                    payback_years = round(precio / utilidad_anual, 2)
                else:
                    roi = 0
                    payback_years = None

                prop_dict["roi"] = roi
                prop_dict["plazo_ret"] = payback_years

            propiedades.append(prop_dict)

        return jsonify(propiedades), 200, {'Content-Type': 'application/json; charset=utf-8'}
    except Exception as e:
        print(f"Error en obtener_propiedades_usuario: {str(e)}")
        return jsonify({'error': str(e)}), 500