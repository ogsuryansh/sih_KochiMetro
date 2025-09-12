# Production Deployment Guide

## Frontend Deployment (Netlify/Vercel)

### Option 1: Using Environment Variables (Recommended)

1. **Set Environment Variable in your deployment platform:**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

2. **For Netlify:**
   - Go to Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.vercel.app/api`

3. **For Vercel:**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.vercel.app/api`

### Option 2: Manual Configuration

1. **Update `frontend/production-config.js`:**
   ```javascript
   API_URL: 'https://your-actual-backend-url.vercel.app/api'
   ```

2. **Update `frontend/config.js` to use production config:**
   ```javascript
   import productionConfig from './production-config.js';
   
   const config = {
     get API_URL() {
       if (import.meta.env.VITE_API_URL) {
         return import.meta.env.VITE_API_URL;
       }
       
       // Use production config if available
       if (productionConfig.API_URL !== 'https://your-backend-url.vercel.app/api') {
         return productionConfig.API_URL;
       }
       
       // ... rest of auto-detection logic
     }
   };
   ```

## Backend Deployment (Vercel)

1. **Deploy your backend to Vercel**
2. **Note the deployed URL** (e.g., `https://kochimetro-backend.vercel.app`)
3. **Update CORS in `backend/index.js`** to include your frontend domain
4. **Set the frontend environment variable** to point to your backend

## Testing

1. **Local Development:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`
   - Auto-detects and uses localhost

2. **Production:**
   - Frontend: `https://your-frontend.netlify.app`
   - Backend: `https://your-backend.vercel.app`
   - Uses environment variable or production config

## Troubleshooting

- Check browser console for API URL logs
- Verify CORS settings include your frontend domain
- Ensure backend is deployed and accessible
- Check environment variables are set correctly
