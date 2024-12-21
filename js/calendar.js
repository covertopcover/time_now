function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 1);
    if (firstThursday.getDay() !== 4) {
        firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay()) + 7) % 7);
    }
    const weekNum = 1 + Math.ceil((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return weekNum > 52 ? 52 : weekNum;
}

async function createCalendar(date) {
    const headerElement = document.getElementById('calendar-header');
    headerElement.textContent = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    const calendar = await createMonthCalendar(date, true);
    const currentCalendarContainer = document.getElementById('calendar');
    currentCalendarContainer.innerHTML = '';
    currentCalendarContainer.appendChild(calendar);
}

async function getHolidays(year) {
    try {
        const countryCode = await locationService.getCountryCode();
        if (!countryCode) return null; // Return null if no country code

        const response = await fetch(`/api/holidays?countryCode=${countryCode}&year=${year}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return null;
    }
}

async function createMonthCalendar(date, isCurrentMonth = false, preloadedHolidays = null) {
    const container = document.createElement('div');
    container.className = isCurrentMonth ? '' : 'block';
    
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    container.appendChild(header);
    
    const holidays = preloadedHolidays || await getHolidays(date.getFullYear());
    
    const holidayMap = holidays ? new Map(
        holidays.map(h => [h.date, h.name])
    ) : new Map();
    
    const table = document.createElement('table');
    table.className = 'calendar-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Wk</th>
            <th>Mo</th>
            <th>Tu</th>
            <th>We</th>
            <th>Th</th>
            <th>Fr</th>
            <th>Sa</th>
            <th>Su</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    let currentDay = new Date(firstDay);
    currentDay.setDate(currentDay.getDate() - (firstDay.getDay() || 7) + 1);
    
    while (currentDay <= lastDay || currentDay.getDay() !== 1) {
        const row = document.createElement('tr');
        
        const weekNum = document.createElement('td');
        weekNum.textContent = getWeekNumber(currentDay);
        row.appendChild(weekNum);
        
        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            if (currentDay.getMonth() === date.getMonth()) {
                const dateStr = currentDay.toISOString().slice(0, 10);
                const localDateStr = new Date(currentDay.getTime() - currentDay.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
                
                const isHoliday = holidayMap.has(localDateStr);
                
                if (isHoliday || currentDay.getDay() === 0) {
                    cell.classList.add('holiday-date');
                }
                
                if (isHoliday) {
                    cell.title = holidayMap.get(localDateStr);
                }
                
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

async function createFutureMonths(currentDate) {
    const futureMonthsContainer = document.getElementById('future-months');
    futureMonthsContainer.innerHTML = '';
    
    // Pre-fetch holidays for the current and next year to avoid multiple API calls
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = 'Loading calendars...';
    futureMonthsContainer.appendChild(loadingDiv);
    
    try {
        // Pre-fetch holidays for both years at once
        const [currentYearHolidays, nextYearHolidays] = await Promise.all([
            getHolidays(currentYear),
            getHolidays(nextYear)
        ]);

        // Create all calendars at once
        const calendarPromises = [];
        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date(currentDate);
            futureDate.setMonth(currentDate.getMonth() + i);
            
            // Pass the pre-fetched holidays to createMonthCalendar
            const calendar = createMonthCalendar(
                futureDate, 
                false, 
                futureDate.getFullYear() === currentYear ? currentYearHolidays : nextYearHolidays
            );
            calendarPromises.push(calendar);
        }

        // Wait for all calendars to be created
        const calendars = await Promise.all(calendarPromises);
        
        // Clear container before adding new calendars
        futureMonthsContainer.innerHTML = '';
        
        // Add all calendars to the container
        calendars.forEach(calendar => {
            futureMonthsContainer.appendChild(calendar);
        });
    } catch (error) {
        console.error('Error creating future months:', error);
        futureMonthsContainer.innerHTML = 'Error loading calendars';
    } finally {
        // Remove loading indicator
        loadingDiv.remove();
    }
}

// Update the initialization code
document.addEventListener('DOMContentLoaded', async function() {
    const currentDate = new Date();
    
    // Create current and future calendars in parallel
    await Promise.all([
        createCalendar(currentDate),
        createFutureMonths(currentDate)
    ]);
});
