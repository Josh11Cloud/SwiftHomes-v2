import requests

API_KEY = "b98d89d06c9b4291bdacf3be175601a1"

def geolocalizar_direccion(direccion):
    url = f"https://api.geoapify.com/v1/geocode/search?text={direccion}&format=json&apiKey={API_KEY}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data["results"]:
            result = data["results"][0]
            return {
                "lat": result["lat"],
                "lon": result["lon"],
                "codigo_postal": result.get("postcode"),
                "ciudad": result.get("city"),
                "estado": result.get("state")
            }
        else:
            print(f"[!] No se encontró geolocalización para: {direccion}")
            return None

    except Exception as e:
        print(f"[!] Error al geolocalizar: {e}")
        return None