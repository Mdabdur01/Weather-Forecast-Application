const apiKey = "eaf196fe5874411bb9f103651242208";
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const weatherCondition = document.getElementById('weatherCondition');
const weatherIcon = document.getElementById('weatherIcon');
const forecast = document.getElementById('forecast');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const recentCitiesBtn = document.getElementById('recentCitiesBtn');
const recentCitiesList = document.getElementById('recentCitiesList');
const locationBtn = document.getElementById('locationBtn');

// Function to validate the city input
function validateCityInput() {
    const city = cityInput.value.trim();

    if (city === "") {
        alert("City name cannot be empty.");
        return false;
    }

    const cityPattern = /^[a-zA-Z\s]+$/;
    if (!cityPattern.test(city)) {
        alert("City name can only contain letters and spaces.");
        return false;
    }

    if (city.length < 2 || city.length > 50) {
        alert("City name must be between 2 and 50 characters.");
        return false;
    }

    return true;
}

// Function to update weather data
async function updateWeather(query) {
    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5`;

    try {
        const weatherResponse = await fetch(currentWeatherUrl);
        const weatherData = await weatherResponse.json();

        cityName.textContent = `${weatherData.location.name} (${new Date().toISOString().split('T')[0]})`;
        temp.textContent = `Temperature: ${weatherData.current.temp_c}°C`;
        wind.textContent = `Wind: ${weatherData.current.wind_kph} m/s`;
        humidity.textContent = `Humidity: ${weatherData.current.humidity}%`;
        weatherCondition.textContent = weatherData.current.condition.text;
        weatherIcon.src = weatherData.current.condition.icon;

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        forecast.innerHTML = '';
        forecastData.forecast.forecastday.forEach(day => {
            const card = document.createElement('div');
            card.classList.add('bg-gray-800', 'text-white', 'p-4', 'rounded', 'text-center', 'shadow');
            card.innerHTML = `
                <p>${day.date}</p>
                <img src="${day.day.condition.icon}" alt="Weather Icon" class="mx-auto">
                <p>Temp: ${day.day.avgtemp_c}°C</p>
                <p>Wind: ${day.day.maxwind_kph} m/s</p>
                <p>Humidity: ${day.day.avghumidity}%</p>
                <p>${day.day.condition.text}</p>
            `;
            forecast.appendChild(card);
        });

        addCityToRecent(weatherData.location.name);

    } catch (error) {
        console.error("Error fetching weather data: ", error);
        alert("Error fetching weather data. Please try again later.");
    }
}

// Function to add a city to the recent searches dropdown
function addCityToRecent(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) {
            recentCities.shift();
        }
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
}

// Function to update the recent cities dropdown
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (recentCities.length > 0) {
        recentCitiesDropdown.classList.remove('hidden');
        recentCitiesList.innerHTML = '';

        recentCities.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.classList.add('py-2', 'px-4', 'hover:bg-gray-200', 'cursor-pointer');
            li.addEventListener('click', () => {
                updateWeather(city)
                recentCitiesDropdown.style.display = "none";
            });
            recentCitiesList.appendChild(li);
        });
    } else {
        recentCitiesDropdown.classList.add('hidden');
    }
}
let isDropdownOpen = false
recentCitiesBtn.addEventListener("click", () => {
    if( !isDropdownOpen )
    recentCitiesDropdown.style.display = "block";
else
recentCitiesDropdown.style.display = "none";
})
// Function to get weather data based on current location
function fetchWeatherForCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const locationQuery = `${latitude},${longitude}`;
            await updateWeather(locationQuery);
        }, (error) => {
            console.error("Error getting location: ", error);
            alert("Error getting location. Please enable location services and try again.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

updateRecentCitiesDropdown();

searchBtn.addEventListener('click', () => {
    if (validateCityInput()) {
        const city = cityInput.value.trim();
        updateWeather(city);
    }
});

locationBtn.addEventListener('click', fetchWeatherForCurrentLocation);

(async () => {
    await updateWeather('Patna');
})();
