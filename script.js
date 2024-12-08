function updateTime() {
    const clockElement = document.getElementById('clock');
    const currentTime = new Date();
    clockElement.textContent = currentTime.toLocaleTimeString();
}

// Update time every second
setInterval(updateTime, 1000);

// Initial call to display time immediately
updateTime();

// Wait for Mixpanel to load
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize Mixpanel if not on localhost
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        // Check if mixpanel is available
        if (typeof mixpanel !== 'undefined') {
            // Initialize Mixpanel
            mixpanel.init('5f6a9500d7a08460964b66e27566ca2b', {debug: true});

            // Track page view
            mixpanel.track('Page View', {
                'page': window.location.pathname,
                'url': window.location.href,
                'timestamp': new Date().toISOString()
            });
        } else {
            console.error('Mixpanel library not loaded');
        }
    }
});