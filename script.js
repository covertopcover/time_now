// Track page view with detailed properties
mixpanel.track('Page View', {
    // Page Information
    'page_title': document.title,
    'url': window.location.href,
    'path': window.location.pathname,
    'referrer': document.referrer || 'direct',
    
    // Device & Screen
    'screen_width': window.innerWidth,
    'screen_height': window.innerHeight,
    'device_type': /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    
    // User Environment
    'language': navigator.language,
    'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'user_agent': navigator.userAgent,
    
    // Time
    'local_time': new Date().toLocaleString(),
    'timestamp': new Date().toISOString()
});

function updateTime() {
    const clockElement = document.getElementById('clock');
    const currentTime = new Date();
    clockElement.textContent = currentTime.toLocaleTimeString();
}

// Update time every second
setInterval(updateTime, 1000);

// Initial call to display time immediately
updateTime();