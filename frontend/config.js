// API Configuration - Production Ready
import productionConfig from './production-config.js';

const config = {
  get API_URL() {
    console.log('🔧 Config Debug Info:');
    console.log('- Current URL:', window.location.href);
    console.log('- Protocol:', window.location.protocol);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('- All env vars:', import.meta.env);
    
    // FORCE PRODUCTION URL FOR NETLIFY/VERCEL - This will override everything
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
      console.log('🚀 FORCING PRODUCTION URL for Netlify/Vercel:', productionConfig.API_URL);
      return productionConfig.API_URL;
    }
    
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
    
    // Development mode - use production config as fallback
    console.log('⚠️ No environment variable found, using production config as fallback');
    return productionConfig.API_URL;
  }
};

export default config;
