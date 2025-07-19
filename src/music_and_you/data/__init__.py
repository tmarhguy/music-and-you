"""
Data ingestion modules for multiple music platforms.
"""

from .spotify_client import SpotifyClient
from .base_client import BaseMusicClient

# TODO: Implement additional clients
# from .lastfm_client import LastFMClient
# from .youtube_music_client import YouTubeMusicClient

__all__ = [
    "SpotifyClient",
    "BaseMusicClient",
    # "LastFMClient", 
    # "YouTubeMusicClient",
]
