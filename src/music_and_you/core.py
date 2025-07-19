"""
Core configuration and constants for the Music and You project.
"""

from pathlib import Path
from typing import Dict, List

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CONFIG_DIR = PROJECT_ROOT / "config"
MODELS_DIR = PROJECT_ROOT / "models"
REPORTS_DIR = PROJECT_ROOT / "reports"

# Data subdirectories
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
EXTERNAL_DATA_DIR = DATA_DIR / "external"

# Big Five personality traits
BIG_FIVE_TRAITS = [
    "openness",
    "conscientiousness", 
    "extraversion",
    "agreeableness",
    "neuroticism"
]

# MUSIC model dimensions
MUSIC_DIMENSIONS = [
    "mellow",
    "unpretentious", 
    "sophisticated",
    "intense",
    "contemporary"
]

# Supported music platforms
SUPPORTED_PLATFORMS = [
    "spotify",
    "youtube_music",
    "lastfm",
    "apple_music",
    "soundcloud"
]

# Feature categories
FEATURE_CATEGORIES = {
    "acoustic": [
        "danceability", "energy", "key", "loudness", "mode",
        "speechiness", "acousticness", "instrumentalness", 
        "liveness", "valence", "tempo"
    ],
    "temporal": [
        "listening_frequency", "session_length", "skip_rate",
        "repeat_rate", "time_of_day", "day_of_week"
    ],
    "behavioral": [
        "genre_diversity", "exploration_ratio", "artist_diversity",
        "track_popularity", "album_diversity"
    ],
    "lyrical": [
        "lexical_richness", "emotional_valence", "sentiment_score",
        "word_count", "language_complexity"
    ]
}

# Model configuration
MODEL_CONFIG = {
    "random_state": 42,
    "test_size": 0.2,
    "cv_folds": 5,
    "target_correlation": 0.20
}

# API rate limits (requests per minute)
API_RATE_LIMITS = {
    "spotify": 100,
    "lastfm": 5,
    "youtube": 10000,  # per day
}
