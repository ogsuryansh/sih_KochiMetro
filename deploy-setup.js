#!/usr/bin/env node

// Deployment Setup Script
// Run this script to help configure your deployment

const fs = require('fs');
const path = require('path');

console.log('🚀 Kochi Metro Deployment Setup\n');
console.log('✅ Backend URL detected: https://sihkochimetro.vercel.app\n');

// Use the provided backend URL
const backendUrl = 'https://sihkochimetro.vercel.app';
const apiUrl = `${backendUrl}/api`;

console.log(`\n📝 Configuration:`);
console.log(`Backend URL: ${backendUrl}`);
console.log(`API URL: ${apiUrl}`);

// Create .env.local file for local development
const envContent = `# Local Development Environment
VITE_API_URL=${apiUrl}
`;

try {
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env.local'), envContent);
  console.log('✅ Created frontend/.env.local');
} catch (error) {
  console.log('⚠️  Could not create .env.local file:', error.message);
}

// Update production config
const prodConfigPath = path.join(__dirname, 'frontend', 'production-config.js');
const prodConfigContent = `// Production Configuration
const productionConfig = {
  API_URL: '${apiUrl}',
};

export default productionConfig;
`;

try {
  fs.writeFileSync(prodConfigPath, prodConfigContent);
  console.log('✅ Updated frontend/production-config.js');
} catch (error) {
  console.log('⚠️  Could not update production config:', error.message);
}

console.log('\n🎉 Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Backend is already deployed at:', backendUrl);
console.log('2. Set environment variable VITE_API_URL in your frontend deployment platform');
console.log('3. Deploy your frontend');
console.log('\n🔧 For manual setup, see DEPLOYMENT.md');
