"""
Temporal and behavioral feature extraction from music listening patterns.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import Counter
import logging

logger = logging.getLogger(__name__)


class BehavioralFeatureExtractor:
    """
    Extract behavioral features from music listening patterns.
    
    This class analyzes listening behaviors such as genre diversity,
    exploration patterns, and temporal listening habits.
    """
    
    def __init__(self):
        """Initialize the behavioral feature extractor."""
        pass
        
    def extract_features(
        self,
        tracks_data: List[Dict[str, Any]],
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """
        Extract behavioral features from listening data.
        
        Args:
            tracks_data: List of track listening records
            user_profile: Optional user profile information
            
        Returns:
            Dictionary of behavioral features
        """
        if not tracks_data:
            logger.warning("No tracks data provided")
            return self._get_default_features()
        
        features = {}
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(tracks_data)
        
        # Genre and artist diversity
        features.update(self._compute_diversity_features(df))
        
        # Exploration vs exploitation patterns
        features.update(self._compute_exploration_features(df))
        
        # Popularity and mainstream preferences  
        features.update(self._compute_popularity_features(df))
        
        # Listening frequency patterns
        features.update(self._compute_frequency_features(df))
        
        # Session-based features
        features.update(self._compute_session_features(df))
        
        return features
    
    def _compute_diversity_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute genre and artist diversity metrics.
        
        Args:
            df: DataFrame of listening data
            
        Returns:
            Dictionary of diversity features
        """
        diversity_features = {}
        
        # Artist diversity
        if 'artist_name' in df.columns:
            unique_artists = df['artist_name'].nunique()
            total_tracks = len(df)
            
            diversity_features['artist_diversity_ratio'] = float(unique_artists / total_tracks) if total_tracks > 0 else 0.0
            diversity_features['unique_artists_count'] = float(unique_artists)
            
            # Artist concentration (Gini coefficient)
            artist_counts = df['artist_name'].value_counts()
            if len(artist_counts) > 1:
                diversity_features['artist_concentration_gini'] = self._compute_gini_coefficient(artist_counts.values)
            else:
                diversity_features['artist_concentration_gini'] = 1.0
        
        # Album diversity
        if 'album_name' in df.columns:
            unique_albums = df['album_name'].nunique()
            total_tracks = len(df)
            
            diversity_features['album_diversity_ratio'] = float(unique_albums / total_tracks) if total_tracks > 0 else 0.0
            diversity_features['unique_albums_count'] = float(unique_albums)
        
        # Track repetition patterns
        if 'track_name' in df.columns:
            track_counts = df['track_name'].value_counts()
            max_repeats = track_counts.max() if len(track_counts) > 0 else 0
            
            diversity_features['max_track_repeats'] = float(max_repeats)
            diversity_features['avg_track_repeats'] = float(track_counts.mean()) if len(track_counts) > 0 else 0.0
            
            # Proportion of unique tracks (played only once)
            unique_tracks_prop = (track_counts == 1).mean() if len(track_counts) > 0 else 0.0
            diversity_features['unique_tracks_proportion'] = float(unique_tracks_prop)
        
        return diversity_features
    
    def _compute_exploration_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute exploration vs exploitation patterns.
        
        Args:
            df: DataFrame of listening data
            
        Returns:
            Dictionary of exploration features
        """
        exploration_features = {}
        
        # Sort by timestamp if available
        if 'played_at' in df.columns:
            df = df.sort_values('played_at')
            
            # Exploration ratio (new vs repeated content)
            seen_tracks = set()
            new_track_indicators = []
            
            for track in df['track_name'] if 'track_name' in df.columns else df['track_id']:
                if track not in seen_tracks:
                    new_track_indicators.append(1)
                    seen_tracks.add(track)
                else:
                    new_track_indicators.append(0)
            
            exploration_features['exploration_ratio'] = float(np.mean(new_track_indicators))
            
            # Moving average of exploration (windowed analysis)
            window_size = min(20, len(new_track_indicators))
            if window_size > 1:
                moving_exploration = pd.Series(new_track_indicators).rolling(window_size).mean()
                exploration_features['exploration_trend'] = float(
                    moving_exploration.iloc[-1] - moving_exploration.iloc[window_size-1]
                ) if len(moving_exploration) >= window_size else 0.0
            else:
                exploration_features['exploration_trend'] = 0.0
        
        # Source diversity (if available)
        if 'source' in df.columns:
            source_counts = df['source'].value_counts()
            if len(source_counts) > 1:
                source_entropy = self._compute_shannon_entropy(source_counts.values)
                exploration_features['source_diversity'] = float(source_entropy)
            else:
                exploration_features['source_diversity'] = 0.0
        
        return exploration_features
    
    def _compute_popularity_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute features related to mainstream vs niche preferences.
        
        Args:
            df: DataFrame of listening data
            
        Returns:
            Dictionary of popularity features
        """
        popularity_features = {}
        
        if 'popularity' in df.columns:
            # Basic popularity statistics
            popularity_values = df['popularity'].dropna()
            
            if len(popularity_values) > 0:
                popularity_features['popularity_mean'] = float(popularity_values.mean())
                popularity_features['popularity_std'] = float(popularity_values.std())
                popularity_features['popularity_median'] = float(popularity_values.median())
                
                # Mainstream vs niche preference
                # High popularity (>70) = mainstream, low popularity (<30) = niche
                mainstream_prop = (popularity_values > 70).mean()
                niche_prop = (popularity_values < 30).mean()
                
                popularity_features['mainstream_preference'] = float(mainstream_prop)
                popularity_features['niche_preference'] = float(niche_prop)
                
                # Popularity consistency
                popularity_features['popularity_consistency'] = float(1 - (popularity_values.std() / 100))
            else:
                # Default values when no popularity data
                for key in ['popularity_mean', 'popularity_std', 'popularity_median', 
                           'mainstream_preference', 'niche_preference', 'popularity_consistency']:
                    popularity_features[key] = 0.0
        
        return popularity_features
    
    def _compute_frequency_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute listening frequency and temporal patterns.
        
        Args:
            df: DataFrame of listening data
            
        Returns:
            Dictionary of frequency features
        """
        frequency_features = {}
        
        if 'played_at' in df.columns:
            # Convert to datetime if string
            df['played_at'] = pd.to_datetime(df['played_at'], errors='coerce')
            df = df.dropna(subset=['played_at'])
            
            if len(df) > 0:
                # Time span of listening data
                time_span = (df['played_at'].max() - df['played_at'].min()).days
                if time_span > 0:
                    frequency_features['tracks_per_day'] = float(len(df) / time_span)
                else:
                    frequency_features['tracks_per_day'] = 0.0
                
                # Time of day patterns
                df['hour'] = df['played_at'].dt.hour
                
                # Listening patterns by time of day
                morning_hours = df['hour'].between(6, 11).sum()  # 6 AM - 11 AM
                afternoon_hours = df['hour'].between(12, 17).sum()  # 12 PM - 5 PM  
                evening_hours = df['hour'].between(18, 22).sum()  # 6 PM - 10 PM
                night_hours = (df['hour'].between(23, 23) | df['hour'].between(0, 5)).sum()  # 11 PM - 5 AM
                
                total_listens = len(df)
                frequency_features['morning_listening_prop'] = float(morning_hours / total_listens)
                frequency_features['afternoon_listening_prop'] = float(afternoon_hours / total_listens)
                frequency_features['evening_listening_prop'] = float(evening_hours / total_listens)
                frequency_features['night_listening_prop'] = float(night_hours / total_listens)
                
                # Day of week patterns
                df['dayofweek'] = df['played_at'].dt.dayofweek
                weekday_listens = df['dayofweek'].between(0, 4).sum()  # Monday-Friday
                weekend_listens = df['dayofweek'].between(5, 6).sum()  # Saturday-Sunday
                
                frequency_features['weekday_listening_prop'] = float(weekday_listens / total_listens)
                frequency_features['weekend_listening_prop'] = float(weekend_listens / total_listens)
                
                # Listening consistency (coefficient of variation of daily listens)
                daily_counts = df.groupby(df['played_at'].dt.date).size()
                if len(daily_counts) > 1 and daily_counts.mean() > 0:
                    frequency_features['listening_consistency'] = float(1 - (daily_counts.std() / daily_counts.mean()))
                else:
                    frequency_features['listening_consistency'] = 1.0
        
        return frequency_features
    
    def _compute_session_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute session-based listening features.
        
        Args:
            df: DataFrame of listening data
            
        Returns:
            Dictionary of session features
        """
        session_features = {}
        
        if 'played_at' in df.columns and 'duration_ms' in df.columns:
            df['played_at'] = pd.to_datetime(df['played_at'], errors='coerce')
            df = df.dropna(subset=['played_at'])
            df = df.sort_values('played_at')
            
            if len(df) > 1:
                # Define session breaks (>30 minutes between tracks)
                time_diffs = df['played_at'].diff().dt.total_seconds() / 60  # minutes
                session_breaks = time_diffs > 30
                session_ids = session_breaks.cumsum()
                
                # Session statistics
                session_lengths = df.groupby(session_ids).size()
                session_durations = df.groupby(session_ids)['duration_ms'].sum() / 60000  # minutes
                
                session_features['avg_session_length_tracks'] = float(session_lengths.mean())
                session_features['avg_session_duration_minutes'] = float(session_durations.mean())
                session_features['max_session_length_tracks'] = float(session_lengths.max())
                session_features['total_sessions'] = float(len(session_lengths))
                
                # Session consistency
                if len(session_lengths) > 1:
                    session_features['session_length_consistency'] = float(
                        1 - (session_lengths.std() / session_lengths.mean())
                    )
                else:
                    session_features['session_length_consistency'] = 1.0
        
        return session_features
    
    def _compute_gini_coefficient(self, values: np.ndarray) -> float:
        """
        Compute Gini coefficient for concentration measurement.
        
        Args:
            values: Array of values (e.g., play counts)
            
        Returns:
            Gini coefficient (0 = perfect equality, 1 = perfect inequality)
        """
        if len(values) == 0:
            return 0.0
            
        # Sort values
        sorted_values = np.sort(values)
        n = len(sorted_values)
        
        # Compute Gini coefficient
        index = np.arange(1, n + 1)
        gini = (2 * np.sum(index * sorted_values)) / (n * np.sum(sorted_values)) - (n + 1) / n
        
        return float(gini)
    
    def _compute_shannon_entropy(self, values: np.ndarray) -> float:
        """
        Compute Shannon entropy for diversity measurement.
        
        Args:
            values: Array of counts
            
        Returns:
            Shannon entropy
        """
        if len(values) == 0:
            return 0.0
            
        # Convert to probabilities
        probabilities = values / np.sum(values)
        
        # Compute entropy
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        
        return float(entropy)
    
    def _get_default_features(self) -> Dict[str, float]:
        """
        Get default feature values when no data is available.
        
        Returns:
            Dictionary of default behavioral features
        """
        default_features = {
            # Diversity features
            'artist_diversity_ratio': 0.0,
            'unique_artists_count': 0.0,
            'artist_concentration_gini': 0.0,
            'album_diversity_ratio': 0.0,
            'unique_albums_count': 0.0,
            'max_track_repeats': 0.0,
            'avg_track_repeats': 0.0,
            'unique_tracks_proportion': 0.0,
            
            # Exploration features
            'exploration_ratio': 0.0,
            'exploration_trend': 0.0,
            'source_diversity': 0.0,
            
            # Popularity features
            'popularity_mean': 0.0,
            'popularity_std': 0.0,
            'popularity_median': 0.0,
            'mainstream_preference': 0.0,
            'niche_preference': 0.0,
            'popularity_consistency': 0.0,
            
            # Frequency features
            'tracks_per_day': 0.0,
            'morning_listening_prop': 0.0,
            'afternoon_listening_prop': 0.0,
            'evening_listening_prop': 0.0,
            'night_listening_prop': 0.0,
            'weekday_listening_prop': 0.0,
            'weekend_listening_prop': 0.0,
            'listening_consistency': 0.0,
            
            # Session features
            'avg_session_length_tracks': 0.0,
            'avg_session_duration_minutes': 0.0,
            'max_session_length_tracks': 0.0,
            'total_sessions': 0.0,
            'session_length_consistency': 0.0,
        }
        
        return default_features
