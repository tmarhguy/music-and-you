"""
Base class for music platform clients.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BaseMusicClient(ABC):
    """
    Abstract base class for music platform API clients.
    
    This class defines the common interface that all music platform
    clients must implement for the Music and You project.
    """
    
    def __init__(self, client_id: str, client_secret: str, **kwargs):
        """
        Initialize the base music client.
        
        Args:
            client_id: API client ID
            client_secret: API client secret
            **kwargs: Additional platform-specific configuration
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.authenticated = False
        self.user_id = None
        
    @abstractmethod
    def authenticate(self, **kwargs) -> bool:
        """
        Authenticate with the music platform API.
        
        Returns:
            bool: True if authentication successful, False otherwise
        """
        pass
    
    @abstractmethod
    def get_user_profile(self) -> Dict[str, Any]:
        """
        Get basic user profile information.
        
        Returns:
            Dict containing user profile data
        """
        pass
    
    @abstractmethod
    def get_listening_history(
        self, 
        start_date: datetime, 
        end_date: datetime,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get user's listening history for a date range.
        
        Args:
            start_date: Start date for history retrieval
            end_date: End date for history retrieval  
            limit: Maximum number of tracks to retrieve
            
        Returns:
            List of track listening records
        """
        pass
    
    @abstractmethod
    def get_track_features(self, track_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Get audio features for a list of tracks.
        
        Args:
            track_ids: List of platform-specific track IDs
            
        Returns:
            List of track feature dictionaries
        """
        pass
    
    @abstractmethod
    def get_user_playlists(self) -> List[Dict[str, Any]]:
        """
        Get user's playlists.
        
        Returns:
            List of playlist dictionaries
        """
        pass
    
    def get_recent_tracks(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user's most recent tracks (last 30 days by default).
        
        Args:
            limit: Maximum number of recent tracks to retrieve
            
        Returns:
            List of recent track records
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        return self.get_listening_history(start_date, end_date, limit)
    
    def health_check(self) -> bool:
        """
        Check if the client can successfully connect to the API.
        
        Returns:
            bool: True if API is accessible, False otherwise
        """
        try:
            profile = self.get_user_profile()
            return profile is not None
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
