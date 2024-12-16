function getMoonPhase(date) {
    // Moon cycle is 29.53 days
    const synodicMonth = 29.53;
    
    // Known new moon date (using a reference point)
    const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
    
    // Calculate days since known new moon
    const daysSinceNewMoon = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
    
    // Calculate current phase (0 to 1)
    const phase = ((daysSinceNewMoon % synodicMonth) / synodicMonth);
    
    // Determine moon phase symbol and name
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
    
    // Find current phase
    let currentPhase;
    for (let i = 0; i < phases.length; i++) {
        if (phase <= phases[i].max) {
            currentPhase = phases[i];
            break;
        }
    }
    
    // Calculate illumination (simple approximation)
    const illumination = Math.abs(Math.cos(phase * 2 * Math.PI) * 100);
    
    return {
        symbol: currentPhase.symbol,
        name: currentPhase.name,
        illumination: Math.round(illumination),
        daysUntilFull: Math.round(14.765 - (phase * synodicMonth))
    };
}

function updateMoonDisplay(date) {
    const moonPhase = getMoonPhase(date);
    
    document.getElementById('moon-phase-symbol').textContent = moonPhase.symbol;
    document.getElementById('moon-phase-name').textContent = moonPhase.name;
    document.getElementById('moon-illumination').textContent = 
        `${moonPhase.illumination}% illuminated`;
    document.getElementById('moon-full').textContent = 
        `Full moon in ${moonPhase.daysUntilFull} days`;
}
