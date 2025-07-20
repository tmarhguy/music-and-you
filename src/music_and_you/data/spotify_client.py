"""
Spotify API client for music data collection.
"""

import spotipy
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
import time
import os
import json
import base64
import requests
from datetime import datetime, timedelta
from urllib.parse import urlencode

from .base_client import BaseMusicClient

logger = logging.getLogger(__name__)


class SpotifyClient(BaseMusicClient):
    """Enhanced client for interacting with the Spotify Web API."""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        """
        Initialize the Spotify client.
        
        Args:
            client_id: Spotify application client ID
            client_secret: Spotify application client secret
            redirect_uri: OAuth redirect URI
        """
        super().__init__(client_id, client_secret)
        self.redirect_uri = redirect_uri
        
        # Spotify OAuth scopes
        self.scope = (
            "user-read-private "
            "user-read-email "
            "user-top-read "
            "user-read-recently-played "
            "playlist-read-private "
            "playlist-read-collaborative "
            "user-library-read "
            "user-read-playback-state "
            "user-read-currently-playing "
            "user-follow-read"
        )
        
        self.auth_manager = None
        self.spotify = None
        self.access_token = None
        self.refresh_token = None
        self.token_expires_at = None

    def get_auth_url(self, state: str = None) -> str:
        """
        Get Spotify authorization URL for OAuth flow.
        
        Args:
            state: Optional state parameter for security
            
        Returns:
            Authorization URL
        """
        auth_params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.redirect_uri,
            'scope': self.scope,
            'show_dialog': 'true'  # Force user to see permission dialog
        }
        
        if state:
            auth_params['state'] = state
            
        auth_url = f"https://accounts.spotify.com/authorize?{urlencode(auth_params)}"
        return auth_url
    
    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from OAuth callback
            
        Returns:
            Token information dictionary
        """
        try:
            # Prepare token request
            token_url = "https://accounts.spotify.com/api/token"
            
            headers = {
                'Authorization': f'Basic {base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri
            }
            
            response = requests.post(token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_info = response.json()
            
            # Store token information
            self.access_token = token_info['access_token']
            self.refresh_token = token_info.get('refresh_token')
            self.token_expires_at = time.time() + token_info['expires_in']
            
            # Initialize Spotify client
            self.spotify = spotipy.Spotify(auth=self.access_token)
            
            logger.info("Successfully exchanged code for access token")
            return {
                'access_token': self.access_token,
                'refresh_token': self.refresh_token,
                'expires_in': token_info['expires_in'],
                'expires_at': self.token_expires_at,
                'scope': token_info.get('scope', self.scope)
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to exchange code for token: {e}")
            raise Exception(f"Token exchange failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during token exchange: {e}")
            raise
    
    def refresh_access_token(self) -> Dict[str, Any]:
        """
        Refresh the access token using refresh token.
        
        Returns:
            New token information
        """
        if not self.refresh_token:
            raise Exception("No refresh token available")
        
        try:
            token_url = "https://accounts.spotify.com/api/token"
            
            headers = {
                'Authorization': f'Basic {base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': self.refresh_token
            }
            
            response = requests.post(token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_info = response.json()
            
            # Update token information
            self.access_token = token_info['access_token']
            if 'refresh_token' in token_info:
                self.refresh_token = token_info['refresh_token']
            self.token_expires_at = time.time() + token_info['expires_in']
            
            # Update Spotify client
            self.spotify = spotipy.Spotify(auth=self.access_token)
            
            logger.info("Successfully refreshed access token")
            return {
                'access_token': self.access_token,
                'refresh_token': self.refresh_token,
                'expires_in': token_info['expires_in'],
                'expires_at': self.token_expires_at
            }
            
        except Exception as e:
            logger.error(f"Failed to refresh token: {e}")
            raise
    
    def is_token_expired(self) -> bool:
        """Check if the current token is expired."""
        if not self.token_expires_at:
            return True
        return time.time() >= (self.token_expires_at - 300)  # 5 minute buffer
    
    def ensure_valid_token(self):
        """Ensure we have a valid access token."""
        if not self.access_token:
            raise Exception("No access token available. Please authenticate first.")
        
        if self.is_token_expired():
            if self.refresh_token:
                logger.info("Token expired, refreshing...")
                self.refresh_access_token()
            else:
                raise Exception("Token expired and no refresh token available")
    
    def authenticate(self, code: Optional[str] = None, state: Optional[str] = None) -> Dict[str, str]:
        """
        Authenticate with Spotify using OAuth.
        
        Args:
            code: Authorization code from OAuth callback
            state: State parameter for security verification
            
        Returns:
            Dictionary containing authentication info
        """
        try:
            if code:
                # Exchange authorization code for access token
                token_info = self.exchange_code_for_token(code)
                return {
                    "status": "authenticated",
                    "access_token": token_info["access_token"],
                    "expires_at": str(token_info["expires_at"])
                }
            else:
                # Return authorization URL
                auth_url = self.get_auth_url(state)
                return {
                    "status": "authorization_required",
                    "auth_url": auth_url
                }
                
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_user_profile(self) -> Dict:
        """Get current user's profile information."""
        self.ensure_valid_token()
        
        try:
            user_info = self.spotify.current_user()
            return {
                "user_id": user_info["id"],
                "display_name": user_info.get("display_name"),
                "email": user_info.get("email"),
                "country": user_info.get("country"),
                "followers": user_info.get("followers", {}).get("total", 0),
                "subscription": user_info.get("product", "free"),
                "images": user_info.get("images", []),
                "external_urls": user_info.get("external_urls", {}),
                "href": user_info.get("href")
            }
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            raise
    
    def get_listening_history(self, limit: int = 50, after: Optional[int] = None) -> pd.DataFrame:
        """
        Get user's listening history (recently played tracks).
        
        Args:
            limit: Number of tracks to retrieve (max 50)
            after: Unix timestamp to get tracks after this time
            
        Returns:
            DataFrame with listening history
        """
        self.ensure_valid_token()
        
        tracks_data = []
        
        try:
            # Get recently played tracks
            kwargs = {'limit': min(limit, 50)}
            if after:
                kwargs['after'] = after
                
            recent_tracks = self.spotify.current_user_recently_played(**kwargs)
            
            for item in recent_tracks["items"]:
                track = item["track"]
                played_at = item["played_at"]
                context = item.get("context", {})
                
                track_data = {
                    "track_id": track["id"],
                    "track_name": track["name"],
                    "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                    "artist_id": track["artists"][0]["id"] if track["artists"] else None,
                    "album_name": track["album"]["name"],
                    "album_id": track["album"]["id"],
                    "duration_ms": track["duration_ms"],
                    "popularity": track["popularity"],
                    "explicit": track["explicit"],
                    "played_at": played_at,
                    "context_type": context.get("type") if context else None,
                    "context_uri": context.get("uri") if context else None,
                    "source": "recently_played"
                }
                tracks_data.append(track_data)
            
            return pd.DataFrame(tracks_data)
            
        except Exception as e:
            logger.error(f"Failed to get listening history: {e}")
            return pd.DataFrame()
    
    def get_top_tracks(self, time_range: str = "medium_term", limit: int = 50) -> pd.DataFrame:
        """
        Get user's top tracks.
        
        Args:
            time_range: Time range for top tracks (short_term, medium_term, long_term)
            limit: Number of tracks to retrieve (max 50)
            
        Returns:
            DataFrame with top tracks
        """
        self.ensure_valid_token()
        
        try:
            top_tracks = self.spotify.current_user_top_tracks(
                limit=min(limit, 50),
                time_range=time_range
            )
            
            tracks_data = []
            for idx, track in enumerate(top_tracks["items"]):
                track_data = {
                    "track_id": track["id"],
                    "track_name": track["name"],
                    "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                    "artist_id": track["artists"][0]["id"] if track["artists"] else None,
                    "album_name": track["album"]["name"],
                    "album_id": track["album"]["id"],
                    "duration_ms": track["duration_ms"],
                    "popularity": track["popularity"],
                    "explicit": track["explicit"],
                    "rank": idx + 1,
                    "time_range": time_range,
                    "source": "top_tracks"
                }
                tracks_data.append(track_data)
            
            return pd.DataFrame(tracks_data)
            
        except Exception as e:
            logger.error(f"Failed to get top tracks: {e}")
            return pd.DataFrame()
    
    def get_top_artists(self, time_range: str = "medium_term", limit: int = 50) -> pd.DataFrame:
        """
        Get user's top artists.
        
        Args:
            time_range: Time range for top artists (short_term, medium_term, long_term)
            limit: Number of artists to retrieve (max 50)
            
        Returns:
            DataFrame with top artists
        """
        self.ensure_valid_token()
        
        try:
            top_artists = self.spotify.current_user_top_artists(
                limit=min(limit, 50),
                time_range=time_range
            )
            
            artists_data = []
            for idx, artist in enumerate(top_artists["items"]):
                artist_data = {
                    "artist_id": artist["id"],
                    "artist_name": artist["name"],
                    "genres": ", ".join(artist["genres"]),
                    "popularity": artist["popularity"],
                    "followers": artist["followers"]["total"],
                    "rank": idx + 1,
                    "time_range": time_range,
                    "images": artist.get("images", []),
                    "external_urls": artist.get("external_urls", {})
                }
                artists_data.append(artist_data)
            
            return pd.DataFrame(artists_data)
            
        except Exception as e:
            logger.error(f"Failed to get top artists: {e}")
            return pd.DataFrame()
    
    def get_audio_features(self, track_ids: List[str]) -> pd.DataFrame:
        """
        Get audio features for a list of tracks.
        
        Args:
            track_ids: List of Spotify track IDs
            
        Returns:
            DataFrame with audio features
        """
        self.ensure_valid_token()
        
        if not track_ids:
            return pd.DataFrame()
        
        audio_features_data = []
        
        try:
            # Process tracks in batches of 100 (Spotify API limit)
            batch_size = 100
            for i in range(0, len(track_ids), batch_size):
                batch_ids = track_ids[i:i + batch_size]
                features = self.spotify.audio_features(batch_ids)
                
                for feature in features:
                    if feature:  # Some tracks may not have audio features
                        audio_features_data.append({
                            "track_id": feature["id"],
                            "acousticness": feature["acousticness"],
                            "danceability": feature["danceability"],
                            "energy": feature["energy"],
                            "instrumentalness": feature["instrumentalness"],
                            "liveness": feature["liveness"],
                            "loudness": feature["loudness"],
                            "speechiness": feature["speechiness"],
                            "tempo": feature["tempo"],
                            "valence": feature["valence"],
                            "mode": feature["mode"],
                            "key": feature["key"],
                            "time_signature": feature["time_signature"],
                            "duration_ms": feature["duration_ms"]
                        })
                
                # Rate limiting
                time.sleep(0.1)
            
            return pd.DataFrame(audio_features_data)
            
        except Exception as e:
            logger.error(f"Failed to get audio features: {e}")
            return pd.DataFrame()
    
    def get_track_features(self, track_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Get audio features for a list of tracks (alias for compatibility with base class).
        
        Args:
            track_ids: List of Spotify track IDs
            
        Returns:
            List of audio feature dictionaries
        """
        df = self.get_audio_features(track_ids)
        return df.to_dict('records') if not df.empty else []
    
    def get_user_playlists(self, limit: int = 50) -> pd.DataFrame:
        """
        Get user's playlists.
        
        Args:
            limit: Number of playlists to retrieve
            
        Returns:
            DataFrame with playlist information
        """
        self.ensure_valid_token()
        
        playlists_data = []
        
        try:
            offset = 0
            while len(playlists_data) < limit:
                batch_limit = min(50, limit - len(playlists_data))
                playlists = self.spotify.current_user_playlists(limit=batch_limit, offset=offset)
                
                if not playlists["items"]:
                    break
                
                for playlist in playlists["items"]:
                    playlist_data = {
                        "playlist_id": playlist["id"],
                        "playlist_name": playlist["name"],
                        "description": playlist.get("description", ""),
                        "track_count": playlist["tracks"]["total"],
                        "followers": playlist.get("followers", {}).get("total", 0),
                        "public": playlist["public"],
                        "collaborative": playlist["collaborative"],
                        "owner_id": playlist["owner"]["id"],
                        "owner_name": playlist["owner"]["display_name"],
                        "snapshot_id": playlist["snapshot_id"],
                        "images": playlist.get("images", [])
                    }
                    playlists_data.append(playlist_data)
                
                offset += batch_limit
                if len(playlists["items"]) < batch_limit:
                    break
            
            return pd.DataFrame(playlists_data)
            
        except Exception as e:
            logger.error(f"Failed to get user playlists: {e}")
            return pd.DataFrame()
    
    def get_saved_tracks(self, limit: int = None) -> pd.DataFrame:
        """
        Get user's saved tracks (liked songs).
        
        Args:
            limit: Number of tracks to retrieve (None for all tracks)
            
        Returns:
            DataFrame with saved tracks
        """
        self.ensure_valid_token()
        
        tracks_data = []
        
        try:
            offset = 0
            while True:
                # Spotify API max is 50 per request
                batch_limit = 50
                
                # If limit is specified and we're close to it, adjust batch size
                if limit is not None and len(tracks_data) + batch_limit > limit:
                    batch_limit = limit - len(tracks_data)
                    if batch_limit <= 0:
                        break
                
                saved_tracks = self.spotify.current_user_saved_tracks(
                    limit=batch_limit, 
                    offset=offset
                )
                
                # No more tracks available
                if not saved_tracks["items"]:
                    break
                
                for item in saved_tracks["items"]:
                    track = item["track"]
                    added_at = item["added_at"]
                    
                    track_data = {
                        "track_id": track["id"],
                        "track_name": track["name"],
                        "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                        "artist_id": track["artists"][0]["id"] if track["artists"] else None,
                        "album_name": track["album"]["name"],
                        "album_id": track["album"]["id"],
                        "duration_ms": track["duration_ms"],
                        "popularity": track["popularity"],
                        "explicit": track["explicit"],
                        "added_at": added_at,
                        "preview_url": track.get("preview_url"),
                        "external_urls": track.get("external_urls", {}).get("spotify"),
                        "album_image": track["album"]["images"][0]["url"] if track["album"].get("images") else None,
                        "source": "saved_tracks"
                    }
                    tracks_data.append(track_data)
                
                offset += batch_limit
                
                # If we got fewer items than requested, we've reached the end
                if len(saved_tracks["items"]) < batch_limit:
                    break
                    
                # If we have a limit and reached it, stop
                if limit is not None and len(tracks_data) >= limit:
                    break
            
            logger.info(f"Retrieved {len(tracks_data)} saved tracks")
            return pd.DataFrame(tracks_data)
            
        except Exception as e:
            logger.error(f"Failed to get saved tracks: {e}")
            return pd.DataFrame()
    
    def get_followed_artists(self, limit: int = 50) -> pd.DataFrame:
        """
        Get artists followed by the user.
        
        Args:
            limit: Number of artists to retrieve
            
        Returns:
            DataFrame with followed artists
        """
        self.ensure_valid_token()
        
        try:
            followed = self.spotify.current_user_followed_artists(limit=min(limit, 50))
            
            artists_data = []
            for artist in followed["artists"]["items"]:
                artist_data = {
                    "artist_id": artist["id"],
                    "artist_name": artist["name"],
                    "genres": ", ".join(artist["genres"]),
                    "popularity": artist["popularity"],
                    "followers": artist["followers"]["total"],
                    "images": artist.get("images", []),
                    "external_urls": artist.get("external_urls", {})
                }
                artists_data.append(artist_data)
            
            return pd.DataFrame(artists_data)
            
        except Exception as e:
            logger.error(f"Failed to get followed artists: {e}")
            return pd.DataFrame()
    
    def collect_comprehensive_data(self, user_id: str) -> Dict[str, pd.DataFrame]:
        """
        Collect comprehensive user data from Spotify.
        
        Args:
            user_id: Spotify user ID
            
        Returns:
            Dictionary containing all collected data
        """
        self.ensure_valid_token()
        
        data = {}
        
        try:
            # Get user profile
            logger.info("Collecting user profile...")
            profile = self.get_user_profile()
            data["profile"] = pd.DataFrame([profile])
            
            # Get listening history
            logger.info("Collecting recent listening history...")
            data["recent_tracks"] = self.get_listening_history(limit=50)
            
            # Get top tracks for different time ranges
            for time_range in ["short_term", "medium_term", "long_term"]:
                logger.info(f"Collecting top tracks ({time_range})...")
                data[f"top_tracks_{time_range}"] = self.get_top_tracks(time_range=time_range, limit=50)
            
            # Get top artists for different time ranges
            for time_range in ["short_term", "medium_term", "long_term"]:
                logger.info(f"Collecting top artists ({time_range})...")
                data[f"top_artists_{time_range}"] = self.get_top_artists(time_range=time_range, limit=50)
            
            # Get saved tracks
            logger.info("Collecting saved tracks...")
            data["saved_tracks"] = self.get_saved_tracks(limit=50)
            
            # Get user playlists
            logger.info("Collecting user playlists...")
            data["playlists"] = self.get_user_playlists(limit=50)
            
            # Get followed artists
            logger.info("Collecting followed artists...")
            data["followed_artists"] = self.get_followed_artists(limit=50)
            
            # Collect all unique track IDs for audio features
            all_track_ids = set()
            for key, df in data.items():
                if "track_id" in df.columns:
                    all_track_ids.update(df["track_id"].dropna().unique())
            
            # Get audio features for all tracks
            if all_track_ids:
                logger.info(f"Collecting audio features for {len(all_track_ids)} tracks...")
                data["audio_features"] = self.get_audio_features(list(all_track_ids))
            
            logger.info(f"Data collection complete for user {user_id}")
            return data
            
        except Exception as e:
            logger.error(f"Failed to collect comprehensive user data: {e}")
            raise
