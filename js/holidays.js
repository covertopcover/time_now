// Make it available globally
window.LithuanianHolidays = {
    holidays: new Map(),

    async loadHolidays() {
        try {
            const response = await fetch('/data/lithuania-holidays.json');
            const data = await response.json();
            
            this.holidays.clear();
            data.holidays.forEach(holiday => {
                this.holidays.set(holiday.date, holiday.name);
            });
        } catch (error) {
            console.error('Failed to load holidays:', error);
        }
    },

    isHoliday(dateString) {
        const formattedDate = dateString instanceof Date ? 
            dateString.toISOString().split('T')[0] : 
            dateString;
        
        return this.holidays.has(formattedDate);
    },

    getHolidayName(dateString) {
        const formattedDate = dateString instanceof Date ? 
            dateString.toISOString().split('T')[0] : 
            dateString;
        
        return this.holidays.get(formattedDate);
    }
};