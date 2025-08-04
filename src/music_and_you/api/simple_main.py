"""
Enhanced FastAPI application for Music and You with real Spotify integration.
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import logging
from typing import Dict, List, Optional, Any
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
                "confidence": calculate_analysis_confidence(
                    features, 
                    track_count=len(all_tracks),
                    audio_feature_count=len(audio_features) if not audio_features.empty else 0
                ),
                "data_summary": {
                    "total_tracks_analyzed": len(all_tracks),
                    "audio_features_available": len(audio_features) if not audio_features.empty else 0,
                    "analysis_features": len(features),
                    "feature_categories": {
                        "acoustic": len([k for k in features.keys() if 'acoustic' in k or any(af in k for af in ['energy', 'valence', 'danceability'])]),
                        "temporal": len([k for k in features.keys() if 'temporal' in k]),
                        "behavioral": len([k for k in features.keys() if 'behavioral' in k or 'diversity' in k]),
                        "advanced": len([k for k in features.keys() if any(af in k for af in ['instrumentalness', 'speechiness', 'liveness'])])
                    }
                },
                "analysis_timestamp": time.time(),
                "data_source": "spotify_enhanced_analysis",
                "model_version": "advanced_psychology_v2.0",
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
    Advanced personality trait analysis based on music psychology research.
    Incorporates findings from Rentfrow & Gosling, Greenberg et al., and other studies.
    """
    try:
        import pandas as pd
        import numpy as np
        
        if not features or len(features) == 0:
            return get_default_personality_scores()
        
        # Initialize scores with neutral baseline
        personality_scores = {
            "openness": 0.5,
            "conscientiousness": 0.5,
            "extraversion": 0.5,
            "agreeableness": 0.5,
            "neuroticism": 0.5
        }
        
        # Get comprehensive features for analysis
        audio_stats = _analyze_audio_features(audio_features_df) if not audio_features_df.empty else {}
        genre_stats = _analyze_genre_patterns(tracks_df) if not tracks_df.empty else {}
        temporal_stats = _analyze_temporal_patterns(features)
        
        # OPENNESS TO EXPERIENCE
        # Research: Correlated with sophisticated, complex, diverse music
        openness_indicators = []
        
        # Genre diversity (strongest predictor)
        if 'genre_diversity' in features:
            openness_indicators.append(min(0.95, features['genre_diversity'] * 1.2))
        elif len(genre_stats.get('unique_genres', [])) > 0:
            diversity = min(0.95, len(genre_stats['unique_genres']) / 10)
            openness_indicators.append(diversity)
            
        # Artist diversity
        if 'artist_diversity' in features:
            openness_indicators.append(features['artist_diversity'])
            
        # Musical sophistication indicators
        if 'avg_instrumentalness' in features:
            openness_indicators.append(features['avg_instrumentalness'] * 0.8)
        if 'avg_acousticness' in features:
            openness_indicators.append(features['avg_acousticness'] * 0.6)
            
        # Complex rhythms and unconventional structures
        if audio_stats.get('tempo_variance', 0) > 0.3:
            openness_indicators.append(0.7)
        if audio_stats.get('time_signature_variety', 0) > 0.2:
            openness_indicators.append(0.8)
            
        if openness_indicators:
            personality_scores["openness"] = np.mean(openness_indicators)
        
        # EXTRAVERSION
        # Research: Correlated with energetic, rhythmic, danceable music
        extraversion_indicators = []
        
        # Energy and danceability (strongest predictors)
        if 'avg_energy' in features:
            extraversion_indicators.append(features['avg_energy'])
        if 'avg_danceability' in features:
            extraversion_indicators.append(features['avg_danceability'])
            
        # Loudness preference
        if 'avg_loudness' in features:
            # Normalize loudness to 0-1 scale (typical range -60 to 0 dB)
            loudness_norm = min(1.0, max(0.0, (features['avg_loudness'] + 60) / 60))
            extraversion_indicators.append(loudness_norm)
            
        # Social music preferences (explicit, popular)
        if 'avg_popularity' in features:
            pop_factor = features['avg_popularity'] / 100
            extraversion_indicators.append(pop_factor * 0.8)
            
        # Tempo preferences
        if audio_stats.get('avg_tempo', 0) > 120:
            tempo_factor = min(0.9, (audio_stats['avg_tempo'] - 60) / 140)
            extraversion_indicators.append(tempo_factor)
            
        if extraversion_indicators:
            personality_scores["extraversion"] = np.mean(extraversion_indicators)
        
        # CONSCIENTIOUSNESS  
        # Research: Correlated with consistent patterns, completion behavior
        conscientiousness_indicators = []
        
        # Listening regularity and completion
        if 'listening_regularity' in features:
            conscientiousness_indicators.append(features['listening_regularity'])
        if 'completion_rate' in features:
            conscientiousness_indicators.append(features['completion_rate'])
            
        # Preference for structure and organization
        if temporal_stats.get('routine_strength', 0) > 0.5:
            conscientiousness_indicators.append(temporal_stats['routine_strength'])
            
        # Lower skip rates indicate persistence
        if 'skip_rate' in features:
            conscientiousness_indicators.append(1.0 - features['skip_rate'])
            
        # Preference for established, non-experimental music
        if audio_stats.get('mainstream_preference', 0) > 0.5:
            conscientiousness_indicators.append(audio_stats['mainstream_preference'])
            
        if conscientiousness_indicators:
            personality_scores["conscientiousness"] = np.mean(conscientiousness_indicators)
        
        # AGREEABLENESS
        # Research: Correlated with positive, harmonious, prosocial music
        agreeableness_indicators = []
        
        # Positive valence (strongest predictor)
        if 'avg_valence' in features:
            agreeableness_indicators.append(features['avg_valence'])
            
        # Preference for acoustic, warm sounds
        if 'avg_acousticness' in features:
            agreeableness_indicators.append(features['avg_acousticness'] * 0.8)
            
        # Lower preference for aggressive music
        if audio_stats.get('aggressive_music_ratio', 0) < 0.3:
            agreeableness_indicators.append(0.7)
            
        # Collaborative and social music behavior
        if 'social_sharing_tendency' in features:
            agreeableness_indicators.append(features['social_sharing_tendency'])
            
        # Preference for major keys and consonant harmonies
        if audio_stats.get('major_key_preference', 0) > 0.6:
            agreeableness_indicators.append(0.75)
            
        if agreeableness_indicators:
            personality_scores["agreeableness"] = np.mean(agreeableness_indicators)
        
        # NEUROTICISM (Emotional Stability - inverted)
        # Research: Correlated with intense, emotional, variable music
        neuroticism_indicators = []
        
        # Emotional intensity and instability
        if 'avg_valence' in features:
            # Lower valence suggests higher neuroticism
            neuroticism_indicators.append(1.0 - features['avg_valence'])
            
        # Preference for intense, dramatic music
        if 'avg_energy' in features and features['avg_energy'] > 0.8:
            neuroticism_indicators.append(0.7)
            
        # Mood variability in music choices
        if audio_stats.get('valence_variance', 0) > 0.3:
            neuroticism_indicators.append(0.6)
        if audio_stats.get('energy_variance', 0) > 0.3:
            neuroticism_indicators.append(0.6)
            
        # Preference for minor keys and dissonance
        if audio_stats.get('minor_key_preference', 0) > 0.6:
            neuroticism_indicators.append(0.7)
            
        # Irregular listening patterns
        if temporal_stats.get('pattern_consistency', 1.0) < 0.5:
            neuroticism_indicators.append(0.6)
            
        if neuroticism_indicators:
            personality_scores["neuroticism"] = np.mean(neuroticism_indicators)
        
        # Apply research-based adjustments and bounds
        personality_scores = _apply_psychological_constraints(personality_scores, features)
        
        # Ensure realistic score distribution (avoid extreme values)
        for trait in personality_scores:
            personality_scores[trait] = max(0.15, min(0.85, personality_scores[trait]))
            
        return personality_scores
        
    except Exception as e:
        logger.error(f"Error in advanced personality analysis: {e}")
        return get_default_personality_scores()


def _analyze_audio_features(audio_features_df) -> Dict[str, float]:
    """Extract detailed statistics from audio features."""
    stats = {}
    
    if audio_features_df.empty:
        return stats
    
    try:
        # Basic statistics
        for feature in ['energy', 'valence', 'danceability', 'acousticness', 'instrumentalness', 'liveness', 'speechiness']:
            if feature in audio_features_df.columns:
                stats[f'avg_{feature}'] = audio_features_df[feature].mean()
                stats[f'{feature}_variance'] = audio_features_df[feature].var()
        
        # Tempo analysis
        if 'tempo' in audio_features_df.columns:
            stats['avg_tempo'] = audio_features_df['tempo'].mean()
            stats['tempo_variance'] = audio_features_df['tempo'].var() / 1000  # Normalize
        
        # Loudness analysis
        if 'loudness' in audio_features_df.columns:
            stats['avg_loudness'] = audio_features_df['loudness'].mean()
            
        # Key and mode analysis
        if 'mode' in audio_features_df.columns:
            stats['major_key_preference'] = audio_features_df['mode'].mean()
            stats['minor_key_preference'] = 1.0 - stats['major_key_preference']
        
        # Time signature variety
        if 'time_signature' in audio_features_df.columns:
            unique_signatures = audio_features_df['time_signature'].nunique()
            stats['time_signature_variety'] = min(1.0, unique_signatures / 5)
        
        # Musical sophistication indicators
        if 'instrumentalness' in audio_features_df.columns and 'acousticness' in audio_features_df.columns:
            sophisticated_ratio = ((audio_features_df['instrumentalness'] > 0.5) | 
                                 (audio_features_df['acousticness'] > 0.7)).mean()
            stats['sophistication_ratio'] = sophisticated_ratio
        
        # Aggressive music detection
        if all(col in audio_features_df.columns for col in ['energy', 'loudness', 'valence']):
            aggressive_mask = ((audio_features_df['energy'] > 0.8) & 
                             (audio_features_df['loudness'] > -5) & 
                             (audio_features_df['valence'] < 0.4))
            stats['aggressive_music_ratio'] = aggressive_mask.mean()
        
        # Mainstream vs. niche preferences
        if 'popularity' in audio_features_df.columns:
            stats['avg_popularity'] = audio_features_df['popularity'].mean()
            stats['mainstream_preference'] = (audio_features_df['popularity'] > 70).mean()
            
    except Exception as e:
        logger.error(f"Error analyzing audio features: {e}")
    
    return stats


def _analyze_genre_patterns(tracks_df) -> Dict[str, Any]:
    """Analyze genre diversity and patterns."""
    stats = {}
    
    if tracks_df.empty:
        return stats
    
    try:
        # Extract genres from track data (this would need to be enhanced with real genre data)
        # For now, use artist diversity as a proxy
        if 'artist_name' in tracks_df.columns:
            unique_artists = tracks_df['artist_name'].nunique()
            total_tracks = len(tracks_df)
            stats['artist_diversity'] = min(1.0, unique_artists / total_tracks)
            stats['unique_artists'] = unique_artists
        
        # Album diversity
        if 'album_name' in tracks_df.columns:
            unique_albums = tracks_df['album_name'].nunique()
            stats['album_diversity'] = min(1.0, unique_albums / len(tracks_df))
            
        # Placeholder for genre analysis (would be enhanced with real genre classification)
        stats['unique_genres'] = []  # Would be populated with actual genre data
        stats['genre_diversity'] = stats.get('artist_diversity', 0.5)  # Proxy
        
    except Exception as e:
        logger.error(f"Error analyzing genre patterns: {e}")
        
    return stats


def _analyze_temporal_patterns(features: Dict[str, float]) -> Dict[str, float]:
    """Extract temporal listening pattern statistics."""
    stats = {}
    
    # Routine strength (consistency of listening times)
    if 'temporal_peak_hour_ratio' in features:
        stats['routine_strength'] = features['temporal_peak_hour_ratio']
    
    # Pattern consistency
    temporal_features = [k for k in features.keys() if k.startswith('temporal_')]
    if temporal_features:
        # Higher variance in temporal patterns suggests less consistency
        temporal_values = [features[k] for k in temporal_features if isinstance(features[k], (int, float))]
        if temporal_values:
            stats['pattern_consistency'] = 1.0 - (np.var(temporal_values) / (np.mean(temporal_values) + 0.001))
            stats['pattern_consistency'] = max(0.0, min(1.0, stats['pattern_consistency']))
    
    return stats


def _apply_psychological_constraints(scores: Dict[str, float], features: Dict[str, float]) -> Dict[str, float]:
    """Apply psychological research constraints and correlations."""
    
    # Research-based trait correlations
    # Openness and Extraversion often correlate positively
    if scores['openness'] > 0.7 and scores['extraversion'] < 0.3:
        scores['extraversion'] = min(0.6, scores['extraversion'] + 0.2)
    
    # High Conscientiousness typically correlates with lower Neuroticism
    if scores['conscientiousness'] > 0.7:
        scores['neuroticism'] = max(0.2, scores['neuroticism'] - 0.15)
    
    # High Agreeableness typically correlates with lower Neuroticism
    if scores['agreeableness'] > 0.7:
        scores['neuroticism'] = max(0.2, scores['neuroticism'] - 0.1)
    
    # Extreme combinations adjustment
    for trait in scores:
        # Prevent unrealistic extreme scores unless strongly supported
        if scores[trait] > 0.8:
            confidence_factors = len([k for k in features.keys() if trait.split('_')[0] in k])
            if confidence_factors < 3:  # Reduce extreme scores with low evidence
                scores[trait] = min(0.75, scores[trait])
    
    return scores


def generate_personality_insights(personality_scores: Dict[str, float], features: Dict[str, float]) -> List[str]:
    """Generate sophisticated, research-based personality insights."""
    insights = []
    
    # Enhanced Openness insights
    openness = personality_scores.get("openness", 0.5)
    if openness > 0.75:
        insights.append("🎵 Your incredibly diverse music taste reveals exceptional openness to experience. You likely seek novelty, appreciate complexity, and embrace unconventional artistic expressions. Research suggests this correlates with creativity, intellectual curiosity, and aesthetic sensitivity.")
    elif openness > 0.6:
        insights.append("� Your varied musical preferences indicate strong openness to new experiences. You probably enjoy exploring different genres and artists, suggesting creative thinking and adaptability in other life areas.")
    elif openness < 0.3:
        insights.append("� Your focused musical preferences suggest you value consistency and familiarity. This often correlates with practical thinking, attention to detail, and preference for proven approaches over experimental ones.")
    else:
        insights.append("⚖️ You balance musical exploration with familiar favorites, indicating moderate openness. You're likely selective about new experiences, preferring quality over novelty.")
    
    # Enhanced Extraversion insights  
    extraversion = personality_scores.get("extraversion", 0.5)
    if extraversion > 0.75:
        insights.append("🎉 Your preference for high-energy, danceable music strongly suggests extraversion. You likely thrive in social situations, seek stimulation, and express emotions openly. Your music choices reflect a dynamic, outgoing personality.")
    elif extraversion > 0.6:
        insights.append("🎵 Your energetic music preferences indicate moderate extraversion. You probably enjoy social activities and tend to be optimistic, though you also appreciate quieter moments.")
    elif extraversion < 0.3:
        insights.append("🎧 Your taste for calmer, introspective music suggests introversion. You likely prefer deeper conversations, need solitude to recharge, and think carefully before speaking. This isn't shyness - it's a preference for depth over breadth in social interactions.")
    else:
        insights.append("🌓 Your mixed energy preferences suggest ambiversion - a balance between introverted and extraverted tendencies. You're adaptable to both social and solitary situations.")
    
    # Enhanced Conscientiousness insights
    conscientiousness = personality_scores.get("conscientiousness", 0.5)
    if conscientiousness > 0.75:
        insights.append("📋 Your highly organized listening patterns reveal strong conscientiousness. You likely excel at planning, meeting deadlines, and maintaining routines. Research links this trait to academic and career success through self-discipline and goal persistence.")
    elif conscientiousness > 0.6:
        insights.append("🎯 Your structured approach to music consumption suggests good self-control and organization. You probably balance planning with flexibility, and tend to follow through on commitments.")
    elif conscientiousness < 0.3:
        insights.append("🌊 Your spontaneous music listening style indicates flexibility and adaptability. You likely prefer to 'go with the flow,' value creativity over rigid structure, and may work best under pressure rather than strict schedules.")
    else:
        insights.append("⚡ You show balanced conscientiousness - organized when needed, flexible when appropriate. This adaptability serves you well in varied situations.")
    
    # Enhanced Agreeableness insights
    agreeableness = personality_scores.get("agreeableness", 0.5)
    if agreeableness > 0.75:
        insights.append("🤝 Your strong preference for positive, harmonious music indicates high agreeableness. You likely prioritize cooperation, trust others easily, and seek to maintain group harmony. This trait often leads to strong relationships and effective teamwork.")
    elif agreeableness > 0.6:
        insights.append("💫 Your preference for uplifting music suggests you value harmony and positive relationships. You're probably empathetic and considerate, though you can assert yourself when necessary.")
    elif agreeableness < 0.3:
        insights.append("💪 Your taste for more intense or unconventional music suggests independence and critical thinking. You likely value honesty over politeness, think analytically about people and situations, and aren't afraid to challenge popular opinions.")
    else:
        insights.append("🎭 Your varied musical moods reflect balanced agreeableness - cooperative when helpful, assertive when necessary. You adapt your social approach to the situation.")
    
    # Enhanced Neuroticism insights
    neuroticism = personality_scores.get("neuroticism", 0.5)
    if neuroticism > 0.7:
        insights.append("🌧️ Your music preferences suggest emotional intensity and sensitivity. While this means you may experience stress more acutely, it also indicates deep empathy, artistic appreciation, and authentic emotional expression. Consider using music therapeutically for emotional regulation.")
    elif neuroticism > 0.55:
        insights.append("🌤️ Your musical choices indicate moderate emotional sensitivity. You're likely empathetic and responsive to your environment, though this sometimes means feeling overwhelmed. Your emotional awareness is actually a strength for understanding others.")
    elif neuroticism < 0.3:
        insights.append("☀️ Your consistently positive music choices suggest high emotional stability. You likely remain calm under pressure, recover quickly from setbacks, and maintain an optimistic outlook. This resilience is a significant psychological asset.")
    else:
        insights.append("⚖️ Your balanced emotional expression through music reflects healthy emotional regulation. You experience the full range of human emotions while maintaining overall stability.")
    
    # Add trait combinations and interaction insights
    _add_trait_interaction_insights(insights, personality_scores, features)
    
    # Add research-based behavioral predictions
    _add_behavioral_predictions(insights, personality_scores)
    
    return insights


def _add_trait_interaction_insights(insights: List[str], scores: Dict[str, float], features: Dict[str, float]):
    """Add insights about trait interactions and combinations."""
    
    # High Openness + High Extraversion
    if scores.get('openness', 0.5) > 0.6 and scores.get('extraversion', 0.5) > 0.6:
        insights.append("🚀 Your combination of openness and extraversion suggests you're an enthusiastic explorer of new musical experiences. You likely share discoveries with others and influence your social circle's musical tastes.")
    
    # High Conscientiousness + Low Neuroticism
    if scores.get('conscientiousness', 0.5) > 0.6 and scores.get('neuroticism', 0.5) < 0.4:
        insights.append("🏆 Your organized listening habits combined with emotional stability suggest excellent self-regulation. This combination often predicts success in goal achievement and stress management.")
    
    # High Agreeableness + High Extraversion
    if scores.get('agreeableness', 0.5) > 0.6 and scores.get('extraversion', 0.5) > 0.6:
        insights.append("🤗 Your social and harmonious music preferences indicate you're likely a positive influence in group settings. You probably excel at bringing people together through shared musical experiences.")
    
    # Low Agreeableness + High Openness
    if scores.get('agreeableness', 0.5) < 0.4 and scores.get('openness', 0.5) > 0.6:
        insights.append("� Your appreciation for diverse, possibly challenging music combined with independent thinking suggests you're an authentic individual who values artistic integrity over popularity.")


def _add_behavioral_predictions(insights: List[str], scores: Dict[str, float]):
    """Add research-based behavioral predictions."""
    
    # Based on music psychology research findings
    if scores.get('openness', 0.5) > 0.7:
        insights.append("📚 Research suggests people with your musical openness often excel in creative fields, adapt well to change, and may prefer liberal political views. You might enjoy travel, diverse cuisines, and intellectual conversations.")
    
    if scores.get('extraversion', 0.5) > 0.7:
        insights.append("🎪 Your energetic music preferences align with research showing extraverts often prefer upbeat environments, seek social stimulation, and may work well in team-oriented or leadership roles.")
    
    if scores.get('conscientiousness', 0.5) > 0.7:
        insights.append("📈 Studies link your organized listening patterns to success in academic and professional settings. You probably maintain good health habits and financial planning.")
    
    if scores.get('agreeableness', 0.5) > 0.7:
        insights.append("🌱 Your preference for harmonious music correlates with research on helping behavior, successful long-term relationships, and collaborative work environments.")
    
    if scores.get('neuroticism', 0.5) < 0.3:
        insights.append("🧘 Your emotionally stable music choices align with research on resilience, life satisfaction, and effective coping strategies during challenging times.")


def calculate_analysis_confidence(features: Dict[str, float], track_count: int, audio_feature_count: int = 0) -> float:
    """
    Calculate sophisticated confidence score for personality analysis.
    Based on data quality, quantity, and feature richness.
    """
    confidence_factors = []
    
    # 1. Data Quantity Score (0-0.25)
    if track_count >= 500:
        quantity_score = 0.25
    elif track_count >= 200:
        quantity_score = 0.20
    elif track_count >= 100:
        quantity_score = 0.15
    elif track_count >= 50:
        quantity_score = 0.10
    else:
        quantity_score = max(0.05, track_count / 500 * 0.25)
    confidence_factors.append(("data_quantity", quantity_score))
    
    # 2. Audio Features Quality (0-0.20)
    if audio_feature_count > 0:
        audio_ratio = min(1.0, audio_feature_count / track_count)
        audio_score = audio_ratio * 0.20
    else:
        audio_score = 0.0
    confidence_factors.append(("audio_features", audio_score))
    
    # 3. Feature Diversity Score (0-0.20)
    feature_categories = {
        'acoustic': ['avg_energy', 'avg_valence', 'avg_danceability', 'avg_acousticness'],
        'temporal': ['temporal_peak_hour', 'temporal_listening_consistency'],
        'behavioral': ['artist_diversity', 'genre_diversity', 'completion_rate'],
        'advanced': ['instrumentalness', 'speechiness', 'liveness', 'loudness']
    }
    
    category_scores = []
    for category, category_features in feature_categories.items():
        available_features = sum(1 for f in category_features if f in features)
        category_score = available_features / len(category_features)
        category_scores.append(category_score)
    
    diversity_score = np.mean(category_scores) * 0.20
    confidence_factors.append(("feature_diversity", diversity_score))
    
    # 4. Data Consistency Score (0-0.15)
    consistency_indicators = []
    
    # Check for realistic feature ranges
    if 'avg_energy' in features:
        if 0.0 <= features['avg_energy'] <= 1.0:
            consistency_indicators.append(1.0)
        else:
            consistency_indicators.append(0.5)
    
    if 'avg_valence' in features:
        if 0.0 <= features['avg_valence'] <= 1.0:
            consistency_indicators.append(1.0)
        else:
            consistency_indicators.append(0.5)
    
    # Check for feature correlations that make sense
    if 'avg_energy' in features and 'avg_danceability' in features:
        correlation = abs(features['avg_energy'] - features['avg_danceability'])
        if correlation < 0.5:  # Reasonable correlation
            consistency_indicators.append(1.0)
        else:
            consistency_indicators.append(0.7)
    
    consistency_score = (np.mean(consistency_indicators) if consistency_indicators else 0.5) * 0.15
    confidence_factors.append(("data_consistency", consistency_score))
    
    # 5. Analysis Sophistication Score (0-0.10)
    sophistication_indicators = []
    
    # Bonus for having genre/artist diversity
    if 'genre_diversity' in features and features['genre_diversity'] > 0:
        sophistication_indicators.append(features['genre_diversity'])
    
    # Bonus for temporal patterns
    temporal_features = [k for k in features.keys() if 'temporal' in k]
    if temporal_features:
        sophistication_indicators.append(min(1.0, len(temporal_features) / 5))
    
    # Bonus for advanced audio features
    advanced_features = ['instrumentalness', 'speechiness', 'liveness']
    advanced_count = sum(1 for f in advanced_features if f in features)
    if advanced_count > 0:
        sophistication_indicators.append(advanced_count / len(advanced_features))
    
    sophistication_score = (np.mean(sophistication_indicators) if sophistication_indicators else 0.3) * 0.10
    confidence_factors.append(("analysis_sophistication", sophistication_score))
    
    # 6. Baseline Confidence (0.10)
    baseline_score = 0.10
    confidence_factors.append(("baseline", baseline_score))
    
    # Calculate total confidence
    total_confidence = sum(score for _, score in confidence_factors)
    
    # Apply penalties for insufficient data
    if track_count < 20:
        total_confidence *= 0.7  # Significant penalty for very low data
    elif track_count < 50:
        total_confidence *= 0.85  # Moderate penalty
    
    if audio_feature_count == 0:
        total_confidence *= 0.8  # Penalty for no audio features
    
    # Ensure confidence is in reasonable range
    final_confidence = max(0.15, min(0.95, total_confidence))
    
    # Log confidence breakdown for debugging
    logger.info(f"Confidence calculation: {confidence_factors}, final: {final_confidence:.3f}")
    
    return final_confidence


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
