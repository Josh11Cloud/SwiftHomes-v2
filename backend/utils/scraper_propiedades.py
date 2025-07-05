import re
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from unidecode import unidecode

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrap_propiedades(zona="valle-imperial", ciudad="zapopan", debug=False, tipos_permitidos=["casa", "departamento"]):
    url = f"https://www.propiedades.com/{zona}-{ciudad}/residencial-venta"
    print(f"🌐 Visitando: {url}")

    options = webdriver.ChromeOptions()
    if not debug:
        options.add_argument("headless")
        options.add_argument("window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

    driver = webdriver.Chrome(options=options)
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "section.pcom-property-card-body"))
        )
    except Exception:
        print("⚠️ Tiempo de espera agotado. No se encontraron propiedades.")
        driver.quit()
        return None

    for _ in range(5):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    if debug:
        with open(f"debug_{zona}.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)

    driver.quit()

    precios_m2 = {tipo: [] for tipo in tipos_permitidos}
    cards = soup.select("section.pcom-property-card-body")

    if not cards:
        print("⚠️ No se encontraron propiedades en la página.")
        return None

    zona_filtrada = zona.replace("-", " ").lower()
    print(f"Zona filtrada: {zona_filtrada}")

    for i, card in enumerate(cards):
        try:
            # Precio
            precio_tag = card.select_one("div.sc-402fc8bf-2")
            if not precio_tag:
                continue
            precio = int(re.sub(r"[^\d]", "", precio_tag.text))
            if precio < 10000:
                continue

            # Ubicación
            ubicacion_tag = card.select_one("h3 > span[itemprop='streetAddress']")
            ubicacion = ubicacion_tag.get("content") if ubicacion_tag else "Col. Valle Imperial"
            ubicacion_normalizada = unidecode(ubicacion.lower())
            zona_normalizada = unidecode(zona_filtrada)
            if zona_normalizada not in ubicacion_normalizada:
                continue

            # Tipo de propiedad
            tipo_propiedad = None
            labels = card.select("div.labels div")
            for label in labels:
                label_text = label.get_text(strip=True).lower()
                if label_text in tipos_permitidos:
                    tipo_propiedad = label_text
                    break
            if not tipo_propiedad:
                continue

            # Área construida (m²)
            area_construida = None
            li_tags = card.find_all("li", class_="amenities")
            for li in li_tags:
                text = li.get_text(strip=True).lower()
                match = re.search(r"(\d{2,4})\s?(m²|m2)", text)
                if match:
                    area_construida = int(match.group(1))
                    break

            if not area_construida or area_construida < 30 or area_construida > 1000:
                continue

            # Calcular precio por m²
            precio_m2 = precio / area_construida
            precios_m2[tipo_propiedad].append(precio_m2)

            if debug:
                print(f"#{i+1:02d} ➜ ${precio:,} / {area_construida} m² = ${round(precio_m2, 2)} MXN/m² ({tipo_propiedad})")

        except Exception as e:
            if debug:
                print(f"⚠️ Error en tarjeta #{i+1}: {e}")
            continue

    promedios = {}
    for tipo_propiedad, precios in precios_m2.items():
        if precios:
            promedio = round(sum(precios) / len(precios), 2)
            promedios[tipo_propiedad] = promedio
            print(f"[✅] Precio promedio en {zona.replace('-', ' ').title()} para {tipo_propiedad}: ${promedio} MXN/m² con {len(precios)} propiedades")

    return precios_m2 