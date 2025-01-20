class CookieManager {
    constructor() {
        this.cookieConsent = document.getElementById('cookie-consent');
        this.COOKIE_VERSION = '3';  // Increment version to force re-consent
        this.resetIfOldVersion();   // This will run first
        this.initializeCookieConsent();
    }

    resetIfOldVersion() {
        const currentVersion = this.getCookie('cookieVersion');
        if (!currentVersion || currentVersion !== this.COOKIE_VERSION) {
            // Clear ALL existing cookies
            this.deleteCookie('cookieConsent');
            this.deleteCookie('cookieVersion');
            this.deleteCookie('userCity');  // Clear city preference too
            
            // Clear GA cookies if they exist
            this.deleteCookie('_ga');
            this.deleteCookie('_ga_5S2F5FLR18');
            
            // Force analytics to denied state
            if (window.location.hostname.endsWith('diena24.lt')) {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        }
    }

    initializeCookieConsent() {
        if (!this.getCookie('cookieConsent')) {
            this.cookieConsent.classList.add('visible');
        }

        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.setCookie('cookieConsent', 'accepted', 365);
            this.setCookie('cookieVersion', this.COOKIE_VERSION, 365);
            this.cookieConsent.classList.remove('visible');
            this.initializeAnalytics();
        });

        document.getElementById('reject-cookies').addEventListener('click', () => {
            this.setCookie('cookieConsent', 'rejected', 365);
            this.setCookie('cookieVersion', this.COOKIE_VERSION, 365);
            this.cookieConsent.classList.remove('visible');
            this.disableAnalytics();
        });
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
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