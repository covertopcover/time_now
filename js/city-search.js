class CitySearch {
    constructor() {
        this.citySpan = document.querySelector('.city-name');
        this.searchIcon = document.querySelector('.search-icon');
        this.setupInput();
        this.bindEvents();
    }

    setupInput() {
        this.input = document.createElement('input');
        this.input.className = 'city-input';
        this.input.type = 'text';
        this.input.placeholder = 'Įveskite miestą...';
        document.getElementById('user-city').appendChild(this.input);
    }

    bindEvents() {
        this.searchIcon.addEventListener('click', () => this.showInput());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('blur', () => this.hideInput());
    }

    showInput() {
        this.citySpan.style.display = 'none';
        this.searchIcon.style.display = 'none';
        document.getElementById('user-city').classList.add('search-active');
        this.input.classList.add('active');
        this.input.focus();
    }

    hideInput() {
        this.input.classList.remove('active');
        document.getElementById('user-city').classList.remove('search-active');
        this.citySpan.style.display = 'inline';
        this.searchIcon.style.display = 'inline';
        this.input.value = '';
    }

    handleKeydown(event) {
        if (event.key === 'Escape') {
            this.hideInput();
        } else if (event.key === 'Enter' && this.input.value.trim()) {
            this.updateCity(this.input.value.trim());
        }
    }

    async updateCity(newCity) {
        // Store in cookies
        document.cookie = `userCity=${newCity};path=/;max-age=31536000`; // 1 year
        
        // Update header display
        this.citySpan.textContent = newCity;
        
        // Update weather section city display
        document.querySelector('.weather-city').textContent = newCity;
        
        this.hideInput();

        // Update weather data
        try {
            const weatherService = new WeatherService();
            await weatherService.getForecast(newCity);
        } catch (error) {
            console.error('Failed to update weather:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CitySearch();
}); 