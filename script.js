// Open-Meteo API (Free, No API Key Needed)
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');
const forecastContainer = document.getElementById('forecastContainer');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Weather codes mapping for Open-Meteo
const weatherCodes = {
    0: { description: 'Clear Sky', icon: '☀️' },
    1: { description: 'Mainly Clear', icon: '🌤️' },
    2: { description: 'Partly Cloudy', icon: '⛅' },
    3: { description: 'Overcast', icon: '☁️' },
    45: { description: 'Foggy', icon: '🌫️' },
    48: { description: 'Depositing Rime Fog', icon: '🌫️' },
    51: { description: 'Light Drizzle', icon: '🌧️' },
    53: { description: 'Moderate Drizzle', icon: '🌧️' },
    55: { description: 'Dense Drizzle', icon: '🌧️' },
    61: { description: 'Slight Rain', icon: '🌧️' },
    63: { description: 'Moderate Rain', icon: '🌧️' },
    65: { description: 'Heavy Rain', icon: '🌧️' },
    71: { description: 'Slight Snow', icon: '❄️' },
    73: { description: 'Moderate Snow', icon: '❄️' },
    75: { description: 'Heavy Snow', icon: '❄️' },
    77: { description: 'Snow Grains', icon: '❄️' },
    80: { description: 'Slight Rain Showers', icon: '🌧️' },
    81: { description: 'Moderate Rain Showers', icon: '🌧️' },
    82: { description: 'Violent Rain Showers', icon: '⛈️' },
    85: { description: 'Slight Snow Showers', icon: '❄️' },
    86: { description: 'Heavy Snow Showers', icon: '❄️' },
    80: { description: 'Thunderstorm', icon: '⛈️' },
    99: { description: 'Thunderstorm with Hail', icon: '⛈️' }
};

// Handle Search
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    hideError();
    await fetchWeatherData(city);
}

// Fetch Weather Data
async function fetchWeatherData(city) {
    try {
        // Step 1: Get city coordinates using geocoding
        const geoResponse = await fetch(
            `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!geoResponse.ok) {
            throw new Error('Failed to fetch city data');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Try "Bangalore", "London", "New York", etc.`);
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        console.log(`Found: ${name}, ${country} (${latitude}, ${longitude})`);

        // Step 2: Get weather data
        const weatherResponse = await fetch(
            `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`
        );

        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        updateCurrentWeather(weatherData, name, country);
        updateForecast(weatherData);
        weatherContainer.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        weatherContainer.style.display = 'none';
    }
}

// Update Current Weather
function updateCurrentWeather(data, cityName, country) {
    const current = data.current;
    const weatherInfo = weatherCodes[current.weather_code] || { description: 'Unknown', icon: '🌡️' };

    document.getElementById('cityName').textContent = `${cityName}, ${country}`;
    document.getElementById('weatherDescription').textContent = weatherInfo.description;
    document.getElementById('temp').textContent = Math.round(current.temperature_2m);
    document.getElementById('feelsLike').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${current.wind_speed_10m.toFixed(1)} m/s`;
    document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('visibility').textContent = `Good`;
    document.getElementById('uvIndex').textContent = `N/A`;

    // Weather Icon (using emoji)
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;
    document.getElementById('weatherIcon').style.fontSize = '60px';
}

// Update Forecast
function updateForecast(data) {
    const daily = data.daily;
    forecastContainer.innerHTML = '';

    // Create forecast cards for next 5 days
    for (let i = 1; i < Math.min(6, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const weatherCode = daily.weather_code[i];
        const weatherInfo = weatherCodes[weatherCode] || { description: 'Unknown', icon: '🌡️' };
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="date">${date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })}</div>
            <div style="font-size: 40px; margin: 10px 0;">${weatherInfo.icon}</div>
            <div class="temp">${maxTemp}°C</div>
            <div class="temp-range">${minTemp}°C</div>
        `;
        forecastContainer.appendChild(card);
    }
}

// Show/Hide Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Initialize
console.log('Weather Dashboard loaded - Using Open-Meteo API (No API Key Required)');
