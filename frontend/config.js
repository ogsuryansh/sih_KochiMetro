// API Configuration
// Update this file with your computer's IP address for other devices to access

const config = {
  // For local development, use your computer's IP address instead of localhost
  // Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
  // Replace YOUR_IP_ADDRESS with your actual IP address
  
  // Local development (replace YOUR_IP_ADDRESS with your actual IP)
  API_URL: 'http://YOUR_IP_ADDRESS:5000',
  
  // Alternative: Use localhost if testing only on the same machine
  // API_URL: 'http://localhost:5000',
  
  // Production (uncomment when deploying)
  // API_URL: 'https://your-production-api-url.com'
};

export default config;
