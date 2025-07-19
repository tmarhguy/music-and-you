"""
Unit tests for the Spotify client.
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

from music_and_you.data.spotify_client import SpotifyClient


class TestSpotifyClient:
    """Test cases for Spotify API client."""
    
    @pytest.fixture
    def spotify_client(self):
        """Create a Spotify client instance for testing."""
        return SpotifyClient(
            client_id="test_client_id",
            client_secret="test_client_secret",
            redirect_uri="http://localhost:8080/callback"
        )
    
    @pytest.fixture
    def mock_spotipy(self):
        """Mock spotipy library."""
        with patch('music_and_you.data.spotify_client.spotipy') as mock:
            yield mock
    
    def test_init(self, spotify_client):
        """Test client initialization."""
        assert spotify_client.client_id == "test_client_id"
        assert spotify_client.client_secret == "test_client_secret"
        assert spotify_client.authenticated is False
        assert spotify_client.user_id is None
    
    def test_authenticate_success(self, spotify_client, mock_spotipy):
        """Test successful authentication."""
        # Mock successful authentication
        mock_sp = Mock()
        mock_sp.current_user.return_value = {'id': 'test_user_123'}
        mock_spotipy.Spotify.return_value = mock_sp
        
        result = spotify_client.authenticate()
        
        assert result is True
        assert spotify_client.authenticated is True
        assert spotify_client.user_id == 'test_user_123'
    
    def test_authenticate_failure(self, spotify_client, mock_spotipy):
        """Test authentication failure."""
        # Mock authentication failure
        mock_spotipy.Spotify.side_effect = Exception("Auth failed")
        
        result = spotify_client.authenticate()
        
        assert result is False
        assert spotify_client.authenticated is False
        assert spotify_client.user_id is None
    
    def test_get_user_profile_not_authenticated(self, spotify_client):
        """Test getting user profile when not authenticated."""
        with pytest.raises(ValueError, match="Client not authenticated"):
            spotify_client.get_user_profile()
    
    def test_get_user_profile_success(self, spotify_client, mock_spotipy):
        """Test successful user profile retrieval."""
        # Setup authenticated client
        spotify_client.authenticated = True
        mock_sp = Mock()
        mock_sp.current_user.return_value = {
            'id': 'test_user_123',
            'display_name': 'Test User',
            'followers': {'total': 100},
            'country': 'US',
            'product': 'premium'
        }
        spotify_client.sp = mock_sp
        
        profile = spotify_client.get_user_profile()
        
        assert profile['user_id'] == 'test_user_123'
        assert profile['display_name'] == 'Test User'
        assert profile['followers'] == 100
        assert profile['country'] == 'US'
        assert profile['product'] == 'premium'
        assert profile['platform'] == 'spotify'
    
    def test_get_listening_history_not_authenticated(self, spotify_client):
        """Test getting listening history when not authenticated."""
        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()
        
        with pytest.raises(ValueError, match="Client not authenticated"):
            spotify_client.get_listening_history(start_date, end_date)
    
    def test_get_track_features_not_authenticated(self, spotify_client):
        """Test getting track features when not authenticated."""
        with pytest.raises(ValueError, match="Client not authenticated"):
            spotify_client.get_track_features(['track_id_1', 'track_id_2'])
    
    def test_format_track_data(self, spotify_client):
        """Test track data formatting."""
        track_data = {
            'id': 'track_123',
            'name': 'Test Track',
            'artists': [{'id': 'artist_123', 'name': 'Test Artist'}],
            'album': {'id': 'album_123', 'name': 'Test Album'},
            'duration_ms': 180000,
            'popularity': 85,
            'explicit': False
        }
        
        formatted = spotify_client._format_track_data(
            track_data, 
            played_at='2023-01-01T12:00:00Z',
            source='recent'
        )
        
        assert formatted['track_id'] == 'track_123'
        assert formatted['track_name'] == 'Test Track'
        assert formatted['artist_id'] == 'artist_123'
        assert formatted['artist_name'] == 'Test Artist'
        assert formatted['album_id'] == 'album_123'
        assert formatted['album_name'] == 'Test Album'
        assert formatted['duration_ms'] == 180000
        assert formatted['popularity'] == 85
        assert formatted['explicit'] is False
        assert formatted['played_at'] == '2023-01-01T12:00:00Z'
        assert formatted['source'] == 'recent'
        assert formatted['platform'] == 'spotify'
    
    def test_deduplicate_tracks(self, spotify_client):
        """Test track deduplication."""
        tracks = [
            {'track_id': 'track_1', 'track_name': 'Song 1'},
            {'track_id': 'track_2', 'track_name': 'Song 2'},
            {'track_id': 'track_1', 'track_name': 'Song 1'},  # Duplicate
            {'track_id': 'track_3', 'track_name': 'Song 3'},
        ]
        
        unique_tracks = spotify_client._deduplicate_tracks(tracks)
        
        assert len(unique_tracks) == 3
        track_ids = [t['track_id'] for t in unique_tracks]
        assert track_ids == ['track_1', 'track_2', 'track_3']


@pytest.mark.integration
class TestSpotifyClientIntegration:
    """Integration tests for Spotify client (requires API credentials)."""
    
    @pytest.fixture
    def authenticated_client(self):
        """Create an authenticated Spotify client for integration tests."""
        import os
        
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            pytest.skip("Spotify credentials not provided")
        
        client = SpotifyClient(client_id, client_secret)
        
        # Note: This requires manual OAuth flow in real tests
        # For automated testing, you'd need a test account with stored tokens
        if not client.authenticate():
            pytest.skip("Could not authenticate with Spotify")
        
        return client
    
    def test_real_authentication(self, authenticated_client):
        """Test authentication with real Spotify API."""
        assert authenticated_client.authenticated is True
        assert authenticated_client.user_id is not None
    
    def test_real_user_profile(self, authenticated_client):
        """Test getting real user profile."""
        profile = authenticated_client.get_user_profile()
        
        assert 'user_id' in profile
        assert 'platform' in profile
        assert profile['platform'] == 'spotify'
    
    def test_real_listening_history(self, authenticated_client):
        """Test getting real listening history."""
        start_date = datetime.now() - timedelta(days=7)
        end_date = datetime.now()
        
        history = authenticated_client.get_listening_history(start_date, end_date)
        
        assert isinstance(history, list)
        if history:  # If user has listening history
            track = history[0]
            assert 'track_id' in track
            assert 'track_name' in track
            assert 'platform' in track
            assert track['platform'] == 'spotify'
