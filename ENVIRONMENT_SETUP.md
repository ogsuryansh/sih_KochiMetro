# Environment Configuration Guide

## Backend URL: https://sihkochimetro.vercel.app

This guide explains how to configure your environment variables for both development and production deployments.

## Environment Variables

### Backend (Vercel) Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.netlify.app
# Add your actual frontend domain when you deploy it

# Optional: Additional allowed origins (comma-separated)
ALLOWED_ORIGINS=https://your-custom-domain.com,https://another-domain.com

# Optional: Upload directory for local development
UPLOAD_DIR=uploads/
```

### Frontend (Netlify/Vercel) Environment Variables

Set these in your deployment platform:

#### For Netlify:
```bash
VITE_API_URL=https://sihkochimetro.vercel.app
NODE_ENV=production
```

#### For Vercel:
```bash
VITE_API_URL=https://sihkochimetro.vercel.app
NODE_ENV=production
```

## Configuration Files Updated

### Backend Changes Made:

1. **Dynamic CORS Configuration** (`backend/index.js`):
   - Now uses environment variables for allowed origins
   - Supports regex patterns for Netlify/Vercel domains
   - Automatically allows your frontend URL from `FRONTEND_URL` env var

2. **File Upload Handling** (`backend/controllers/uploadController.js`):
   - Uses memory storage in production (serverless-friendly)
   - Falls back to disk storage in development
   - Handles both file paths and memory buffers

3. **File Processors** (all processors in `backend/processors/`):
   - Updated to handle memory buffers for serverless environments
   - Maintains backward compatibility with file paths

4. **Health Endpoint** (`backend/index.js`):
   - Now shows environment information
   - Displays allowed origins and version info

### Frontend Changes Made:

1. **Dynamic Configuration** (`frontend/production-config.js`):
   - Now reads from `VITE_API_URL` environment variable
   - Falls back to hardcoded URL if env var not set

2. **Netlify Configuration** (`frontend/netlify.toml`):
   - Added `NODE_ENV=production` environment variable

## Deployment Instructions

### 1. Backend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ```
3. Deploy the backend

### 2. Frontend Deployment (Netlify)

1. Connect your GitHub repository to Netlify
2. Set the following environment variables in Netlify dashboard:
   ```
   VITE_API_URL=https://sihkochimetro.vercel.app
   NODE_ENV=production
   ```
3. Deploy the frontend

### 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://sihkochimetro.vercel.app
   NODE_ENV=production
   ```
3. Deploy the frontend

## Testing Your Configuration

### 1. Test Backend Health
```bash
curl https://sihkochimetro.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "cors": "enabled",
  "origin": null,
  "userAgent": "curl/7.68.0",
  "allowedOrigins": ["https://your-frontend-domain.netlify.app"],
  "version": "1.0.0"
}
```

### 2. Test CORS
```bash
curl -H "Origin: https://your-frontend-domain.netlify.app" \
     https://sihkochimetro.vercel.app/api/test-cors
```

### 3. Test Frontend
Visit your frontend URL and check the browser console for:
- API URL configuration logs
- Successful API calls to the backend

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly in backend environment variables
2. **File Upload Issues**: The backend now uses memory storage in production, which should work in serverless environments
3. **API Connection Issues**: Verify `VITE_API_URL` is set correctly in frontend environment variables

### Debug Steps:

1. Check backend health endpoint for environment info
2. Check browser console for API URL configuration logs
3. Verify environment variables are set in your deployment platform
4. Check network tab for failed API requests

## Security Notes

- The backend now dynamically allows origins based on environment variables
- CORS is properly configured for production
- File uploads are handled securely in serverless environments
- No hardcoded URLs remain in the codebase

## Support

If you encounter any issues:
1. Check the health endpoint for backend status
2. Verify all environment variables are set correctly
3. Check the browser console for frontend configuration logs
4. Review the deployment platform logs for any errors
