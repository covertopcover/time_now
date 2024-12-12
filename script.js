// Check if we're not on localhost
if (!window.location.hostname.includes('localhost')) {
    // Mixpanel initialization
    (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0));for(var c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
    MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
    
    mixpanel.init('5f6a9500d7a08460964b66e27566ca2b');
}

// Track page view with detailed properties
mixpanel.track('Page Viewed', {
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

// Define calendar functions first
function createCalendar(date) {
    const headerElement = document.getElementById('calendar-header');
    const bodyElement = document.getElementById('calendar-body');
    
    // Set month and year in header
    headerElement.textContent = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    // Clear existing calendar
    bodyElement.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Adjust first day to previous Monday if needed
    let currentDay = new Date(firstDay);
    currentDay.setDate(currentDay.getDate() - (firstDay.getDay() || 7) + 1);
    
    // Create calendar rows
    while (currentDay <= lastDay || currentDay.getDay() !== 1) {
        const row = document.createElement('tr');
        
        // Add week number
        const weekNum = document.createElement('td');
        weekNum.textContent = getWeekNumber(currentDay);
        row.appendChild(weekNum);
        
        // Add days
        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            if (currentDay.getMonth() === date.getMonth()) {
                cell.textContent = currentDay.getDate();
                if (currentDay.getDate() === date.getDate() && 
                    currentDay.getMonth() === date.getMonth()) {
                    cell.classList.add('current-day');
                }
            }
            row.appendChild(cell);
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        bodyElement.appendChild(row);
    }
}

function getWeekNumber(date) {
    // Copy date to prevent modifying the original
    const target = new Date(date.valueOf());
    
    // ISO week date weeks start on Monday
    const dayNr = (date.getDay() + 6) % 7;
    
    // Set to nearest Thursday: current date + 4 - current day number
    target.setDate(target.getDate() - dayNr + 3);
    
    // Get first day of year
    const firstThursday = new Date(target.getFullYear(), 0, 1);
    
    // Set to nearest Thursday
    if (firstThursday.getDay() !== 4) {
        firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay()) + 7) % 7);
    }
    
    // Calculate week number
    const weekNum = 1 + Math.ceil((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    
    // Ensure we return 52 for the last week of the year
    return weekNum > 52 ? 52 : weekNum;
}

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

// Add this new function to create a calendar for any month
function createMonthCalendar(date, isCurrentMonth = false) {
    const container = document.createElement('div');
    container.className = 'block calendar-block';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    container.appendChild(header);
    
    // Create table
    const table = document.createElement('table');
    table.className = 'calendar-table';
    
    // Add weekday headers
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Wk</th>
            <th>Mo</th>
            <th>Tu</th>
            <th>We</th>
            <th>Th</th>
            <th>Fr</th>
            <th>Su</th>
            <th>Sa</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create tbody and fill with dates
    const tbody = document.createElement('tbody');
    
    // Get first day of month and total days
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Adjust first day to previous Monday
    let currentDay = new Date(firstDay);
    currentDay.setDate(currentDay.getDate() - (firstDay.getDay() || 7) + 1);
    
    // Create calendar rows
    while (currentDay <= lastDay || currentDay.getDay() !== 1) {
        const row = document.createElement('tr');
        
        // Add week number
        const weekNum = document.createElement('td');
        weekNum.textContent = getWeekNumber(currentDay);
        row.appendChild(weekNum);
        
        // Add days
        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            if (currentDay.getMonth() === date.getMonth()) {
                cell.textContent = currentDay.getDate();
                if (isCurrentMonth && 
                    currentDay.getDate() === date.getDate() && 
                    currentDay.getMonth() === date.getMonth()) {
                    cell.classList.add('current-day');
                }
            }
            row.appendChild(cell);
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
    return container;
}

// Add this function to create all future months
function createFutureMonths(currentDate) {
    const futureMonthsContainer = document.getElementById('future-months');
    futureMonthsContainer.innerHTML = ''; // Clear existing calendars
    
    // Create next 12 months
    for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(currentDate.getMonth() + i);
        const calendar = createMonthCalendar(futureDate, false);
        futureMonthsContainer.appendChild(calendar);
    }
}

// Modify the existing fetchTime function to include future months
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
            createCalendar(date);  // Current month
            createFutureMonths(date);  // Future months
            window.calendarInitialized = true;
        }
    } catch (error) {
        console.error('Error:', error);
        const fallbackDate = new Date();
        updateDisplay(fallbackDate);
        
        if (!window.calendarInitialized) {
            createCalendar(fallbackDate);
            createFutureMonths(fallbackDate);
            window.calendarInitialized = true;
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