from flask import Flask, request, jsonify

app = Flask(__name__)

# Simula una base de datos de sugerencias
sugerencias = [
    "Casa en renta en el centro de la ciudad",
    "Departamento en venta en la zona norte",
    "Terreno en venta en la zona sur",
    "Casa en venta en la zona este",
    "Departamento en renta en la zona oeste",
]

@app.route('/api/sugerencias', methods=['GET'])
def get_sugerencias():
    query = request.args.get('q')
    if query:
        sugerencias_filtradas = [sugerencia for sugerencia in sugerencias if query.lower() in sugerencia.lower()]
        return jsonify({'suggestions': sugerencias_filtradas})
    else:
        return jsonify({'suggestions': []})

if __name__ == '__main__':
    app.run(debug=True)