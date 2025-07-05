from flask import Flask
from flask_cors import CORS
from routes.propiedades import propiedades_bp
from routes.auth import auth_bp
from routes.favoritos import favoritos_bp
from routes.roi import roi_bp
from routes.usuarios import usuarios_bp
from routes.actividad import actividades_bp
from routes.contacto import contacto_bp
from routes.plusvalia import plusvalia_bp
from routes.inversiones import inversiones_bp
from routes.zonas import zonas_bp
import os

app = Flask(__name__)
CORS(app, origins="*")

if not all([os.getenv("DB_HOST"), os.getenv("DB_NAME"), os.getenv("DB_USER"), os.getenv("DB_PASSWORD")]):
    raise Exception("Variables de entorno de base de datos no configuradas")

app.register_blueprint(propiedades_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(favoritos_bp)
app.register_blueprint(contacto_bp)
app.register_blueprint(zonas_bp)
app.register_blueprint(roi_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(actividades_bp)
app.register_blueprint(inversiones_bp)
app.register_blueprint(plusvalia_bp)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5500))
    app.run(debug=True, host="0.0.0.0", port=port)