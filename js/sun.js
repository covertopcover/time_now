// Location service with caching
const locationService = {
    coords: null,
    
    // Check if we have cached coordinates
    getCachedCoords() {
        const cached = localStorage.getItem('userLocation');
        return cached ? JSON.parse(cached) : null;
    },

    // Save coordinates to cache
    saveCoords(coords) {
        this.coords = coords;
        localStorage.setItem('userLocation', JSON.stringify(coords));
    },

    // Get location using browser geolocation
    async getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!("geolocation" in navigator)) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.saveCoords(coords);
                    resolve(coords);
                },
                (error) => reject(error)
            );
        });
    },

    // Get location using IP (fallback)
    async getIPBasedLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const coords = {
                latitude: data.latitude,
                longitude: data.longitude
            };
            this.saveCoords(coords);
            return coords;
        } catch (error) {
            throw new Error('Failed to get IP-based location');
        }
    },

    // Main method to get location
    async getLocation() {
        // First, try to get cached coordinates
        const cached = this.getCachedCoords();
        if (cached) {
            this.coords = cached;
            return cached;
        }

        try {
            // Try browser geolocation first
            return await this.getBrowserLocation();
        } catch (error) {
            console.log('Browser geolocation failed, trying IP-based location');
            try {
                // Fall back to IP-based location
                return await this.getIPBasedLocation();
            } catch (ipError) {
                console.error('All location methods failed');
                throw ipError;
            }
        }
    },

    // Add reverse geocoding using OpenStreetMap's Nominatim
    async getLocationName(latitude, longitude) {
        try {
            const cached = localStorage.getItem('locationName');
            if (cached) {
                const { name, timestamp } = JSON.parse(cached);
                // Cache for 30 days
                if (timestamp && (Date.now() - timestamp) < 30 * 24 * 60 * 60 * 1000) {
                    return name;
                }
            }

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { 'Accept-Language': navigator.language || 'en' } }
            );
            const data = await response.json();
            
            // Extract city and country, fallback to address parts if needed
            const locationName = this.formatLocationName(data.address);
            
            // Cache the result with timestamp
            localStorage.setItem('locationName', JSON.stringify({
                name: locationName,
                timestamp: Date.now()
            }));
            
            return locationName;
        } catch (error) {
            console.error('Failed to get location name:', error);
            return null;
        }
    },

    formatLocationName(address) {
        if (!address) return 'Unknown location';
        
        const city = address.city || address.town || address.village || address.suburb;
        const country = address.country;
        
        if (city && country) {
            return `${city}, ${country}`;
        } else if (country) {
            return country;
        }
        return 'Unknown location';
    },

    async getCountryCode() {
        try {
            const coords = await this.getLocation();
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
            );
            const data = await response.json();
            return data.address.country_code;
        } catch (error) {
            console.error('Failed to get country code:', error);
            return null; // Return null instead of defaulting to 'lt'
        }
    }
}; 

// Function to format time in HH:MM format
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Function to format duration in hours and minutes
function formatDayLength(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
}

// Function to update sun information
async function updateSunInfo() {
    try {
        const coords = await locationService.getLocation();
        const today = new Date();
        
        // Get sun times for the current location and date
        const times = SunCalc.getTimes(today, coords.latitude, coords.longitude);
        
        // Calculate day length in minutes
        const dayLength = (times.sunset - times.sunrise) / (1000 * 60);
        
        // Update the display
        document.getElementById('day-length').textContent = `Day length: ${formatDayLength(dayLength)}`;
        document.getElementById('sunrise-time').textContent = `Sunrise: ${formatTime(times.sunrise)}`;
        document.getElementById('sunset-time').textContent = `Sunset: ${formatTime(times.sunset)}`;
        
    } catch (error) {
        console.error('Error updating sun info:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateSunInfo();
    
    // Schedule next update at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;
    
    // First update at next midnight
    setTimeout(() => {
        updateSunInfo();
        // Then schedule updates every 24 hours
        setInterval(updateSunInfo, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}); 