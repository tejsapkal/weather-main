const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "";

const setBackgroundByWeather = (weatherCondition) => {
    const body = document.body;
    const condition = weatherCondition.toLowerCase();

    if (condition.includes("clear")) {
        body.style.background = "linear-gradient(to top,rgb(254, 198, 113), #FF9800)";
    } else if (condition.includes("rain")) {
        body.style.background = "linear-gradient(to top, #607D8B, #455A64)";
    } else if (condition.includes("snow")) {
        body.style.background = "linear-gradient(to top, #BBDEFB, #90CAF9)";
    } else {
        body.style.background = "linear-gradient(to top,rgb(156, 222, 160), #66BB6A)";
    }
};

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temp = (weatherItem.main.temp - 273.15).toFixed(2);
    const wind = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const icon = weatherItem.weather[0].icon;
    const desc = weatherItem.weather[0].description;

    if (index === 0) {
        setBackgroundByWeather(desc);
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h6 class="temp">Temperature: ${temp}°C</h6>
                <h6>Wind: ${wind} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                <h6>${desc}</h6>
            </div>`;
    }

    return `
        <li class="card">
            <h3>(${date})</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
            <h6 class="temp">Temp: ${temp}°C</h6>
            <h6>Wind: ${wind} M/S</h6>
            <h6>Humidity: ${humidity}%</h6>
        </li>`;
};

const getWeatherDetails = async (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();

        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    } catch (error) {
        alert("An error occurred while fetching the weather forecast!");
    }
};

const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.length) {
            alert(`No coordinates found for ${cityName}`);
            return;
        }

        const { lat, lon, name } = data[0];
        await getWeatherDetails(name, lat, lon);
    } catch (error) {
        alert("An error occurred while fetching the coordinates!");
    }
};

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") getCityCoordinates();
});

const dateTimeEl = document.getElementById("date-time");
setInterval(() => {
  const now = new Date();
  dateTimeEl.textContent = now.toLocaleString();
}, 1000);


