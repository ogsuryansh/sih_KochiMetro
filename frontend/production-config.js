// Production Configuration
// Use this file to configure your production API URL

const productionConfig = {
  API_URL: import.meta.env.VITE_API_URL || 'https://sihkochimetro.vercel.app',
};

export default productionConfig;
