class WeatherService {
    constructor() {
        this.baseUrl = '/api/weather';
    }

    formatPlaceCode(city) {
        if (!city) return null;
        return city.toLowerCase().trim();
    }

    async getForecast(city) {
        const placeCode = this.formatPlaceCode(city);
        if (!placeCode) return null;

        try {
            const url = `${this.baseUrl}/${placeCode}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('City not found');
            
            const data = await response.json();
            this.displayForecast(data);
            return data;
        } catch (error) {
            return null;
        }
    }

    displayForecast(data) {
        const container = document.getElementById('weather-forecast');
        if (!container) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const forecasts = data.forecastTimestamps
            .filter(forecast => {
                const forecastDate = new Date(forecast.forecastTimeUtc);
                const daysDiff = (forecastDate - today) / (1000 * 60 * 60 * 24);
                return daysDiff >= 0 && daysDiff < 4;
            })
            .reduce((acc, forecast) => {
                const date = new Date(forecast.forecastTimeUtc);
                const dateStr = date.toLocaleDateString('lt-LT');
                
                if (!acc[dateStr] || 
                    Math.abs(date.getHours() - 13) < 
                    Math.abs(new Date(acc[dateStr].forecastTimeUtc).getHours() - 13)) {
                    acc[dateStr] = forecast;
                }
                return acc;
            }, {});

        const html = Object.values(forecasts)
            .map(forecast => {
                const date = new Date(forecast.forecastTimeUtc);
                return `
                    <div class="weather-day">
                        <div class="weather-date">${date.toLocaleDateString('lt-LT', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        <div class="weather-time">${date.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div class="weather-temp">${forecast.airTemperature.toFixed(1)}°C</div>
                        <div class="weather-condition">${forecast.conditionCode}</div>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const locationService = new LocationService();
    const weatherService = new WeatherService();
    
    try {
        const city = await locationService.getUserCity();
        if (city) {
            await weatherService.getForecast(city);
        }
    } catch (error) {
        // Silently fail
    }
}); 