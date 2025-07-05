def calcular_metricas(precio, ingresos_mensuales, gastos_anuales):
    ingreso_anual = ingresos_mensuales * 12
    utilidad_anual = ingreso_anual - (gastos_anuales or 0)

    if utilidad_anual <= 0:
        return {
            "roi": 0,
            "payback_years": None,
            "ingreso_anual": ingreso_anual,
            "utilidad_anual": utilidad_anual
        }

    roi = round((utilidad_anual / precio) * 100, 2)
    payback_years = round(precio / utilidad_anual, 2)

    return {
        "roi": roi,
        "payback_years": payback_years,
        "ingreso_anual": ingreso_anual,
        "utilidad_anual": utilidad_anual
    }