// Example usage in components:

import config from '../path/to/config';

// Method 1: Direct URL (for production)
const response = await axios.get(`${window.location.origin}${config.API_URL}tally/ledgers`);

// Method 2: Using helper
const response = await axios.get(config.getFullUrl('tally/ledgers'));

// Method 3: Environment variable (recommended)
const response = await axios.get(`${process.env.REACT_APP_API_URL || window.location.origin + '/api/'}tally/ledgers`);
