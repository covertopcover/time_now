const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const city = req.params.city;
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required' });
    }
    
    try {
        const url = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            details: error.message 
        });
    }
}; 