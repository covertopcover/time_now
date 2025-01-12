class UnsplashService {
    constructor() {
        this.baseUrl = '/api/unsplash';
    }

    async getRandomPhoto() {
        try {
            const response = await fetch(this.baseUrl, {
                credentials: 'omit' // Don't send cookies
            });
            if (!response.ok) throw new Error('Failed to fetch photo');
            
            const data = await response.json();
            this.displayPhoto(data);
            return data;
        } catch (error) {
            console.error('Failed to load photo:', error);
            return null;
        }
    }

    displayPhoto(data) {
        const img = document.getElementById('lithuania-photo');
        const attribution = document.getElementById('photo-attribution');
        
        if (img && attribution) {
            // Add cache-busting parameter to prevent cookie warnings
            const imgUrl = new URL(data.url);
            imgUrl.searchParams.append('_nc', Date.now());
            
            img.src = imgUrl.toString();
            attribution.innerHTML = `Nuotrauka: <a href="${data.authorUrl}" target="_blank" rel="noopener noreferrer">${data.author}</a> / <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const unsplashService = new UnsplashService();
    unsplashService.getRandomPhoto();
}); 