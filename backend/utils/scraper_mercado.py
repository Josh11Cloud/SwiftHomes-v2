import re
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SwiftHomesBot/1.0)"}

def scrap_precio_promedio(zona, ciudad="Zapopan"):
    slug = f"{ciudad} {zona}".replace(" ", "-")
    url = f"https://inmuebles.mercadolibre.com.mx/{slug}_NoIndex_True"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"[!] Error al acceder a {url}: {e}")
        return None

    items = soup.select("li.ui-search-layout__item")
    precios_m2 = []

    for item in items:
        precio_tag = item.select_one(".andes-money-amount__fraction")
        descripcion_tag = item.select_one(".ui-search-item__group--attributes") or \
                        item.select_one(".ui-search-item__group--description") or \
                        item.select_one("a.ui-search-link")

        if not descripcion_tag:
            continue

        descripcion = descripcion_tag.get_text()
        match = re.search(r"(\d{2,4})\s?m2", descripcion.lower())
        print("[DEBUG] Texto descripción:", descripcion)

        if not precio_tag or not descripcion_tag:
            continue

        try:
            precio = int(precio_tag.get_text().replace(".", "").replace(",", ""))
        except:
            continue

        descripcion = descripcion_tag.get_text()
        match = re.search(r"(\d{2,4})\s?m2", descripcion.lower())

        if match:
            try:
                area = int(match.group(1))
                if 25 < area < 1000:
                    precio_m2 = precio / area
                    precios_m2.append(precio_m2)
            except:
                continue

    if not precios_m2:
        print(f"[!] No se encontraron datos válidos para zona: {zona}")
        return None

    promedio = round(sum(precios_m2) / len(precios_m2), 2)
    return promedio