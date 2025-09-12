// API Configuration - Production Ready
import productionConfig from './production-config.js';

const config = {
  get API_URL() {
    console.log('🔧 Config Debug Info:');
    console.log('- Current URL:', window.location.href);
    console.log('- Protocol:', window.location.protocol);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    // Check for environment variables first (highest priority)
    if (import.meta.env.VITE_API_URL) {
      console.log('✅ Using environment API URL:', import.meta.env.VITE_API_URL);
      return import.meta.env.VITE_API_URL;
    }
    
    // Check if we're in production (deployed)
    const isProduction = window.location.protocol === 'https:' || 
                        (window.location.hostname !== 'localhost' && 
                         !window.location.hostname.startsWith('192.168.') &&
                         !window.location.hostname.startsWith('10.') &&
                         !window.location.hostname.startsWith('172.') &&
                         !window.location.hostname.includes('127.0.0.1'));
    
    console.log('- Is Production:', isProduction);
    
    if (isProduction) {
      // In production, use the configured production API URL
      console.log('✅ Production mode - using API URL:', productionConfig.API_URL);
      return productionConfig.API_URL;
    }
    
    // Development mode - auto-detect based on hostname
    const hostname = window.location.hostname;
    
    // If running on localhost or 127.0.0.1, use localhost for API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('✅ Development mode - using localhost API');
      return 'http://localhost:5000';
    }
    
    // If running on any other IP (like 192.168.x.x), use the same IP for API
    const devUrl = `http://${hostname}:5000`;
    console.log('✅ Development mode - using IP API:', devUrl);
    return devUrl;
  }
};

export default config;
