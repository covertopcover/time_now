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

window.createCalendar = async function(date) {
    const container = document.getElementById('calendar');
    if (!container) {
        console.error('Calendar container not found');
        return;
    }

    container.innerHTML = '';
    const currentMonthCalendar = await createMonthCalendar(date, true);
    container.appendChild(currentMonthCalendar);
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
    const headerRow = document.createElement('tr');
    ['Wk', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    let currentDay = new Date(firstDay);
    currentDay.setDate(currentDay.getDate() - ((currentDay.getDay() + 6) % 7));
    
    while (currentDay <= lastDay || currentDay.getDay() !== 1) {
        if (currentDay.getDay() === 1) {
            const row = document.createElement('tr');
            const weekNum = document.createElement('td');
            weekNum.textContent = getWeekNumber(currentDay);
            row.appendChild(weekNum);
            
            for (let i = 0; i < 7; i++) {
                const cell = document.createElement('td');
                
                // Create date string in Lithuanian timezone
                const dateString = currentDay.toLocaleString('lt-LT', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'Europe/Vilnius'
                }).split(' ')[0].split('.').reverse().join('-');
                
                cell.textContent = currentDay.getDate();
                
                if (currentDay.getMonth() === date.getMonth()) {
                    if (window.LithuanianHolidays && window.LithuanianHolidays.isHoliday(dateString)) {
                        cell.classList.add('holiday');
                        cell.title = window.LithuanianHolidays.getHolidayName(dateString);
                    }
                    
                    if (currentDay.getDay() === 0) {
                        cell.classList.add('sunday');
                    }
                    
                    if (isCurrentMonth && 
                        currentDay.getDate() === date.getDate() && 
                        currentDay.getMonth() === date.getMonth()) {
                        cell.classList.add('current-day');
                    }
                } else {
                    cell.classList.add('other-month');
                }
                
                row.appendChild(cell);
                currentDay.setDate(currentDay.getDate() + 1);
            }
            tbody.appendChild(row);
        } else {
            currentDay.setDate(currentDay.getDate() + 1);
        }
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
    return container;
}

async function createFutureMonths(currentDate) {
    const futureMonthsContainer = document.getElementById('future-months');
    if (!futureMonthsContainer) return;

    futureMonthsContainer.innerHTML = '';
    
    try {
        // Make sure holidays are loaded before creating future months
        if (!window.LithuanianHolidays) {
            console.error('Lithuanian holidays not initialized');
            return;
        }

        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + i,
                1
            );
            
            const calendar = await createMonthCalendar(futureDate, false);
            futureMonthsContainer.appendChild(calendar);
        }
    } catch (error) {
        console.error('Error creating future months:', error);
        futureMonthsContainer.innerHTML = 'Error loading calendars';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.LithuanianHolidays) {
        await window.LithuanianHolidays.loadHolidays();
        const currentDate = new Date();
        await createCalendar(currentDate);
        await createFutureMonths(currentDate);
    }
});
