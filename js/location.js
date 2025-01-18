class LocationService {
    async getUserCity() {
        // Check cookies first (using js-cookie library or native approach)
        const cookieCity = this.getCityFromCookie();
        if (cookieCity) {
            return cookieCity;
        }

        // If no cookie, check localStorage (as fallback)
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) {
            return savedCity;
        }

        try {
            if (!navigator.geolocation) {
                return 'Vilnius';
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
            const city = data.address.city || data.address.town || 'Vilnius';
            
            return city;
            
        } catch (error) {
            return 'Vilnius';
        }
    }

    getCityFromCookie() {
        // Get userCity from cookie
        const cookies = document.cookie.split(';');
        const cityCookie = cookies.find(cookie => cookie.trim().startsWith('userCity='));
        if (cityCookie) {
            return decodeURIComponent(cityCookie.split('=')[1]);
        }
        return null;
    }
}

// Test the location service when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const locationService = new LocationService();
    const cityNameElement = document.querySelector('.city-name');
    
    try {
        const city = await locationService.getUserCity();
        cityNameElement.textContent = city || 'Location not available';
    } catch (error) {
        cityNameElement.textContent = 'Could not get location';
    }
}); 