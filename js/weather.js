class WeatherService {
    constructor() {
        this.baseUrl = '/api/weather';
        this.conditionTranslations = {
            'clear': 'giedra',
            'partly-cloudy': 'mažai debesuota',
            'cloudy-with-sunny-intervals': 'debesuota su pragiedruliais',
            'cloudy': 'debesuota',
            'light-rain': 'nedidelis lietus',
            'rain': 'lietus',
            'heavy-rain': 'smarkus lietus',
            'thunder': 'perkūnija',
            'isolated-thunderstorms': 'trumpas lietus su perkūnija',
            'thunderstorms': 'lietus su perkūnija',
            'heavy-rain-with-thunderstorms': 'smarkus lietus su perkūnija',
            'light-sleet': 'nedidelė šlapdriba',
            'sleet': 'šlapdriba',
            'freezing-rain': 'lijundra',
            'hail': 'kruša',
            'light-snow': 'nedidelis sniegas',
            'snow': 'sniegas',
            'heavy-snow': 'smarkus sniegas',
            'fog': 'rūkas',
            'null': 'oro sąlygos nenustatytos'
        };
    }

    translateCondition(code) {
        return this.conditionTranslations[code] || 'oro sąlygos nenustatytos';
    }

    async getForecast(cityName, cityCode) {
        if (!cityCode) return null;

        try {
            const url = `${this.baseUrl}/${cityCode}`;
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

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const targetHours = [3, 9, 15, 21];
        const currentHour = now.getHours();

        const forecasts = data.forecastTimestamps
            .filter(forecast => {
                const forecastDate = new Date(forecast.forecastTimeUtc);
                const daysDiff = (forecastDate - today) / (1000 * 60 * 60 * 24);
                return daysDiff >= 0 && daysDiff < 4;
            })
            .reduce((acc, forecast) => {
                const date = new Date(forecast.forecastTimeUtc);
                const dateStr = date.toLocaleDateString('lt-LT');
                const hour = date.getHours();
                
                if (!acc[dateStr]) {
                    acc[dateStr] = {
                        date: date,
                        timeSlots: {}
                    };
                }

                // For current day
                if (date.getDate() === now.getDate()) {
                    // Add current hour forecast
                    if (Math.abs(hour - currentHour) < 
                        Math.abs(new Date(acc[dateStr].timeSlots[currentHour]?.forecastTimeUtc || 0).getHours() - currentHour)) {
                        acc[dateStr].timeSlots[currentHour] = forecast;
                    }
                    
                    // Add only future target hours
                    targetHours.forEach(targetHour => {
                        if (targetHour > currentHour) {
                            if (!acc[dateStr].timeSlots[targetHour] ||
                                Math.abs(hour - targetHour) < 
                                Math.abs(new Date(acc[dateStr].timeSlots[targetHour].forecastTimeUtc).getHours() - targetHour)) {
                                acc[dateStr].timeSlots[targetHour] = forecast;
                            }
                        }
                    });
                } 
                // For future days, include all target hours
                else {
                    targetHours.forEach(targetHour => {
                        if (!acc[dateStr].timeSlots[targetHour] ||
                            Math.abs(hour - targetHour) < 
                            Math.abs(new Date(acc[dateStr].timeSlots[targetHour]?.forecastTimeUtc || 0).getHours() - targetHour)) {
                            acc[dateStr].timeSlots[targetHour] = forecast;
                        }
                    });
                }

                return acc;
            }, {});

        const html = Object.values(forecasts)
            .map(dayForecast => {
                const slots = Object.entries(dayForecast.timeSlots)
                    .sort(([hourA], [hourB]) => Number(hourA) - Number(hourB))
                    .map(([hour, forecast]) => {
                        const date = new Date(forecast.forecastTimeUtc);
                        return `
                            <div class="weather-time-slot">
                                <div class="weather-time">${date.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div class="weather-temp">${Math.round(forecast.airTemperature)}°C</div>
                                <div class="weather-condition">${this.translateCondition(forecast.conditionCode)}</div>
                            </div>
                        `;
                    }).join('');

                return `
                    <div class="weather-day">
                        <div class="weather-date">${dayForecast.date.toLocaleDateString('lt-LT', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        <div class="weather-slots">${slots}</div>
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
        if (city && city.name) {
            // Update display with city name
            document.querySelector('.weather-city').textContent = city.name;
            
            // Get forecast using both name and code
            await weatherService.getForecast(city.name, city.code);
        }
    } catch (error) {
        console.error('Failed to load weather:', error);
    }
}); 