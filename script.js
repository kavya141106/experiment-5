// Weather Code Mapping for WMO Standard Codes
const weatherCodeMap = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
};

// UI Elements
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const alertBox = document.getElementById('alertBox');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherResult = document.getElementById('weatherResult');

const cityNameEl = document.getElementById('cityName');
const weatherTimeEl = document.getElementById('weatherTime');
const temperatureEl = document.getElementById('temperature');
const weatherConditionEl = document.getElementById('weatherCondition');
const windSpeedEl = document.getElementById('windSpeed');
const windDirectionEl = document.getElementById('windDirection');
const elevationEl = document.getElementById('elevation');

// Display Error Helper
function showError(message) {
    loadingSpinner.classList.add('d-none');
    weatherResult.classList.add('d-none');
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}

// Clear Alerts
function clearAlert() {
    alertBox.classList.add('d-none');
    alertBox.textContent = '';
}

// Fetch Real-Time Weather Data using Open-Meteo Free Public Geocoding & Weather API
async function fetchWeather(city) {
    clearAlert();
    weatherResult.classList.add('d-none');
    loadingSpinner.classList.remove('d-none');

    try {
        // Step 1: Geocoding API to resolve coordinates from city name
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            throw new Error("Unable to contact geocoding service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Please try another location.`);
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1, elevation } = location;

        // Step 2: Fetch current meteorological observations
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather forecast data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current_weather;

        // Step 3: Populate DOM
        const regionStr = admin1 ? `${admin1}, ` : '';
        cityNameEl.textContent = `${name}, ${regionStr}${country || ''}`;
        weatherTimeEl.textContent = `Reported: ${new Date(current.time).toLocaleString()}`;
        temperatureEl.textContent = `${Math.round(current.temperature)}°C`;
        
        const condition = weatherCodeMap[current.weathercode] || "Variable Conditions";
        weatherConditionEl.textContent = condition;

        windSpeedEl.textContent = `${current.windspeed} km/h`;
        windDirectionEl.textContent = `${current.winddirection}°`;
        elevationEl.textContent = `${elevation !== undefined ? elevation : 'N/A'} m`;

        // Render card
        loadingSpinner.classList.add('d-none');
        weatherResult.classList.remove('d-none');

    } catch (err) {
        showError(err.message || "An unexpected error occurred.");
    }
}

// Event Listeners
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

// Quick Buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        cityInput.value = city;
        fetchWeather(city);
    });
});

// Load Noida as initial default
fetchWeather("Noida");
