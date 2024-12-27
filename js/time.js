function updateDisplay(date) {
    const dateElement = document.getElementById('date');
    const clockElement = document.getElementById('clock');
    
    dateElement.textContent = date.toLocaleDateString('lt-LT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    clockElement.textContent = date.toLocaleTimeString('lt-LT');
}

async function fetchTime() {
    try {
        const response = await fetch('/api/time');
        
        // Check if response is OK and is JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Not a JSON response');
        }

        const data = await response.json();
        if (!data.timestamp) {
            throw new Error('Invalid timestamp received');
        }

        const date = new Date(Number(data.timestamp));
        updateDisplay(date);
        
        // Check if day changed and update related displays
        if (date.getHours() === 0 && date.getMinutes() === 0) {
            createCalendar(date);
            createFutureMonths(date);
            updateMoonDisplay(date);
        }
    } catch (error) {
        console.error('Using local time due to API error:', error);
        const fallbackDate = new Date();
        updateDisplay(fallbackDate);
    }
}

// Initial fetch only
fetchTime();

// Update clock every second using local time
setInterval(() => {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    clockElement.textContent = now.toLocaleTimeString('lt-LT');
}, 1000);
