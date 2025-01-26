class CitySearch {
    constructor() {
        this.citySpan = document.querySelector('.city-name');
        this.searchIcon = document.querySelector('.search-icon');
        this.cities = null;
        this.suggestions = [];
        this.setupInput();
        this.setupSuggestions();
        this.bindEvents();
    }

    setupInput() {
        this.input = document.createElement('input');
        this.input.className = 'city-input';
        this.input.type = 'text';
        this.input.id = 'city-search';
        this.input.name = 'city';
        this.input.placeholder = 'Įveskite miestą...';
        document.getElementById('user-city').appendChild(this.input);
    }

    setupSuggestions() {
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'suggestions-container';
        document.getElementById('user-city').appendChild(this.suggestionsContainer);
    }

    async loadCities() {
        if (this.cities) return;
        try {
            const response = await fetch('/data/places.json');
            this.cities = await response.json();
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    }

    showSuggestions(input) {
        if (!this.cities) return;
        
        // Normalize function to convert Lithuanian characters
        const normalize = (str) => {
            return str.toLowerCase()
                .replace(/ą/g, 'a')
                .replace(/č/g, 'c')
                .replace(/ę/g, 'e')
                .replace(/ė/g, 'e')
                .replace(/į/g, 'i')
                .replace(/š/g, 's')
                .replace(/ų/g, 'u')
                .replace(/ū/g, 'u')
                .replace(/ž/g, 'z');
        };
        
        const normalizedInput = normalize(input);
        
        const matches = this.cities
            .filter(city => normalize(city.name).startsWith(normalizedInput))
            .slice(0, 5);

        this.suggestionsContainer.innerHTML = '';
        
        if (matches.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'suggestion-item';
            noResults.textContent = 'Nieko nerasta';
            this.suggestionsContainer.appendChild(noResults);
            return;
        }

        matches.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = city.name;  // Still display original name with proper characters
            div.addEventListener('click', () => this.handleSelection(city.name));
            this.suggestionsContainer.appendChild(div);
        });
    }

    handleSelection(cityName) {
        this.updateCity(cityName);
        this.suggestionsContainer.innerHTML = '';
    }

    bindEvents() {
        this.searchIcon.addEventListener('click', async () => {
            await this.loadCities();
            this.showInput();
        });
        
        this.input.addEventListener('input', (e) => {
            const value = e.target.value;
            this.showSuggestions(value);
        });
        
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('blur', () => {
            // Small delay to allow click events on suggestions
            setTimeout(() => {
                this.hideInput();
                this.suggestionsContainer.innerHTML = '';
            }, 200);
        });
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