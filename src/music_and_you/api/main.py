"""
FastAPI application for the Music and You web API.
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

from music_and_you.config import config
from music_and_you.data import SpotifyClient
from music_and_you.features import FeaturePipeline
from music_and_you.models import PersonalityPredictor

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Music and You API",
    description="Personality prediction from music listening behavior",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class UserProfile(BaseModel):
    """User profile information."""
    user_id: str
    display_name: Optional[str] = None
    platform: str
    country: Optional[str] = None


class PersonalityPrediction(BaseModel):
    """Personality prediction results."""
    user_id: str
    predictions: Dict[str, float]
    confidence: Dict[str, float]
    timestamp: str


class AnalysisRequest(BaseModel):
    """Analysis request parameters."""
    user_id: str
    platform: str = "spotify"
    days_history: int = 180
    include_features: bool = True


# Global variables (consider using dependency injection in production)
feature_pipeline = None
personality_model = None


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    global feature_pipeline, personality_model
    
    logger.info("Starting Music and You API...")
    
    # Initialize feature pipeline
    feature_pipeline = FeaturePipeline()
    
    # Load pre-trained model if available
    try:
        personality_model = PersonalityPredictor.load_model("models/personality_model.joblib")
        logger.info("Loaded pre-trained personality model")
    except FileNotFoundError:
        logger.warning("No pre-trained model found")
        personality_model = None


@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with basic information."""
    html_content = """
    <html>
        <head>
            <title>Music and You API</title>
        </head>
        <body>
            <h1>Music and You: Personality Prediction API</h1>
            <p>A research project investigating the relationship between music listening patterns and personality traits.</p>
            <h2>Available Endpoints:</h2>
            <ul>
                <li><a href="/docs">API Documentation</a></li>
                <li><a href="/health">Health Check</a></li>
                <li><a href="/auth/spotify">Spotify Authentication</a></li>
            </ul>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "features_available": feature_pipeline is not None,
        "model_loaded": personality_model is not None
    }


@app.get("/auth/spotify")
async def spotify_auth():
    """Initiate Spotify authentication."""
    try:
        client = SpotifyClient(
            config.api.spotify_client_id,
            config.api.spotify_client_secret
        )
        
        # This would typically redirect to Spotify's OAuth flow
        return {
            "auth_url": "https://accounts.spotify.com/authorize",
            "message": "Redirect user to Spotify OAuth flow",
            "client_id": config.api.spotify_client_id,
            "redirect_uri": config.api.spotify_redirect_uri
        }
        
    except Exception as e:
        logger.error(f"Spotify auth error: {e}")
        raise HTTPException(status_code=500, detail="Authentication setup failed")


@app.post("/auth/callback")
async def auth_callback(code: str):
    """Handle OAuth callback from Spotify."""
    try:
        client = SpotifyClient(
            config.api.spotify_client_id,
            config.api.spotify_client_secret
        )
        
        # Complete authentication with authorization code
        if client.authenticate(authorization_code=code):
            profile = client.get_user_profile()
            return {
                "status": "success",
                "user_profile": profile,
                "message": "Successfully authenticated with Spotify"
            }
        else:
            raise HTTPException(status_code=400, detail="Authentication failed")
            
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")


@app.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str) -> UserProfile:
    """Get user profile information."""
    # This would typically fetch from database
    # For now, return mock data
    return UserProfile(
        user_id=user_id,
        display_name=f"User {user_id}",
        platform="spotify",
        country="US"
    )


@app.post("/analyze")
async def analyze_personality(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Analyze user's music listening behavior and predict personality.
    """
    if personality_model is None:
        raise HTTPException(
            status_code=503, 
            detail="Personality prediction model not available"
        )
    
    try:
        # This would be implemented as a background task in production
        background_tasks.add_task(
            process_user_analysis, 
            request.user_id, 
            request.platform,
            request.days_history
        )
        
        return {
            "status": "processing",
            "user_id": request.user_id,
            "message": "Analysis started. Check back for results.",
            "estimated_completion": "5-10 minutes"
        }
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed to start")


@app.get("/user/{user_id}/prediction")
async def get_personality_prediction(user_id: str) -> PersonalityPrediction:
    """Get personality prediction results for a user."""
    # This would typically fetch from database
    # For now, return mock data
    from datetime import datetime
    
    mock_predictions = {
        "openness": 3.5,
        "conscientiousness": 3.2,
        "extraversion": 4.1,
        "agreeableness": 3.8,
        "neuroticism": 2.7
    }
    
    mock_confidence = {
        "openness": 0.75,
        "conscientiousness": 0.68,
        "extraversion": 0.82,
        "agreeableness": 0.71,
        "neuroticism": 0.59
    }
    
    return PersonalityPrediction(
        user_id=user_id,
        predictions=mock_predictions,
        confidence=mock_confidence,
        timestamp=datetime.now().isoformat()
    )


@app.get("/user/{user_id}/features")
async def get_user_features(user_id: str) -> Dict[str, Any]:
    """Get extracted features for a user."""
    # This would typically fetch from database
    # For now, return mock data
    return {
        "user_id": user_id,
        "features": {
            "acoustic": {
                "energy_mean": 0.65,
                "valence_mean": 0.58,
                "danceability_mean": 0.72
            },
            "behavioral": {
                "artist_diversity": 0.43,
                "exploration_ratio": 0.31,
                "tracks_per_day": 25.6
            },
            "temporal": {
                "morning_listening": 0.15,
                "evening_listening": 0.48,
                "weekend_preference": 0.62
            }
        },
        "extraction_date": datetime.now().isoformat()
    }


@app.get("/model/info")
async def get_model_info() -> Dict[str, Any]:
    """Get information about the current personality prediction model."""
    if personality_model is None:
        raise HTTPException(status_code=503, detail="No model loaded")
    
    return {
        "model_type": type(personality_model).__name__,
        "features_used": len(personality_model.feature_names) if hasattr(personality_model, 'feature_names') else 0,
        "traits_predicted": ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
        "training_info": "Model trained on research dataset",
        "performance_metrics": "See /model/performance endpoint"
    }


async def process_user_analysis(user_id: str, platform: str, days_history: int):
    """
    Background task to process user analysis.
    
    Args:
        user_id: User identifier
        platform: Music platform
        days_history: Number of days of history to analyze
    """
    logger.info(f"Starting analysis for user {user_id}")
    
    try:
        # 1. Fetch user data
        # 2. Extract features
        # 3. Make predictions
        # 4. Store results in database
        
        logger.info(f"Completed analysis for user {user_id}")
        
    except Exception as e:
        logger.error(f"Analysis failed for user {user_id}: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
