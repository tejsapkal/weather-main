const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const tempToggleBtn = document.querySelector(".temp-toggle-btn");
const hourlyForecastDiv = document.querySelector(".hourly-forecast");

const API_KEY = "aabb88002cef5c1493652cdc60a114e5";

let isCelsius = true;

const setBackgroundByWeather = (weatherCondition) => {
    const body = document.body;
    if (weatherCondition.includes('clear')) {
        body.style.background = 'linear-gradient(to top,rgb(254, 198, 113), #FF9800)';
    } else if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
        body.style.background = 'linear-gradient(to top, #607D8B, #455A64)';
    } else if (weatherCondition.includes('snow')) {
        body.style.background = 'linear-gradient(to top, #BBDEFB, #90CAF9)';
    } else {
        body.style.background = 'linear-gradient(to top,rgb(156, 222, 160), #66BB6A)';
    }
};

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        setBackgroundByWeather(weatherItem.weather[0].description);

        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6 class="temp" data-temp-kelvin="${weatherItem.main.temp}">
                        Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C
                    </h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6 class="temp" data-temp-kelvin="${weatherItem.main.temp}">
                        Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C
                    </h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
};

const createHourlyCard = (weatherItem) => {
    const time = new Date(weatherItem.dt * 1000);
    const hour = time.getHours();
    const minute = time.getMinutes();
    const temp = (weatherItem.main.temp - 273.15).toFixed(2);

    return `<li class="hourly-card">
                <h6>${hour}:${minute < 10 ? '0' + minute : minute}</h6>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h6 class="temp" data-temp-kelvin="${weatherItem.main.temp}">
                    Temp: ${temp}°C
                </h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </li>`;
};

const createHourlyGraph = (hourlyData) => {
    const ctx = document.getElementById('hourly-chart').getContext('2d');

    const labels = hourlyData.map(item => {
        const time = new Date(item.dt * 1000);
        return `${time.getHours()}:${time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()}`;
    });

    const temperatures = hourlyData.map(item => (item.main.temp - 273.15).toFixed(2));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#FF5733',
                backgroundColor: 'rgba(255, 87, 51, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
};

const updateTemperatureDisplay = () => {
    const tempElements = document.querySelectorAll('.temp');
    tempElements.forEach(tempEl => {
        const kelvin = parseFloat(tempEl.dataset.tempKelvin);
        let tempText;
        if (isCelsius) {
            tempText = `Temp: ${(kelvin - 273.15).toFixed(2)}°C`;
        } else {
            tempText = `Temp: ${((kelvin - 273.15) * 9 / 5 + 32).toFixed(2)}°F`;
        }
        if (tempEl.parentElement.classList.contains('details')) {
            tempText = tempText.replace('Temp:', 'Temperature:');
        }
        tempEl.textContent = tempText;
    });
};

if (tempToggleBtn) {
    tempToggleBtn.addEventListener('click', () => {
        isCelsius = !isCelsius;
        updateTemperatureDisplay();
    });
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            hourlyForecastDiv.innerHTML = "";

            hourlyForecastDiv.innerHTML = `
                <h2>Hourly Forecast</h2>
                <div class="chart-container">
                    <canvas id="hourly-chart"></canvas>
                </div>
                <ul class="hourly-cards"></ul>
            `;

            // weather cards
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });

            // Create graph
            const hourlyData = data.list.slice(0, 12);
            createHourlyGraph(hourlyData);

            // Create hourly cards
            const hourlyCardsContainer = hourlyForecastDiv.querySelector('.hourly-cards');
            data.list.forEach(weatherItem => {
   const html = createHourlyCard(weatherItem);
                hourlyCardsContainer.insertAdjacentHTML("beforeend", html);
            });

     updateTemperatureDisplay();
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
