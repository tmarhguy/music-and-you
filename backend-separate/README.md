# Music & You - Backend API

This is the backend API server for Music & You, designed to be deployed separately from the frontend.

## Overview

The backend provides:
- Spotify OAuth2 authentication
- Music data collection and analysis
- Personality prediction using machine learning
- RESTful API endpoints

## Quick Start

### Prerequisites
- Python 3.9+
- Spotify Developer Account
- PostgreSQL (optional, for production)

### Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/tmarhguy/music-and-you-backend.git
   cd music-and-you-backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Spotify credentials
   ```

5. **Start the server**:
   ```bash
   uvicorn src.music_and_you.api.main:app --reload --port 8000
   ```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `GET /api/auth/spotify/login` - Initiate Spotify OAuth
- `POST /api/auth/spotify/callback` - Handle OAuth callback
- `GET /api/user/profile` - Get user profile
- `POST /analyze` - Start personality analysis
- `POST /api/chat` - Chat with AI assistant

## Deployment

### Docker

```bash
docker build -t music-and-you-backend .
docker run -p 8000:8000 --env-file .env music-and-you-backend
```

### Railway/Render/Fly.io

The backend is configured for easy deployment to modern platforms:

- Railway: Connect your GitHub repo
- Render: Deploy from GitHub
- Fly.io: Use the included fly.toml

## Environment Variables

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-frontend-domain.com/auth/callback
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
```

## Development

### Running Tests

```bash
pytest tests/
```

### Code Quality

```bash
black src/
isort src/
flake8 src/
mypy src/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
