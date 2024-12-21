export default async function handler(req, res) {
    try {
        const { countryCode, year } = req.query;
        
        if (!countryCode || !year) {
            return res.status(400).json({ error: 'Missing countryCode or year' });
        }

        // Known specific formats for certain countries
        const knownFormats = {
            'lt': ['en.lithuanian#holiday@group.v.calendar.google.com'],
            'us': ['en.usa#holiday@group.v.calendar.google.com'],
            'uk': ['en.uk#holiday@group.v.calendar.google.com'],
            'de': ['en.german#holiday@group.v.calendar.google.com'],
            'fr': ['en.french#holiday@group.v.calendar.google.com'],
            'es': ['en.spanish#holiday@group.v.calendar.google.com']
        };

        const code = countryCode.toLowerCase();
        const formatsToTry = knownFormats[code] || [`en.${code}#holiday@group.v.calendar.google.com`];

        let holidays = null;
        let lastError = null;

        // Try each format until one works
        for (const format of formatsToTry) {
            try {
                const calendarId = encodeURIComponent(format);
                console.log('Trying Calendar ID:', calendarId);
                
                const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${process.env.GOOGLE_CALENDAR_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z&singleEvents=true`;
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    holidays = data.items.map(event => ({
                        date: event.start.date,
                        name: event.summary
                    }));
                    break; // Exit loop if successful
                }
                
                lastError = await response.text();
            } catch (err) {
                lastError = err.message;
            }
        }

        if (holidays) {
            res.json(holidays);
        } else {
            throw new Error(`Failed to fetch holidays for ${countryCode}: ${lastError}`);
        }
        
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch holidays' });
    }
} 