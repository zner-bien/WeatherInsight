/*
==================================
WeatherInsight
AJAX Weather Application
==================================
*/


// ==================================
// DOM ELEMENTS
// ==================================

const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const loadingContainer = document.getElementById("loadingContainer");
const errorContainer = document.getElementById("errorContainer");

const weatherContainer = document.getElementById("weatherContainer");
const detailsContainer = document.getElementById("detailsContainer");
const sunContainer = document.getElementById("sunContainer");
const forecastContainer = document.getElementById("forecastContainer");

const cityName = document.getElementById("cityName");
const weatherDate = document.getElementById("currentDate");
const liveClock = document.getElementById("liveClock");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const feelsLike = document.getElementById("feelsLike");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

let clockInterval = null;


// ==================================
// SEARCH EVENT
// ==================================

weatherForm.addEventListener("submit", function(event){

    event.preventDefault();

    const city = cityInput.value.trim();

    if(city === ""){

        showError(
            "Please enter a city name."
        );

        return;

    }

    getWeather(city);

});


// ==================================
// FETCH WEATHER
// ==================================

async function getWeather(city){

    clearError();

    setLoadingState(true);

    try{

        const response =
            await fetch(
                `/api/weather?city=${encodeURIComponent(city)}`
            );

        const data =
            await response.json();

        if(data.error){

            showError(data.error);

            return;

        }

        updateWeather(data);

        updateBackground(
            data.weather[0].main
        );

        showWeatherSections();

        await getForecast(city);

    }

    catch(error){

        console.error(error);

        showError(
            "Unable to connect to the weather service."
        );

    }

    finally{

        setLoadingState(false);

    }

}

// ==================================
// UPDATE WEATHER UI
// ==================================

function updateWeather(data){

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    weatherDate.textContent =
        data.current_time;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    temperature.textContent =
        `${Number(data.main.temp).toFixed(1)}°C`;

    weatherDescription.textContent =
        data.weather[0].description.replace(
            /\b\w/g,
            c => c.toUpperCase()
        );

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    feelsLike.textContent =
        `${Number(data.main.feels_like).toFixed(1)}°C`;

    sunrise.textContent =
        data.sunrise_time;

    sunset.textContent =
        data.sunset_time;

    startLiveClock(
        data.timezone
    );

}

// ==================================
// FETCH FORECAST
// ==================================

async function getForecast(city){

    if(!forecastContainer){
        return;
    }

    try{

        const response =
            await fetch(
                `/api/forecast?city=${encodeURIComponent(city)}`
            );

        if(!response.ok){
            return;
        }

        const forecast =
            await response.json();

        if(forecast.error){
            return;
        }

        displayForecast(forecast);

    }

    catch(error){

        console.error(
            "Forecast Error:",
            error
        );

    }

}


// ==================================
// DISPLAY FORECAST
// ==================================

function displayForecast(forecast){

    if(!forecastContainer){
        return;
    }

    forecastContainer.innerHTML = "";

    forecast.forEach(day => {

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `
            <h3 class="forecast-date">${day.date}</h3>

            <p class="forecast-day">${day.day}</p>

            <img
                src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                alt="${day.description}"
            >

            <p>${day.temperature}°C</p>

            <p>${day.description.replace(/\b\w/g, c => c.toUpperCase())}</p>
        `;

        forecastContainer.appendChild(card);

    });

}

// ==================================
// SHOW WEATHER SECTIONS
// ==================================

function showWeatherSections(){

    if(weatherContainer){
        weatherContainer.classList.remove("hidden-section");
        weatherContainer.classList.add("show-section");
    }

    if(detailsContainer){
        detailsContainer.classList.remove("hidden-section");
        detailsContainer.classList.add("show-section");
    }

    if(sunContainer){
        sunContainer.classList.remove("hidden-section");
        sunContainer.classList.add("show-section");
    }

    if(forecastContainer){
        forecastContainer.classList.remove("hidden-section");
        forecastContainer.classList.add("show-section");
        forecastContainer.style.display = "grid";
    }

}


// ==================================
// LOADING CONTROL
// ==================================

function setLoadingState(isLoading){

    if(searchBtn){

        searchBtn.disabled = isLoading;

        searchBtn.textContent =
            isLoading
            ? "Searching..."
            : "Search";

    }

    if(loadingContainer){

        loadingContainer.style.display =
            isLoading
            ? "block"
            : "none";

    }

}


// ==================================
// WEATHER BACKGROUND
// ==================================

function updateBackground(condition){

    document.body.classList.remove(
        "clear-weather",
        "cloudy-weather",
        "rainy-weather",
        "storm-weather",
        "default-weather"
    );

    condition = condition.toLowerCase();

    switch(condition){

        case "clear":

            document.body.classList.add(
                "clear-weather"
            );

            break;


        case "clouds":

            document.body.classList.add(
                "cloudy-weather"
            );

            break;


        case "rain":

        case "drizzle":

            document.body.classList.add(
                "rainy-weather"
            );

            break;


        case "thunderstorm":

            document.body.classList.add(
                "storm-weather"
            );

            break;


        default:

            document.body.classList.add(
                "default-weather"
            );

    }

}

// ==================================
// LIVE CITY CLOCK
// ==================================

function startLiveClock(timezoneOffset){

    if(!liveClock){
        return;
    }

    if(clockInterval){
        clearInterval(clockInterval);
    }

    function updateClock(){

        const now = new Date();

        const utc =
            now.getTime() +
            (now.getTimezoneOffset() * 60000);

        const cityTime =
            new Date(
                utc + (timezoneOffset * 1000)
            );

        liveClock.textContent =
            cityTime.toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            );

    }

    updateClock();

    clockInterval =
        setInterval(updateClock, 1000);

}


// ==================================
// ERROR HANDLING
// ==================================

function showError(message){

    if(!errorContainer){
        return;
    }

    errorContainer.innerHTML = `
        <p class="error-message">
            ${message}
        </p>
    `;

}


function clearError(){

    if(errorContainer){
        errorContainer.innerHTML = "";
    }

}


// ==================================
// INITIAL PAGE LOAD
// ==================================

document.addEventListener("DOMContentLoaded", function(){

    if(loadingContainer){
        loadingContainer.style.display = "none";
    }

    if(weatherContainer){
        weatherContainer.classList.add("hidden-section");
    }

    if(detailsContainer){
        detailsContainer.classList.add("hidden-section");
    }

    if(sunContainer){
        sunContainer.classList.add("hidden-section");
    }

    if(forecastContainer){
        forecastContainer.classList.add("hidden-section");
    }

});


// ==================================
// APP READY
// ==================================

console.log("WeatherInsight Loaded Successfully");

// ==================================
// SEARCH HISTORY SETUP
// ==================================

const searchHistory =
    document.getElementById("searchHistory");


let recentSearches =
    JSON.parse(
        localStorage.getItem("weatherHistory")
    ) || [];

// ==================================
// SAVE SEARCH HISTORY
// ==================================

function saveSearch(city){

    city =
        city.trim();


    if(city === ""){

        return;

    }


    recentSearches =
        recentSearches.filter(
            item =>
            item.toLowerCase() !== city.toLowerCase()
        );


    recentSearches.unshift(
        city
    );


    if(recentSearches.length > 5){

        recentSearches.pop();

    }


    localStorage.setItem(
        "weatherHistory",
        JSON.stringify(recentSearches)
    );


    displaySearchHistory();

}

// ==================================
// DISPLAY SEARCH HISTORY
// ==================================

function displaySearchHistory(){

    if(!searchHistory){

        return;

    }


    searchHistory.innerHTML = "";


    if(recentSearches.length === 0){


        searchHistory.innerHTML = `

            <p class="history-empty">

                No recent searches yet.

            </p>

        `;


        return;

    }



    recentSearches.forEach(city => {


        const button =
            document.createElement("button");



        button.className =
            "history-btn";



        button.textContent =
            city;



        button.addEventListener(
            "click",
            function(){


                cityInput.value =
                    city;


                getWeather(city);


            }
        );



        searchHistory.appendChild(
            button
        );


    });


}

// ==================================
// LOAD SEARCH HISTORY
// ==================================

document.addEventListener(
    "DOMContentLoaded",
    function(){


        displaySearchHistory();


    }
);

// ==================================
// CONNECT WEATHER SEARCH TO HISTORY
// ==================================

const originalGetWeather =
    getWeather;



getWeather = async function(city){


    await originalGetWeather(city);



    const hasWeatherData =
        cityName &&
        cityName.textContent !== "Search a City";



    if(hasWeatherData){


        saveSearch(city);


    }


};