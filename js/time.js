function updateDisplay(date) {
    const dateElement = document.getElementById('date');
    const clockElement = document.getElementById('clock');
    
    dateElement.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    clockElement.textContent = date.toLocaleTimeString();
}

async function fetchTime() {
    try {
        const response = await fetch('/api/time');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if (!data.timestamp) {
            throw new Error('Invalid timestamp received');
        }

        const date = new Date(Number(data.timestamp));
        updateDisplay(date);
        
        if (!window.calendarInitialized) {
            createCalendar(date);
            createFutureMonths(date);
            updateMoonDisplay(date);
            window.calendarInitialized = true;
            setupMidnightUpdate();
        }
    } catch (error) {
        console.error('Error:', error);
        const fallbackDate = new Date();
        updateDisplay(fallbackDate);
        
        if (!window.calendarInitialized) {
            createCalendar(fallbackDate);
            createFutureMonths(fallbackDate);
            updateMoonDisplay(fallbackDate);
            window.calendarInitialized = true;
            setupMidnightUpdate();
        }
    }
}

// Initial fetch
fetchTime();

// Update time every 5 minutes
setInterval(fetchTime, 300000);

// Update clock every second using local time
setInterval(() => {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    clockElement.textContent = now.toLocaleTimeString();
}, 1000);

// Assuming this is where your clock update logic lives
async function updateTimeDisplay() {
    // ... existing time update code ...

    // Update location if needed
    if (!document.getElementById('location-info').textContent) {
        try {
            const coords = await locationService.getLocation();
            const locationName = await locationService.getLocationName(coords.latitude, coords.longitude);
            if (locationName) {
                document.getElementById('location-info').textContent = locationName;
            }
        } catch (error) {
            console.error('Error getting location name:', error);
        }
    }
}

async function updateLocationDisplay() {
    try {
        const coords = await locationService.getLocation();
        const locationName = await locationService.getLocationName(coords.latitude, coords.longitude);
        if (locationName) {
            const locationElement = document.getElementById('location-info');
            if (locationElement) {
                locationElement.textContent = locationName;
            } else {
                console.error('Location info element not found');
            }
        }
    } catch (error) {
        console.error('Error updating location:', error);
    }
}

// Add to your initialization
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    updateLocationDisplay(); // Add this line
});

function setupMidnightUpdate() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;
    
    // Update at midnight
    setTimeout(() => {
        const date = new Date();
        createCalendar(date);
        createFutureMonths(date);
        updateMoonDisplay(date);
        
        // Schedule next update in 24 hours
        setInterval(() => {
            const newDate = new Date();
            createCalendar(newDate);
            createFutureMonths(newDate);
            updateMoonDisplay(newDate);
        }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}
