class LocationService {
    async getUserCity() {
        // First check localStorage
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) {
            return savedCity;
        }

        try {
            if (!navigator.geolocation) {
                return 'Vilnius';  // Proper capitalization
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
            const city = data.address.city || data.address.town || 'Vilnius';  // Proper capitalization
            
            if (city) {
                localStorage.setItem('userCity', city);
            }

            return city;
            
        } catch (error) {
            return 'Vilnius';  // Proper capitalization
        }
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