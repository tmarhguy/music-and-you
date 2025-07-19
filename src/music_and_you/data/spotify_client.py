"""
Spotify API client for music data ingestion.
"""

import spotipy
from spotipy.oauth2 import SpotifyOAuth
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from .base_client import BaseMusicClient

logger = logging.getLogger(__name__)


class SpotifyClient(BaseMusicClient):
    """
    Spotify API client for retrieving user listening data and track features.
    
    This client handles authentication, listening history retrieval,
    and audio feature extraction from the Spotify Web API.
    """
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str = "http://localhost:8080/callback"):
        """
        Initialize Spotify client.
        
        Args:
            client_id: Spotify app client ID
            client_secret: Spotify app client secret
            redirect_uri: OAuth redirect URI
        """
        super().__init__(client_id, client_secret)
        self.redirect_uri = redirect_uri
        self.scope = (
            "user-read-recently-played "
            "user-read-playback-state "
            "user-top-read "
            "playlist-read-private "
            "user-library-read"
        )
        self.sp = None
        
    def authenticate(self, **kwargs) -> bool:
        """
        Authenticate with Spotify using OAuth2.
        
        Returns:
            bool: True if authentication successful
        """
        try:
            auth_manager = SpotifyOAuth(
                client_id=self.client_id,
                client_secret=self.client_secret,
                redirect_uri=self.redirect_uri,
                scope=self.scope
            )
            
            self.sp = spotipy.Spotify(auth_manager=auth_manager)
            
            # Test authentication
            profile = self.sp.current_user()
            self.user_id = profile['id']
            self.authenticated = True
            
            logger.info(f"Successfully authenticated Spotify user: {self.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Spotify authentication failed: {e}")
            return False
    
    def get_user_profile(self) -> Dict[str, Any]:
        """
        Get Spotify user profile information.
        
        Returns:
            Dict containing user profile data
        """
        if not self.authenticated:
            raise ValueError("Client not authenticated")
            
        profile = self.sp.current_user()
        return {
            'user_id': profile['id'],
            'display_name': profile.get('display_name'),
            'followers': profile['followers']['total'],
            'country': profile.get('country'),
            'product': profile.get('product'),  # premium/free
            'platform': 'spotify'
        }
    
    def get_listening_history(
        self, 
        start_date: datetime, 
        end_date: datetime,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get user's listening history from Spotify.
        
        Note: Spotify API only provides last 50 recently played tracks.
        For longer history, we rely on user's saved tracks and top tracks.
        
        Args:
            start_date: Start date (limited by Spotify API)
            end_date: End date
            limit: Maximum tracks to retrieve
            
        Returns:
            List of listening records
        """
        if not self.authenticated:
            raise ValueError("Client not authenticated")
            
        tracks = []
        
        # Get recently played tracks (last 50)
        try:
            recent = self.sp.current_user_recently_played(limit=50)
            for item in recent['items']:
                track_data = self._format_track_data(item['track'], item['played_at'])
                tracks.append(track_data)
        except Exception as e:
            logger.warning(f"Could not retrieve recent tracks: {e}")
        
        # Get user's top tracks (different time ranges)
        for time_range in ['short_term', 'medium_term', 'long_term']:
            try:
                top_tracks = self.sp.current_user_top_tracks(
                    limit=50, 
                    time_range=time_range
                )
                for track in top_tracks['items']:
                    track_data = self._format_track_data(track, None, time_range)
                    tracks.append(track_data)
            except Exception as e:
                logger.warning(f"Could not retrieve {time_range} top tracks: {e}")
        
        # Get saved tracks
        try:
            saved_tracks = self.sp.current_user_saved_tracks(limit=50)
            for item in saved_tracks['items']:
                track_data = self._format_track_data(
                    item['track'], 
                    item['added_at'], 
                    source='saved'
                )
                tracks.append(track_data)
        except Exception as e:
            logger.warning(f"Could not retrieve saved tracks: {e}")
        
        # Remove duplicates and apply limit
        unique_tracks = self._deduplicate_tracks(tracks)
        
        if limit:
            unique_tracks = unique_tracks[:limit]
            
        return unique_tracks
    
    def get_track_features(self, track_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Get audio features for Spotify tracks.
        
        Args:
            track_ids: List of Spotify track IDs
            
        Returns:
            List of audio feature dictionaries
        """
        if not self.authenticated:
            raise ValueError("Client not authenticated")
            
        # Spotify API allows max 100 tracks per request
        features = []
        for i in range(0, len(track_ids), 100):
            batch = track_ids[i:i+100]
            try:
                batch_features = self.sp.audio_features(batch)
                features.extend([f for f in batch_features if f is not None])
            except Exception as e:
                logger.error(f"Error getting features for batch {i}: {e}")
        
        return features
    
    def get_user_playlists(self) -> List[Dict[str, Any]]:
        """
        Get user's Spotify playlists.
        
        Returns:
            List of playlist dictionaries
        """
        if not self.authenticated:
            raise ValueError("Client not authenticated")
            
        playlists = []
        results = self.sp.current_user_playlists()
        
        while results:
            for playlist in results['items']:
                playlist_data = {
                    'id': playlist['id'],
                    'name': playlist['name'],
                    'description': playlist.get('description'),
                    'track_count': playlist['tracks']['total'],
                    'public': playlist['public'],
                    'collaborative': playlist['collaborative'],
                    'owner': playlist['owner']['id'],
                    'platform': 'spotify'
                }
                playlists.append(playlist_data)
            
            results = self.sp.next(results) if results['next'] else None
        
        return playlists
    
    def _format_track_data(
        self, 
        track: Dict, 
        played_at: Optional[str] = None,
        source: str = 'recent'
    ) -> Dict[str, Any]:
        """
        Format Spotify track data into standardized format.
        
        Args:
            track: Spotify track object
            played_at: Timestamp when track was played
            source: Source of the track data
            
        Returns:
            Formatted track dictionary
        """
        return {
            'track_id': track['id'],
            'track_name': track['name'],
            'artist_id': track['artists'][0]['id'] if track['artists'] else None,
            'artist_name': track['artists'][0]['name'] if track['artists'] else None,
            'album_id': track['album']['id'],
            'album_name': track['album']['name'],
            'duration_ms': track['duration_ms'],
            'popularity': track.get('popularity'),
            'explicit': track.get('explicit'),
            'played_at': played_at,
            'source': source,
            'platform': 'spotify'
        }
    
    def _deduplicate_tracks(self, tracks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate tracks based on track_id.
        
        Args:
            tracks: List of track dictionaries
            
        Returns:
            List of unique tracks
        """
        seen_ids = set()
        unique_tracks = []
        
        for track in tracks:
            if track['track_id'] not in seen_ids:
                seen_ids.add(track['track_id'])
                unique_tracks.append(track)
        
        return unique_tracks
