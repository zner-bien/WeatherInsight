import requests

BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def get_weather(city, api_key):

    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    try:

        response = requests.get(
            BASE_URL,
            params=params,
            timeout=10
        )

        data = response.json()

        if response.status_code != 200:
            return {
                "error": data.get(
                    "message",
                    "Unable to fetch weather data"
                )
            }

        return data

    except requests.exceptions.RequestException:

        return {
            "error": "Weather service unavailable"
        }


def get_forecast(city, api_key):

    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    try:

        response = requests.get(
            FORECAST_URL,
            params=params,
            timeout=10
        )

        data = response.json()

        if response.status_code != 200:
            return {
                "error": data.get(
                    "message",
                    "Unable to fetch forecast"
                )
            }

        return data

    except requests.exceptions.RequestException:

        return {
            "error": "Forecast service unavailable"
        }