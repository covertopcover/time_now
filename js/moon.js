// Astronomical constants
const JULIAN_EPOCH = 2451545.0;              // J2000.0
const JULIAN_DAYS_PER_CENTURY = 36525.0;     // Days in Julian century
const SYNODIC_MONTH = 29.530588853;          // Average length of synodic month

// Improve cache structure with TypeScript-like interface
const moonCache = {
    lastUpdate: null,
    data: null,
    isStale: function() {
        return !this.lastUpdate || (new Date() - this.lastUpdate) > 24 * 60 * 60 * 1000;
    }
};

// Convert regular date to Julian Date
function getJulianDate(date) {
    const time = date.getTime();
    return (time / 86400000) + 2440587.5;
}

// Calculate number of centuries since J2000.0
function getJulianCentury(jd) {
    return (jd - JULIAN_EPOCH) / JULIAN_DAYS_PER_CENTURY;
}

// Calculate Moon's orbital elements
function getMoonOrbitalElements(T) {
    // Mean elongation of the Moon
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0;
    
    // Sun's mean anomaly
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
    
    // Moon's mean anomaly
    const Mprime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
    
    return { D, M, Mprime };
}

// Calculate basic moon phase without full moon prediction
function calculateMoonPhase(date) {
    const jd = getJulianDate(date);
    const T = getJulianCentury(jd);
    const { D, M, Mprime } = getMoonOrbitalElements(T);
    
    // Normalize to range 0-360
    const normalizedD = D % 360;
    
    // Convert to phase (0-1)
    return normalizedD / 360;
}

// Main function to get moon phase and details
function getMoonPhase(date) {
    // Use cached data if available and fresh
    if (moonCache.data && !moonCache.isStale()) {
        return moonCache.data;
    }

    const jd = getJulianDate(date);
    const T = getJulianCentury(jd);
    const { D, M, Mprime } = getMoonOrbitalElements(T);
    const phase = calculateMoonPhase(date);
    
    const phases = [
        { symbol: '🌑', name: 'New Moon', max: 0.0625 },
        { symbol: '🌒', name: 'Waxing Crescent', max: 0.1875 },
        { symbol: '🌓', name: 'First Quarter', max: 0.3125 },
        { symbol: '🌔', name: 'Waxing Gibbous', max: 0.4375 },
        { symbol: '🌕', name: 'Full Moon', max: 0.5625 },
        { symbol: '🌖', name: 'Waning Gibbous', max: 0.6875 },
        { symbol: '🌗', name: 'Last Quarter', max: 0.8125 },
        { symbol: '🌘', name: 'Waning Crescent', max: 0.9375 },
        { symbol: '🌑', name: 'New Moon', max: 1.0 }
    ];

    // Find current phase using find() instead of for loop
    const currentPhase = phases.find(p => phase <= p.max) || phases[0];
    
    // Simplify full moon calculations
    const daysUntilFull = ((0.5 - phase + (phase > 0.5 ? 1 : 0)) * SYNODIC_MONTH);
    const nextFullMoon = new Date(date.getTime() + (daysUntilFull * 24 * 60 * 60 * 1000));

    return {
        phase,
        symbol: currentPhase.symbol,
        name: currentPhase.name,
        julianDate: jd,
        T,
        D,
        M,
        Mprime,
        nextFullMoon,
        daysUntilFullMoon: Math.round(daysUntilFull)
    };
}

// Simplify update display function
function updateMoonDisplay(date) {
    const { symbol, name, nextFullMoon, daysUntilFullMoon } = getMoonPhase(date);
    
    document.getElementById('moon-phase-symbol').textContent = symbol;
    document.getElementById('moon-phase-name').textContent = name;
    document.getElementById('moon-full').textContent = 
        `Next full moon: ${nextFullMoon.toLocaleDateString()} (in ${daysUntilFullMoon} days)`;
}

// Make test function globally available
window.testMoonPhase = function() {
    const result = getMoonPhase(new Date());
    console.log('Test Results:', result);
};

// Modified initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateMoonDisplay(new Date());
    
    // Update every 24 hours
    setInterval(() => {
        updateMoonDisplay(new Date());
    }, 24 * 60 * 60 * 1000);
});
