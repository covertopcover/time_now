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
