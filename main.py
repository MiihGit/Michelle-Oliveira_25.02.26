import requests
from requests.exceptions import HTTPError, Timeout, RequestException

# Configurações da OpenWeatherMap
API_KEY = "33050618e5996045d631e6f1237955d2"
def obter_coordenadas(cidade: str):
    """
    Passo 1: Converte o nome da cidade em Latitude e Longitude usando a Geocoding API.
    """
    geo_url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {
        "q": cidade,
        "limit": 1,
        "appid": API_KEY
    }
    
    response = requests.get(geo_url, params=params, timeout=5)
    response.raise_for_status()
    dados = response.json()
    
    if not dados:
        raise ValueError(f"A cidade '{cidade}' não foi encontrada.")
        
    return dados[0]["lat"], dados[0]["lon"], dados[0]["name"], dados[0]["country"]

def consultar_previsao_tempo_openweather(cidade: str):
    """
    Passo 2: Consulta a API de Clima usando as coordenadas obtidas.
    """
    print(f"🔄 Buscando dados para: {cidade}...")
    
    try:
        # 1. Obtém lat/lon da cidade informada
        lat, lon, nome_oficial, pais = obter_coordenadas(cidade)
        
        # 2. Configura a requisição para a One Call API (ou Current Weather API)
        # Usando 'metric' para retornar temperatura em Celsius
        weather_url = " https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric",
            "lang": "pt_br"
        }
        
        response = requests.get(weather_url, params=params, timeout=5)
        response.raise_for_status()
        
        dados = response.json()
        
        # 3. Extraindo os dados do JSON retornado
        temp = dados["main"]["temp"]
        sensacao = dados["main"]["feels_like"]
        umidade = dados["main"]["humidity"]
        descricao = dados["weather"][0]["description"]
        vento = dados["wind"]["speed"]

        print("\n✅ Previsão obtida com sucesso!")
        print(f"📍 Destino: {nome_oficial} ({pais})")
        print(f"🌡️ Temperatura: {temp}°C (Sensação térmica: {sensacao}°C)")
        print(f"☁️ Condição: {descricao.capitalize()}")
        print(f"💧 Umidade: {umidade}%")
        print(f"💨 Vento: {vento} m/s\n")

    # 4. Tratamento de Erros e Exceções robusto
    except ValueError as val_err:
        print(f"⚠️ [Erro de Validação] {val_err}")
        
    except HTTPError as http_err:
        status_code = response.status_code
        if status_code == 401:
            print("🔑 [Erro de Autenticação] Chave de API (API Key) inválida ou não ativada.")
        elif status_code == 429:
            print("⏳ [Limite Excedido] Você ultrapassou o limite de requisições do seu plano.")
        else:
            print(f"❌ [Erro HTTP] Código {status_code}: {http_err}")
            
    except Timeout:
        print("⏱️ [Timeout] O servidor da OpenWeatherMap demorou muito para responder.")
        
    except RequestException as req_err:
        print(f"🔌 [Falha de Conexão] Erro de rede: {req_err}")
        
# --- Execução do Teste ---
if __name__ == "__main__":
    # Substitua pela sua chave válida da OpenWeatherMap para testar
    consultar_previsao_tempo_openweather("São Paulo")