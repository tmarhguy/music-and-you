"""
Enhanced FastAPI application for Music and You with real Spotify integration.
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging
from typing import Dict, List, Optional
import time
import os
import secrets
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import secrets
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our Spotify client
from music_and_you.data.spotify_client import SpotifyClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

app = FastAPI(
    title="Music and You API",
    description="Personality prediction through music listening behavior",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "your_spotify_client_id")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "your_spotify_client_secret")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:3001/auth/callback")

# In-memory session storage (use Redis in production)
user_sessions = {}
spotify_clients = {}


def get_spotify_client(user_id: str = None) -> SpotifyClient:
    """Get or create a Spotify client for a user."""
    client = SpotifyClient(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI
    )
    
    if user_id and user_id in spotify_clients:
        # Restore existing client state
        existing_client = spotify_clients[user_id]
        client.access_token = existing_client.access_token
        client.refresh_token = existing_client.refresh_token
        client.token_expires_at = existing_client.token_expires_at
        client.spotify = existing_client.spotify
    
    return client


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Music and You API is running!",
        "timestamp": time.time(),
        "version": "1.0.0",
        "spotify_configured": SPOTIFY_CLIENT_ID != "your_spotify_client_id"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": "development",
        "version": "1.0.0",
        "services": {
            "spotify": SPOTIFY_CLIENT_ID != "your_spotify_client_id"
        }
    }


@app.get("/api/auth/spotify/login")
async def spotify_login():
    """Initiate Spotify OAuth login."""
    try:
        client = get_spotify_client()
        state = secrets.token_urlsafe(32)
        auth_url = client.get_auth_url(state=state)
        
        # Store state for verification
        user_sessions[state] = {
            "created_at": time.time(),
            "state": state
        }
        
        return {
            "auth_url": auth_url,
            "state": state,
            "expires_in": 600  # 10 minutes
        }
        
    except Exception as e:
        logger.error(f"Failed to generate auth URL: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication setup failed: {str(e)}")


@app.post("/api/auth/spotify/callback")
async def spotify_callback(request: Request):
    """Handle Spotify OAuth callback."""
    try:
        # Get code and state from request body
        body = await request.json()
        code = body.get("code")
        state = body.get("state")
        
        if not code or not state:
            raise HTTPException(status_code=400, detail="Missing code or state parameter")
        
        # Verify state parameter
        if state not in user_sessions:
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        session = user_sessions[state]
        
        # Check if state has expired (10 minutes)
        if time.time() - session["created_at"] > 600:
            del user_sessions[state]
            raise HTTPException(status_code=400, detail="State parameter expired")
        
        # Exchange code for token
        client = get_spotify_client()
        token_info = client.exchange_code_for_token(code)
        
        # Get user profile to get user ID
        user_profile = client.get_user_profile()
        user_id = user_profile["user_id"]
        
        # Store client for this user
        spotify_clients[user_id] = client
        
        # Update session with user info
        user_sessions[state].update({
            "user_id": user_id,
            "access_token": token_info["access_token"],
            "authenticated_at": time.time(),
            "expires_at": token_info["expires_at"]
        })
        
        # Clean up old state
        del user_sessions[state]
        
        return {
            "status": "success",
            "user_id": user_id,
            "access_token": token_info["access_token"],
            "expires_at": token_info["expires_at"],
            "user_profile": user_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth callback failed: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@app.get("/api/user/profile")
async def get_user_profile(user_id: str):
    """Get user profile information."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        client = spotify_clients[user_id]
        profile = client.get_user_profile()
        
        return {
            "user_id": user_id,
            "profile": profile,
            "last_updated": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve profile: {str(e)}")


@app.get("/api/user/listening-history")
async def get_listening_history(user_id: str, limit: int = 50):
    """Get user's listening history."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        client = spotify_clients[user_id]
        
        # Get recent listening history
        recent_tracks_df = client.get_listening_history(limit=limit)
        
        if recent_tracks_df.empty:
            return {
                "tracks": [],
                "total": 0,
                "limit": limit,
                "source": "spotify_api"
            }
        
        # Convert DataFrame to list of dictionaries
        tracks = recent_tracks_df.to_dict('records')
        
        return {
            "tracks": tracks,
            "total": len(tracks),
            "limit": limit,
            "source": "spotify_api",
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get listening history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve listening history: {str(e)}")


@app.get("/api/user/top-tracks")
async def get_top_tracks(user_id: str, time_range: str = "medium_term", limit: int = 50):
    """Get user's top tracks."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        if time_range not in ["short_term", "medium_term", "long_term"]:
            raise HTTPException(status_code=400, detail="Invalid time_range. Must be: short_term, medium_term, or long_term")
        
        client = spotify_clients[user_id]
        top_tracks_df = client.get_top_tracks(time_range=time_range, limit=limit)
        
        if top_tracks_df.empty:
            return {
                "tracks": [],
                "total": 0,
                "time_range": time_range,
                "limit": limit
            }
        
        tracks = top_tracks_df.to_dict('records')
        
        return {
            "tracks": tracks,
            "total": len(tracks),
            "time_range": time_range,
            "limit": limit,
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get top tracks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve top tracks: {str(e)}")


@app.get("/api/user/top-artists")
async def get_top_artists(user_id: str, time_range: str = "medium_term", limit: int = 50):
    """Get user's top artists."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        if time_range not in ["short_term", "medium_term", "long_term"]:
            raise HTTPException(status_code=400, detail="Invalid time_range")
        
        client = spotify_clients[user_id]
        top_artists_df = client.get_top_artists(time_range=time_range, limit=limit)
        
        if top_artists_df.empty:
            return {
                "artists": [],
                "total": 0,
                "time_range": time_range,
                "limit": limit
            }
        
        artists = top_artists_df.to_dict('records')
        
        return {
            "artists": artists,
            "total": len(artists),
            "time_range": time_range,
            "limit": limit,
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get top artists: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve top artists: {str(e)}")


@app.get("/api/user/audio-features")
async def get_audio_features(user_id: str, track_ids: str):
    """Get audio features for specific tracks."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # Parse track IDs from comma-separated string
        track_id_list = [tid.strip() for tid in track_ids.split(',') if tid.strip()]
        
        if not track_id_list:
            raise HTTPException(status_code=400, detail="No track IDs provided")
        
        if len(track_id_list) > 100:
            raise HTTPException(status_code=400, detail="Too many track IDs (max 100)")
        
        client = spotify_clients[user_id]
        audio_features_df = client.get_audio_features(track_id_list)
        
        if audio_features_df.empty:
            return {
                "audio_features": [],
                "total": 0,
                "requested_tracks": len(track_id_list)
            }
        
        features = audio_features_df.to_dict('records')
        
        return {
            "audio_features": features,
            "total": len(features),
            "requested_tracks": len(track_id_list),
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get audio features: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve audio features: {str(e)}")


@app.get("/api/user/playlists")
async def get_user_playlists(user_id: str, limit: int = 50):
    """Get user's playlists."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        client = spotify_clients[user_id]
        playlists_df = client.get_user_playlists(limit=limit)
        
        if playlists_df.empty:
            return {
                "playlists": [],
                "total": 0,
                "limit": limit
            }
        
        playlists = playlists_df.to_dict('records')
        
        return {
            "playlists": playlists,
            "total": len(playlists),
            "limit": limit,
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get playlists: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve playlists: {str(e)}")


@app.get("/api/user/liked-songs")
async def get_liked_songs(user_id: str, limit: Optional[int] = None):
    """Get user's liked/saved songs."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        client = spotify_clients[user_id]
        
        # Get ALL saved tracks by default (limit=None means fetch everything)
        logger.info(f"Fetching liked songs for user {user_id} (limit: {limit or 'ALL'})")
        saved_tracks_df = client.get_saved_tracks(limit=limit)
        
        if saved_tracks_df.empty:
            return {
                "tracks": [],
                "total": 0,
                "returned": 0,
                "fetched_all": True,
                "collected_at": time.time()
            }
        
        # Convert DataFrame to list of dictionaries
        tracks = saved_tracks_df.to_dict('records')
        
        return {
            "tracks": tracks,
            "total": len(tracks),
            "returned": len(tracks),
            "fetched_all": limit is None,
            "collected_at": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get liked songs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve liked songs: {str(e)}")


@app.get("/api/user/comprehensive-data")
async def get_comprehensive_data(user_id: str):
    """Get comprehensive user data from Spotify."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        client = spotify_clients[user_id]
        
        # Collect comprehensive data
        logger.info(f"Starting comprehensive data collection for user {user_id}")
        data = client.collect_comprehensive_data(user_id)
        
        # Convert DataFrames to dictionaries for JSON response
        result = {}
        for key, df in data.items():
            if hasattr(df, 'to_dict'):
                result[key] = {
                    "data": df.to_dict('records'),
                    "count": len(df),
                    "columns": list(df.columns) if not df.empty else []
                }
            else:
                result[key] = df
        
        return {
            "user_id": user_id,
            "data": result,
            "collection_timestamp": time.time(),
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to collect comprehensive data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to collect data: {str(e)}")


from pydantic import BaseModel

class PersonalityAnalysisRequest(BaseModel):
    user_id: str

@app.post("/api/analysis/personality")
async def analyze_personality(request: PersonalityAnalysisRequest):
    """Analyze user personality based on music listening."""
    try:
        user_id = request.user_id
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        logger.info(f"Starting personality analysis for user {user_id}")
        
        client = spotify_clients[user_id]
        
        # Get comprehensive music data
        logger.info("Collecting comprehensive music data...")
        
        # Collect various data types
        listening_history = client.get_listening_history(limit=100)
        top_tracks = client.get_top_tracks(time_range="medium_term", limit=50)
        top_artists = client.get_top_artists(time_range="medium_term", limit=20)
        saved_tracks = client.get_saved_tracks(limit=100)  # Sample for analysis
        
        if all(df.empty for df in [listening_history, top_tracks, saved_tracks]):
            raise HTTPException(status_code=400, detail="Insufficient music data for analysis")
        
        # Import and use the feature pipeline
        from music_and_you.features.feature_pipeline import FeaturePipeline
        
        feature_pipeline = FeaturePipeline()
        
        # Combine all music data
        all_tracks = pd.concat([
            listening_history,
            top_tracks,
            saved_tracks
        ], ignore_index=True).drop_duplicates(subset=['track_id'])
        
        logger.info(f"Analyzing {len(all_tracks)} unique tracks")
        
        # Get audio features for tracks
        if not all_tracks.empty:
            track_ids = all_tracks['track_id'].tolist()[:50]  # Limit for performance
            audio_features = client.get_audio_features(track_ids)
        else:
            audio_features = pd.DataFrame()
        
        # Extract comprehensive features
        try:
            features = feature_pipeline.extract_all_features(
                listening_data=all_tracks,
                audio_features=audio_features,
                user_id=user_id
            )
            
            # Apply personality analysis model
            personality_scores = analyze_music_personality(features, all_tracks, audio_features)
            
            # Generate insights
            insights = generate_personality_insights(personality_scores, features)
            
            logger.info(f"Personality analysis completed for user {user_id}")
            
            return {
                "user_id": user_id,
                "personality_scores": personality_scores,
                "insights": insights,
                "confidence": calculate_analysis_confidence(features, len(all_tracks)),
                "data_summary": {
                    "total_tracks_analyzed": len(all_tracks),
                    "audio_features_available": len(audio_features),
                    "analysis_features": len(features)
                },
                "analysis_timestamp": time.time(),
                "data_source": "spotify_real_data",
                "status": "completed"
            }
            
        except Exception as feature_error:
            logger.error(f"Feature extraction failed: {feature_error}")
            # Fallback to simpler analysis if feature pipeline fails
            return simple_personality_analysis(all_tracks, audio_features, user_id)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze personality: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/recommendations")
async def get_recommendations(user_id: str, count: int = 10):
    """Get music recommendations based on user data."""
    try:
        if user_id not in spotify_clients:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # For now, return mock recommendations
        # TODO: Implement real recommendations based on personality analysis
        recommendations = []
        for i in range(min(count, 5)):
            recommendations.append({
                "track_id": f"rec_track_{i}",
                "track_name": f"Recommended Song {i+1}",
                "artist_name": f"Recommended Artist {i+1}",
                "album_name": f"Recommended Album {i+1}",
                "reason": f"Based on your {['openness', 'extraversion', 'agreeableness'][i % 3]} score",
                "confidence": 0.85 - (i * 0.05)
            })
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total": len(recommendations),
            "generated_at": time.time(),
            "status": "mock_recommendations"  # Remove when real recommendations are implemented
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")


@app.delete("/api/auth/logout")
async def logout(user_id: str):
    """Logout user and clear session data."""
    try:
        # Remove user's Spotify client and session data
        if user_id in spotify_clients:
            del spotify_clients[user_id]
        
        # Clean up any remaining sessions for this user
        sessions_to_remove = []
        for state, session in user_sessions.items():
            if session.get("user_id") == user_id:
                sessions_to_remove.append(state)
        
        for state in sessions_to_remove:
            del user_sessions[state]
        
        return {
            "status": "success",
            "message": "User logged out successfully",
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


# Helper functions for personality analysis
def analyze_music_personality(features: Dict[str, float], tracks_df, audio_features_df) -> Dict[str, float]:
    """
    Analyze personality traits based on extracted music features.
    This is a simplified analysis based on music psychology research.
    """
    try:
        import pandas as pd
        import numpy as np
        
        if not features or len(features) == 0:
            return get_default_personality_scores()
        
        # Initialize scores
        personality_scores = {
            "openness": 0.5,
            "conscientiousness": 0.5,
            "extraversion": 0.5,
            "agreeableness": 0.5,
            "neuroticism": 0.5
        }
        
        # Analyze based on available features
        
        # Openness - variety and complexity
        if 'genre_diversity' in features:
            personality_scores["openness"] = min(0.9, max(0.1, features['genre_diversity']))
        if 'artist_diversity' in features:
            diversity_factor = features['artist_diversity']
            personality_scores["openness"] = (personality_scores["openness"] + diversity_factor) / 2
            
        # Extraversion - energy and social aspects
        if 'avg_energy' in features:
            personality_scores["extraversion"] = features['avg_energy']
        if 'avg_danceability' in features:
            dance_factor = features['avg_danceability']
            personality_scores["extraversion"] = (personality_scores["extraversion"] + dance_factor) / 2
            
        # Conscientiousness - listening patterns
        if 'listening_regularity' in features:
            personality_scores["conscientiousness"] = features['listening_regularity']
        if 'completion_rate' in features:
            completion = features['completion_rate']
            personality_scores["conscientiousness"] = (personality_scores["conscientiousness"] + completion) / 2
            
        # Agreeableness - positive valence and harmony
        if 'avg_valence' in features:
            personality_scores["agreeableness"] = features['avg_valence']
        if 'avg_acousticness' in features:
            acoustic_factor = features['avg_acousticness'] * 0.7 + 0.3  # Bias toward agreeableness
            personality_scores["agreeableness"] = (personality_scores["agreeableness"] + acoustic_factor) / 2
            
        # Neuroticism (inverted from emotional stability)
        if 'avg_valence' in features:
            # Higher valence = lower neuroticism
            personality_scores["neuroticism"] = 1.0 - features['avg_valence']
        if 'tempo_variability' in features:
            # Higher tempo variability might indicate more neuroticism
            tempo_factor = min(0.8, features['tempo_variability'])
            personality_scores["neuroticism"] = (personality_scores["neuroticism"] + tempo_factor) / 2
            
        # Normalize scores to [0.1, 0.9] range
        for trait in personality_scores:
            personality_scores[trait] = max(0.1, min(0.9, personality_scores[trait]))
            
        return personality_scores
        
    except Exception as e:
        logger.error(f"Error in personality analysis: {e}")
        return get_default_personality_scores()


def generate_personality_insights(personality_scores: Dict[str, float], features: Dict[str, float]) -> List[str]:
    """Generate human-readable insights based on personality scores."""
    insights = []
    
    # Openness insights
    openness = personality_scores.get("openness", 0.5)
    if openness > 0.7:
        insights.append("🎵 Your diverse music taste suggests high openness to new experiences and creativity.")
    elif openness < 0.3:
        insights.append("🎵 Your consistent music preferences indicate a preference for familiar and reliable experiences.")
    else:
        insights.append("🎵 You have a balanced approach to music discovery, enjoying both familiar and new sounds.")
    
    # Extraversion insights  
    extraversion = personality_scores.get("extraversion", 0.5)
    if extraversion > 0.7:
        insights.append("🎉 Your preference for energetic, danceable music suggests an outgoing and social personality.")
    elif extraversion < 0.3:
        insights.append("🎧 Your taste for calmer, more introspective music indicates a more reserved and thoughtful nature.")
    else:
        insights.append("⚖️ Your music choices reflect a balanced social energy - comfortable in both quiet and lively settings.")
    
    # Conscientiousness insights
    conscientiousness = personality_scores.get("conscientiousness", 0.5)
    if conscientiousness > 0.7:
        insights.append("📋 Your organized listening patterns suggest strong self-discipline and attention to detail.")
    elif conscientiousness < 0.3:
        insights.append("🌊 Your spontaneous music listening style indicates flexibility and adaptability.")
    else:
        insights.append("🎯 You show a balanced approach to structure, being both organized and spontaneous with music.")
    
    # Agreeableness insights
    agreeableness = personality_scores.get("agreeableness", 0.5)
    if agreeableness > 0.7:
        insights.append("🤝 Your preference for harmonious, positive music suggests a cooperative and trusting nature.")
    elif agreeableness < 0.3:
        insights.append("💪 Your music choices indicate independence and a willingness to challenge conventions.")
    else:
        insights.append("🎭 You appreciate both harmonious and edgier music, showing balanced social perspectives.")
    
    # Neuroticism insights
    neuroticism = personality_scores.get("neuroticism", 0.5)
    if neuroticism > 0.7:
        insights.append("🌧️ Your music preferences might reflect sensitivity and emotional depth.")
    elif neuroticism < 0.3:
        insights.append("☀️ Your upbeat music choices suggest emotional stability and optimism.")
    else:
        insights.append("🌤️ Your varied music mood indicates healthy emotional range and adaptability.")
    
    return insights


def calculate_analysis_confidence(features: Dict[str, float], track_count: int) -> float:
    """Calculate confidence score for the personality analysis."""
    base_confidence = 0.4
    
    # More tracks = higher confidence
    track_confidence = min(0.3, track_count / 100 * 0.3)
    
    # More features = higher confidence  
    feature_confidence = min(0.2, len(features) / 10 * 0.2)
    
    # Bonus for key features
    key_features = ['avg_energy', 'avg_valence', 'genre_diversity', 'avg_danceability']
    key_feature_bonus = sum(0.025 for feature in key_features if feature in features)
    
    total_confidence = base_confidence + track_confidence + feature_confidence + key_feature_bonus
    return min(0.95, max(0.3, total_confidence))


def simple_personality_analysis(tracks_df, audio_features_df, user_id: str) -> Dict:
    """Fallback simple analysis when feature pipeline fails."""
    import pandas as pd
    import numpy as np
    
    try:
        # Basic analysis using available data
        personality_scores = get_default_personality_scores()
        
        if not audio_features_df.empty:
            # Simple analysis based on audio features
            avg_energy = audio_features_df['energy'].mean() if 'energy' in audio_features_df.columns else 0.5
            avg_valence = audio_features_df['valence'].mean() if 'valence' in audio_features_df.columns else 0.5
            avg_danceability = audio_features_df['danceability'].mean() if 'danceability' in audio_features_df.columns else 0.5
            
            personality_scores["extraversion"] = avg_energy
            personality_scores["agreeableness"] = avg_valence  
            personality_scores["openness"] = min(0.8, avg_danceability + 0.2)
            personality_scores["neuroticism"] = 1.0 - avg_valence
            
        insights = [
            f"Based on your music listening patterns, here's what we found:",
            f"Your energy level in music suggests moderate social engagement.",
            f"Your musical choices reflect a balanced emotional range.",
            f"Analysis based on {len(tracks_df)} tracks from your library."
        ]
        
        return {
            "user_id": user_id,
            "personality_scores": personality_scores,
            "insights": insights,
            "confidence": 0.6,
            "analysis_timestamp": time.time(),
            "data_source": "simplified_analysis",
            "status": "completed"
        }
    except Exception as e:
        logger.error(f"Simple analysis failed: {e}")
        return {
            "user_id": user_id,
            "personality_scores": get_default_personality_scores(),
            "insights": ["Analysis could not be completed with available data."],
            "confidence": 0.3,
            "analysis_timestamp": time.time(),
            "status": "fallback"
        }


def get_default_personality_scores() -> Dict[str, float]:
    """Return default personality scores."""
    return {
        "openness": 0.5,
        "conscientiousness": 0.5,
        "extraversion": 0.5,
        "agreeableness": 0.5,
        "neuroticism": 0.5
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
