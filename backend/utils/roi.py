# utils/roi.py
def calcular_roi(precio, ingresos_mensuales, gastos_anuales):
    try:
        if precio > 0:
            ingresos_anuales = ingresos_mensuales * 12
            roi = ((ingresos_anuales - gastos_anuales) / precio) * 100
            return round(roi, 2)
        return None
    except:
        return None