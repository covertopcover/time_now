const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            throw new Error('Unsplash API key not configured');
        }

        const url = `https://api.unsplash.com/photos/random?query=lithuania nature&orientation=landscape`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({
            url: data.urls.regular,
            author: data.user.name,
            authorUrl: data.user.links.html,
            downloadLocation: data.links.download_location
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch photo',
            details: error.message 
        });
    }
}; 