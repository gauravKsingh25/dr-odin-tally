const config = {
    // Environment-based API URL configuration
    API_URL: process.env.NODE_ENV === 'production' 
        ? '/api/'  // Relative URL for production (same domain)
        : 'http://localhost:7010/api/', // Local development
    
    // Alternative: Use environment variable
    // API_URL: process.env.REACT_APP_API_URL || '/api/',
    
    // Base URL helper
    getApiUrl: function() {
        return this.API_URL;
    },
    
    // Full URL helper
    getFullUrl: function(endpoint) {
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? window.location.origin 
            : 'http://localhost:7010';
        return `${baseUrl}${this.API_URL}${endpoint}`;
    }
};

export default config;
