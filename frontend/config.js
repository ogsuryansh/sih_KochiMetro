// API Configuration - Production Ready
// FORCE PRODUCTION URL - NO LOCALHOST FALLBACKS

const config = {
  get API_URL() {
    // ALWAYS return production URL - no exceptions
    const productionUrl = 'https://sihkochimetro.vercel.app';
    
    console.log('🔧 Config API_URL called - FORCING PRODUCTION URL');
    console.log('- Current URL:', window.location.href);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('- Returning production URL:', productionUrl);
    
    return productionUrl;
  }
};

export default config;
