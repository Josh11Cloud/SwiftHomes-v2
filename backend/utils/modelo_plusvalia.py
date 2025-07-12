import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib

df = pd.read_csv("datos_plusvalia.csv")

X = df[["precio", "area", "lat", "lon", "antiguedad"]]

y = df["plusvalia"]

modelo = LinearRegression()
modelo.fit(X, y)

y_pred = modelo.predict(X)

print("📈 Evaluación del modelo:")
print(f"R² score: {r2_score(y, y_pred):.4f}")
print(f"Error cuadrático medio: {mean_squared_error(y, y_pred):.2f}")

joblib.dump(modelo, "modelo_plusvalia.joblib")
print("✅ Modelo guardado como modelo_plusvalia.joblib")