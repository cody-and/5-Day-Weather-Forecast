const apiKey = '3519ef2439131ad2ee993d3515797826';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const historyContainer = document.querySelector('#history');
const todayContainer = document.querySelector('#today');
const forecastContainer = document.querySelector('#forecast');

let searchHistory = [];

function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  return fetch(apiUrl).then(response => response.json());
}

function displayCurrentWeather(data) {
  todayContainer.innerHTML = `
    <h2>${data.name} (${new Date().toLocaleDateString()})</h2>
    <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="${data.weather[0].description}" />
    <p>Temperature: ${data.main.temp}°F</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} MPH</p>
  `;
}

function displayForecast(data) {
  forecastContainer.innerHTML = '';

  for (let i = 0; i < data.length; i++) {
    const forecast = data[i];
    const forecastDate = new Date(forecast.dt * 1000);

    forecastContainer.innerHTML += `
      <div class="col-md">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${forecastDate.toLocaleDateString()}</h5>
            <img src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" />
            <p>Temperature: ${forecast.main.temp}°F</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <p>Wind Speed: ${forecast.wind.speed} MPH</p>
          </div>
        </div>
      </div>
    `;
  }
}

function handleSearchFormSubmit(event) {
  event.preventDefault();
  const cityName = searchInput.value.trim();

  if (cityName) {
    fetchWeatherData(cityName)
      .then(data => {
        displayCurrentWeather(data);
        fetchForecastData(cityName);
        addToHistory(cityName);
      })
      .catch(error => {
        console.error(error);
        alert('City not found. Please enter a valid city name.');
      });

    searchInput.value = '';
  }
}

function fetchForecastData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const forecastData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
      displayForecast(forecastData);
    })
    .catch(error => console.error(error));
}

function addToHistory(city) {
  searchHistory.unshift(city); 
  if (searchHistory.length > 5) {
    searchHistory.pop(); 
  }

  localStorage.setItem('search-history', JSON.stringify(searchHistory));

  renderSearchHistory();
}

function renderSearchHistory() {
  historyContainer.innerHTML = '';
  searchHistory.forEach(city => {
    const historyBtn = document.createElement('button');
    historyBtn.textContent = city;
    historyBtn.classList.add('history-btn');
    historyBtn.addEventListener('click', () => {
      fetchWeatherData(city)
        .then(data => {
          displayCurrentWeather(data);
          fetchForecastData(city);
        })
        .catch(error => console.error(error));
    });
    historyContainer.appendChild(historyBtn);
  });
}

function initSearchHistory() {
  const storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
    renderSearchHistory();
  }
}

initSearchHistory();

searchForm.addEventListener('submit', handleSearchFormSubmit);
