"""
Test configuration file.
"""

import pytest
import os
import tempfile
from pathlib import Path


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test (requires API credentials)"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )


@pytest.fixture(scope="session")
def test_data_dir():
    """Create a temporary directory for test data."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def sample_track_data():
    """Sample track data for testing."""
    return {
        'id': 'track_123',
        'name': 'Test Track',
        'artists': [{'id': 'artist_123', 'name': 'Test Artist'}],
        'album': {'id': 'album_123', 'name': 'Test Album'},
        'duration_ms': 180000,
        'popularity': 85,
        'explicit': False
    }


@pytest.fixture
def sample_audio_features():
    """Sample audio features for testing."""
    return {
        'id': 'track_123',
        'danceability': 0.735,
        'energy': 0.578,
        'key': 5,
        'loudness': -11.840,
        'mode': 0,
        'speechiness': 0.0461,
        'acousticness': 0.514,
        'instrumentalness': 0.0902,
        'liveness': 0.159,
        'valence': 0.624,
        'tempo': 98.002,
        'time_signature': 4
    }


@pytest.fixture
def sample_user_profile():
    """Sample user profile for testing."""
    return {
        'id': 'user_123',
        'display_name': 'Test User',
        'followers': {'total': 100},
        'country': 'US',
        'product': 'premium'
    }


@pytest.fixture
def mock_spotify_client():
    """Mock Spotify client for testing."""
    from unittest.mock import Mock
    
    client = Mock()
    client.authenticated = True
    client.user_id = 'test_user_123'
    
    return client


# Skip integration tests if credentials are not available
def pytest_collection_modifyitems(config, items):
    """Modify test collection to skip integration tests without credentials."""
    skip_integration = pytest.mark.skip(reason="API credentials not provided")
    
    for item in items:
        if "integration" in item.keywords:
            # Check if required environment variables are set
            required_vars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET']
            if not all(os.getenv(var) for var in required_vars):
                item.add_marker(skip_integration)
