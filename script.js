mixpanel.track('Page Viewed');

function updateTime() {
    const clockElement = document.getElementById('clock');
    const currentTime = new Date();
    clockElement.textContent = currentTime.toLocaleTimeString();
}

// Update time every second
setInterval(updateTime, 1000);

// Initial call to display time immediately
updateTime();