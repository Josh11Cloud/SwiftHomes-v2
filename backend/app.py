from flask import Flask
from flask_cors import CORS
from routes.propiedades import propiedades_bp
import os
from routes.auth import auth_bp
from routes.favoritos import favoritos_bp
from routes.roi import roi_bp
from routes.usuarios import usuarios_bp

app = Flask(__name__)
CORS(app)

if not all([os.getenv("DB_HOST"), os.getenv("DB_NAME"), os.getenv("DB_USER"), os.getenv("DB_PASSWORD")]):
    raise Exception("Variables de entorno de base de datos no configuradas")

app.register_blueprint(propiedades_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(favoritos_bp)
app.register_blueprint(roi_bp)
app.register_blueprint(usuarios_bp)

if __name__ == "__main__":
    port = os.getenv("PORT")
    if port is None:
        port = 5500
    else:
        port = int(port)
    app.run(port=port)