class LocationService {
    async getUserCity() {
        // First check localStorage
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) {
            return savedCity;
        }

        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by your browser');
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,  // City-level accuracy is sufficient
                    timeout: 5000
                });
            });

            // Convert coordinates to city name using OpenStreetMap
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${position.coords.latitude}&` +
                `lon=${position.coords.longitude}&` +
                `format=json`
            );

            const data = await response.json();
            const city = data.address.city || data.address.town || null;
            
            // Save city to localStorage if found
            if (city) {
                localStorage.setItem('userCity', city);
            }

            return city;
            
        } catch (error) {
            console.error('Failed to get user location:', error);
            return null;
        }
    }
} 

// Test the location service when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const locationService = new LocationService();
    const cityElement = document.getElementById('user-city');
    
    try {
        const city = await locationService.getUserCity();
        cityElement.textContent = city ? `Your city: ${city}` : 'Location not available';
    } catch (error) {
        cityElement.textContent = 'Could not get location';
    }
}); 