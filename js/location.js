class LocationService {
    getCityFromCookie() {
        const cookies = document.cookie.split(';');
        const cityCookie = cookies.find(cookie => cookie.trim().startsWith('userCity='));
        if (cityCookie) {
            try {
                const cityData = JSON.parse(decodeURIComponent(cityCookie.split('=')[1]));
                return cityData; // Returns { name: "cityName", code: "cityCode" }
            } catch {
                return null;
            }
        }
        return null;
    }

    async getUserCity() {
        // Check cookies first
        const cookieCity = this.getCityFromCookie();
        if (cookieCity) {
            return cookieCity;
        }

        // If no cookie, check localStorage (as fallback)
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) {
            try {
                const cityData = JSON.parse(savedCity);
                return cityData;
            } catch {
                // Handle old format or invalid data
                return { name: savedCity, code: null };
            }
        }

        try {
            if (!navigator.geolocation) {
                return { name: 'Vilnius', code: 'vilnius' };
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 5000
                });
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${position.coords.latitude}&` +
                `lon=${position.coords.longitude}&` +
                `format=json`
            );

            const data = await response.json();
            const cityName = data.address.city || data.address.town || 'Vilnius';
            
            return { 
                name: cityName,
                code: cityName.toLowerCase() === 'vilnius' ? 'vilnius' : null 
            };
            
        } catch (error) {
            return { name: 'Vilnius', code: 'vilnius' };
        }
    }
}

// Test the location service when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const locationService = new LocationService();
    const cityNameElement = document.querySelector('.city-name');
    
    try {
        const city = await locationService.getUserCity();
        cityNameElement.textContent = city.name || 'Location not available';
    } catch (error) {
        cityNameElement.textContent = 'Could not get location';
    }
}); 