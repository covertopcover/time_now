// Fixed coordinates for Lithuania (Kaunas, as it's roughly central)
const LITHUANIA_COORDS = {
    latitude: 54.8985,
    longitude: 23.9036
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
function updateSunInfo() {
    const today = new Date();
    
    // Get sun times for Lithuania
    const times = SunCalc.getTimes(
        today, 
        LITHUANIA_COORDS.latitude, 
        LITHUANIA_COORDS.longitude
    );
    
    // Calculate day length in minutes
    const dayLength = (times.sunset - times.sunrise) / (1000 * 60);
    
    // Update the display
    document.getElementById('day-length').textContent = `Ilgumas: ${formatDayLength(dayLength)}`;
    document.getElementById('sunrise-time').textContent = `Teka: ${formatTime(times.sunrise)}`;
    document.getElementById('sunset-time').textContent = `Leidžiasi: ${formatTime(times.sunset)}`;
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