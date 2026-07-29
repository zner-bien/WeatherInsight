from flask import Flask, render_template, request, jsonify

from config import Config
from services.weather_api import get_weather, get_forecast

from datetime import datetime, timezone, timedelta


app = Flask(__name__)


# ==================================
# PHILIPPINE TIMEZONE
# ==================================

PH_TIMEZONE = timezone(
    timedelta(hours=8)
)


# ==================================
# PROCESS WEATHER DATA
# ==================================

def process_weather_data(weather):

    weather["sunrise_time"] = datetime.fromtimestamp(
        weather["sys"]["sunrise"],
        PH_TIMEZONE
    ).strftime("%I:%M %p")

    weather["sunset_time"] = datetime.fromtimestamp(
        weather["sys"]["sunset"],
        PH_TIMEZONE
    ).strftime("%I:%M %p")

    weather["current_time"] = datetime.now(
        PH_TIMEZONE
    ).strftime("%A, %B %d, %Y")

    return weather

# ==================================
# HOME PAGE
# ==================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# ==================================
# WEATHER AJAX API
# ==================================

@app.route("/api/weather")
def api_weather():

    city = request.args.get("city")

    if not city:

        return jsonify({
            "error": "Please enter a city name"
        })


    weather = get_weather(
        city,
        Config.OPENWEATHER_API_KEY
    )


    if weather is None:

        return jsonify({
            "error": "City not found"
        })


    if "error" in weather:

        return jsonify(weather)


    weather = process_weather_data(
        weather
    )


    return jsonify(weather)


# ==================================
# FORECAST API
# ==================================

@app.route("/api/forecast")
def api_forecast():

    city = request.args.get("city")

    if not city:

        return jsonify({
            "error": "No city provided"
        })


    forecast = get_forecast(
        city,
        Config.OPENWEATHER_API_KEY
    )


    if forecast is None:

        return jsonify({
            "error": "Unable to retrieve forecast"
        })


    if "error" in forecast:

        return jsonify(forecast)


    daily_forecast = []


    for item in forecast["list"]:

        if "12:00:00" in item["dt_txt"]:

            forecast_date = datetime.strptime(
                item["dt_txt"],
                "%Y-%m-%d %H:%M:%S"
            )

            daily_forecast.append({

                "date": forecast_date.strftime("%B %d"),

                "day": forecast_date.strftime("%A"),

                "temperature": round(
                    item["main"]["temp"],
                    1
                ),

                "description":
                item["weather"][0]["description"],

                "icon":
                item["weather"][0]["icon"]

            })


    return jsonify(daily_forecast)

# ==================================
# RUN APPLICATION
# ==================================

if __name__ == "__main__":

    app.run(
        debug=True
    )