class NameDays {
    constructor() {
        this.namedays = null;
    }

    async init() {
        try {
            const response = await fetch('data/namedays.json');
            const data = await response.json();
            this.namedays = data;
            this.updateDisplay();
        } catch (error) {
            console.error('Failed to load namedays:', error);
        }
    }

    findNamesByDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${month}.${day}`;
        
        const entry = this.namedays.find(day => day.date === formattedDate);
        return entry ? entry.names : '';
    }

    updateDisplay() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayNames = this.findNamesByDate(today);
        const tomorrowNames = this.findNamesByDate(tomorrow);

        document.getElementById('today-names').textContent = todayNames;
        document.getElementById('tomorrow-names').textContent = tomorrowNames;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const nameDays = new NameDays();
    nameDays.init();
}); 