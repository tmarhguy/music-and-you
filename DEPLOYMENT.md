# Deployment Guide

This guide explains how to deploy Music & You to various platforms.

## 🎯 GitHub Pages Deployment (Frontend Only)

### Automatic Deployment

The frontend is automatically deployed to GitHub Pages when you push to the `main` branch.

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor deployment**:
   - Check the "Actions" tab in your repository
   - Wait for the deployment to complete
   - Visit `https://yourusername.github.io/music-and-you`

### Manual Deployment

```bash
cd frontend
npm run build
# The built files will be in the 'out' directory
```

## 🚀 Backend Deployment Options

### Option 1: Railway

1. **Connect your backend repository**:
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account
   - Import your backend repository

2. **Configure environment variables**:
   - Add your Spotify credentials
   - Set the CORS origins to include your GitHub Pages URL

3. **Deploy**:
   - Railway will automatically deploy on push
   - Get your API URL and update the frontend

### Option 2: Render

1. **Create a new Web Service**:
   - Go to [Render](https://render.com)
   - Connect your backend repository
   - Choose "Web Service"

2. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.music_and_you.api.main:app --host 0.0.0.0 --port $PORT`

3. **Set environment variables**:
   - Add your Spotify credentials
   - Set CORS origins

### Option 3: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy**:
   ```bash
   cd backend-separate
   fly deploy
   ```

### Option 4: Heroku

1. **Install Heroku CLI**:
   ```bash
   # Install Heroku CLI
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set SPOTIFY_CLIENT_ID=your_client_id
   heroku config:set SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_DEMO_MODE=false
```

#### Backend (.env)
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-frontend-url.com/auth/callback
ALLOWED_ORIGINS=https://your-frontend-url.com
```

### CORS Configuration

Update your backend CORS settings to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourusername.github.io",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Monitoring

### GitHub Pages
- Check the Actions tab for deployment status
- Monitor build logs for errors

### Backend Services
- Most platforms provide built-in monitoring
- Set up health check endpoints
- Monitor API response times and error rates

## 🛠 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure your backend CORS settings include your frontend URL
   - Check that the frontend API URL is correct

2. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Review build logs for specific errors

3. **Environment Variables**:
   - Double-check all environment variables are set
   - Ensure Spotify redirect URIs match your deployment URLs

### Debug Mode

Enable debug mode by setting:
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

This will use demo data instead of making API calls.

## 🔒 Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate API keys regularly

2. **CORS**:
   - Only allow necessary origins
   - Avoid using wildcard (*) in production

3. **API Rate Limiting**:
   - Implement rate limiting on your backend
   - Monitor API usage

## 📈 Performance Optimization

1. **Frontend**:
   - Enable static export for GitHub Pages
   - Optimize images and assets
   - Use CDN for static resources

2. **Backend**:
   - Implement caching
   - Use database connection pooling
   - Monitor and optimize database queries

## 🆘 Support

If you encounter issues:

1. Check the deployment logs
2. Review the troubleshooting section
3. Open an issue in the repository
4. Check platform-specific documentation

## 📝 Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Implement CI/CD pipelines
5. Add automated testing
