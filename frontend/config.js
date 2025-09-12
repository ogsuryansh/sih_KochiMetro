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
    console.log('- Production config API_URL:', productionConfig.API_URL);
    
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
    
    // Check if we're in a deployed environment (Netlify/Vercel)
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app')) {
      console.log('🚀 Deployed environment detected, forcing production URL');
      return 'https://sihkochimetro.vercel.app';
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
    
    // Final fallback - always use production URL
    console.log('⚠️ No environment variable found, using production URL as fallback');
    const fallbackUrl = 'https://sihkochimetro.vercel.app';
    console.log('🔧 Final API_URL being returned:', fallbackUrl);
    return fallbackUrl;
  }
};

export default config;
