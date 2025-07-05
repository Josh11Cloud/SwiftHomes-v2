import unicodedata
import difflib
import re

def normalizar_texto(texto):
    texto = unicodedata.normalize('NFD', texto).encode('ascii', 'ignore').decode('utf-8')
    texto = texto.lower().strip()
    return texto

def limpiar_etiquetas(texto):
    texto = re.sub(r"\b(fraccionamiento|colonia|avenida|av|calle|zona|residencial|municipio|delegacion)\b", "", texto, flags=re.IGNORECASE)
    return re.sub(r"\s{2,}", " ", texto).strip()

def extraer_zona(ubicacion, zonas_disponibles, threshold=0.45):
    ubicacion = normalizar_texto(ubicacion)
    partes = [limpiar_etiquetas(normalizar_texto(p)) for p in ubicacion.split(',') if p.strip()]

    mejor_zona = None
    mejor_similitud = 0

    for parte in partes:
        for zona in zonas_disponibles:
            zona_normalizada = normalizar_texto(zona)
            similitud = difflib.SequenceMatcher(None, parte, zona_normalizada).ratio()
            print(f"Comparando '{parte}' con '{zona_normalizada}' → similitud: {similitud:.2f}")
            if similitud > mejor_similitud and similitud >= threshold:
                mejor_similitud = similitud
                mejor_zona = zona

    if mejor_zona:
        print(f"✅ Zona encontrada: {mejor_zona}")
        return mejor_zona

    print("❌ No se encontró zona coincidente")
    return None

def calcular_valor_actual(area, zona, precios_m2_zonas):
    if area < 0:
        raise ValueError("El área no puede ser negativa")
    valor_m2 = precios_m2_zonas.get(zona)
    if not valor_m2 or not area:
        return None
    if valor_m2 < 0:
        raise ValueError("El valor por metro cuadrado no puede ser negativo")
    return round(area * valor_m2, 2)

def calcular_plusvalia(valor_inicial, valor_actual, debug=False):
    if debug:
        print(f"Calculando plusvalía para valor inicial {valor_inicial} y valor actual {valor_actual}")
    if valor_inicial is None or valor_actual is None:
        if debug:
            print("Valor inicial o valor actual es None")
        return None
    try:
        valor_inicial = float(valor_inicial)
        valor_actual = float(valor_actual)
        if valor_inicial < 0 or valor_actual < 0:
            raise ValueError("El valor inicial o el valor actual no puede ser negativo")
        if valor_inicial == 0:
            if debug:
                print("Valor inicial es cero")
            return None
        plusvalia = ((valor_actual - valor_inicial) / valor_inicial) * 100
        if debug:
            print(f"Plusvalía calculada: {plusvalia}")
        return round(plusvalia, 2)
    except ValueError as e:
        print(f"Error al calcular la plusvalía: {e}")
        return None