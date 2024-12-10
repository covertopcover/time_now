const NTPClient = require('ntp-time').Client;
const client = new NTPClient();

module.exports = async (req, res) => {
  try {
    console.log('Attempting to connect to NTP server...');
    const ntpDate = await client.syncTime();
    console.log('NTP Response received:', ntpDate);
    
    const jsTimestamp = new Date(ntpDate.time).getTime();
    
    res.json({
      timestamp: jsTimestamp,
      formatted: new Date(jsTimestamp).toLocaleString()
    });
  } catch (error) {
    console.error('Detailed NTP Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to fetch time',
      details: error.message 
    });
  }
}
