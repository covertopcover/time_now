class CookieManager {
    constructor() {
        this.cookieConsent = document.getElementById('cookie-consent');
        this.initializeCookieConsent();
    }

    initializeCookieConsent() {
        if (!this.getCookie('cookieConsent')) {
            this.cookieConsent.classList.add('visible');
        }

        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.setCookie('cookieConsent', 'accepted', 365);
            this.cookieConsent.classList.remove('visible');
            this.initializeAnalytics();
        });

        document.getElementById('reject-cookies').addEventListener('click', () => {
            this.setCookie('cookieConsent', 'rejected', 365);
            this.cookieConsent.classList.remove('visible');
            this.disableAnalytics();
        });
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict;Secure`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    initializeAnalytics() {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    disableAnalytics() {
        gtag('consent', 'update', {
            'analytics_storage': 'denied'
        });
    }
}

// Initialize cookie management
document.addEventListener('DOMContentLoaded', () => {
    new CookieManager();
}); 