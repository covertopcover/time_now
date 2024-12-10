const NTPClient = require('ntp-time').Client;
const client = new NTPClient();

module.exports = async (req, res) => {
  try {
    const ntpDate = await client.getNetworkTime('time.google.com');
    // Convert NTP timestamp to JavaScript timestamp (milliseconds)
    const jsTimestamp = (ntpDate.receiveTimestamp * 1000);
    
    res.json({
      timestamp: jsTimestamp,
      formatted: new Date(jsTimestamp).toLocaleString()
    });
  } catch (error) {
    console.error('NTP Error:', error);
    res.status(500).json({ error: 'Failed to fetch time' });
  }
}
