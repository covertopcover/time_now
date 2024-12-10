const NTPClient = require('ntp-time').Client;
const client = new NTPClient();

module.exports = async (req, res) => {
  try {
    const ntpDate = await client.getNetworkTime('time.google.com');
    res.json({
      timestamp: ntpDate.getTime(),
      formatted: ntpDate.toLocaleString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time' });
  }
}
