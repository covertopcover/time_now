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
    
    // Simplified phase names
    let phaseName;
    if (phase <= 0.0625 || phase > 0.9375) phaseName = 'New Moon';
    else if (phase <= 0.1875) phaseName = 'Waxing Crescent';
    else if (phase <= 0.3125) phaseName = 'First Quarter';
    else if (phase <= 0.4375) phaseName = 'Waxing Gibbous';
    else if (phase <= 0.5625) phaseName = 'Full Moon';
    else if (phase <= 0.6875) phaseName = 'Waning Gibbous';
    else if (phase <= 0.8125) phaseName = 'Last Quarter';
    else phaseName = 'Waning Crescent';

    // Simplify full moon calculations
    const daysUntilFull = ((0.5 - phase + (phase > 0.5 ? 1 : 0)) * SYNODIC_MONTH);
    const nextFullMoon = new Date(date.getTime() + (daysUntilFull * 24 * 60 * 60 * 1000));

    return {
        phase,
        name: phaseName,
        julianDate: jd,
        T,
        D,
        M,
        Mprime,
        nextFullMoon,
        daysUntilFullMoon: Math.round(daysUntilFull)
    };
}

function generateMoonShadowPath(phase) {
    const r = 48; // radius should match the circle radius
    const cx = 50; // center x
    const cy = 50; // center y
    
    // Normalize phase to handle edge cases
    const normalizedPhase = phase % 1;
    
    if (normalizedPhase <= 0.5) {
        // Waxing moon (new to full) - shadow moves right to left
        const x = cx - r * Math.cos(2 * Math.PI * normalizedPhase);
        return `
            M ${cx},${cy - r}
            A ${r},${r} 0 1,0 ${cx},${cy + r}
            A ${Math.abs(x - cx)},${r} 0 0,0 ${cx},${cy - r}
            Z
        `;
    } else {
        // Waning moon (full to new) - shadow moves left to right
        const x = cx - r * Math.cos(2 * Math.PI * normalizedPhase);
        return `
            M ${cx},${cy - r}
            A ${r},${r} 0 1,1 ${cx},${cy + r}
            A ${Math.abs(x - cx)},${r} 0 0,1 ${cx},${cy - r}
            Z
        `;
    }
}

function updateMoonDisplay(date) {
    const { phase, name, nextFullMoon, daysUntilFullMoon } = getMoonPhase(date);
    
    // Update the SVG shadow path
    const shadowPath = document.getElementById('moon-shadow');
    shadowPath.setAttribute('d', generateMoonShadowPath(phase));
    
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
