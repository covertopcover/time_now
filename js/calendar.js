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

async function createMonthCalendar(date, isCurrentMonth = false) {
    const container = document.createElement('div');
    container.className = isCurrentMonth ? '' : 'block';
    
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    container.appendChild(header);
    
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
                if (currentDay.getDay() === 0) {
                    cell.style.color = '#FF0000';
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
    
    for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(currentDate);
        futureDate.setMonth(currentDate.getMonth() + i);
        const calendar = await createMonthCalendar(futureDate, false);
        futureMonthsContainer.appendChild(calendar);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Empty initialization
});
