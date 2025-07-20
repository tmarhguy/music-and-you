"""
Comprehensive feature pipeline for music personality analysis.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from concurrent.futures import ThreadPoolExecutor
import time

from .acoustic_features import AcousticFeatureExtractor
from .temporal_features import TemporalFeatureExtractor
from .behavioral_features import BehavioralFeatureExtractor
from .lyrical_features import LyricalFeatureExtractor

logger = logging.getLogger(__name__)


class FeaturePipeline:
    """Comprehensive feature extraction pipeline."""
    
    def __init__(self, enable_parallel: bool = True, max_workers: int = 4):
        """
        Initialize the feature pipeline.
        
        Args:
            enable_parallel: Whether to enable parallel processing
            max_workers: Maximum number of worker threads
        """
        self.enable_parallel = enable_parallel
        self.max_workers = max_workers
        
        # Initialize extractors
        self.acoustic_extractor = AcousticFeatureExtractor()
        self.temporal_extractor = TemporalFeatureExtractor()
        self.behavioral_extractor = BehavioralFeatureExtractor()
        self.lyrical_extractor = LyricalFeatureExtractor()
        
        self.feature_cache = {}
        
    def extract_all_features(
        self,
        listening_data: pd.DataFrame,
        audio_features: Optional[pd.DataFrame] = None,
        lyrics_data: Optional[pd.DataFrame] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Extract comprehensive features from all available data sources.
        
        Args:
            listening_data: DataFrame with listening history
            audio_features: DataFrame with acoustic features
            lyrics_data: DataFrame with lyrics
            user_id: User identifier for caching
            
        Returns:
            Dictionary of all extracted features
        """
        start_time = time.time()
        
        # Check cache
        cache_key = self._generate_cache_key(listening_data, audio_features, lyrics_data, user_id)
        if cache_key in self.feature_cache:
            logger.info(f"Using cached features for user {user_id}")
            return self.feature_cache[cache_key]
        
        features = {}
        
        if self.enable_parallel:
            features = self._extract_features_parallel(
                listening_data, audio_features, lyrics_data
            )
        else:
            features = self._extract_features_sequential(
                listening_data, audio_features, lyrics_data
            )
        
        # Add metadata
        features['extraction_time_seconds'] = time.time() - start_time
        features['total_tracks'] = len(listening_data) if not listening_data.empty else 0
        features['has_audio_features'] = audio_features is not None and not audio_features.empty
        features['has_lyrics'] = lyrics_data is not None and not lyrics_data.empty
        
        # Cache results
        if cache_key:
            self.feature_cache[cache_key] = features
        
        logger.info(f"Extracted {len(features)} features in {features['extraction_time_seconds']:.2f}s")
        return features
    
    def _extract_features_parallel(
        self,
        listening_data: pd.DataFrame,
        audio_features: Optional[pd.DataFrame],
        lyrics_data: Optional[pd.DataFrame]
    ) -> Dict[str, float]:
        """Extract features using parallel processing."""
        features = {}
        
        # Define extraction tasks
        tasks = [
            ('temporal', self.temporal_extractor.extract_listening_patterns, listening_data),
            ('behavioral', self.behavioral_extractor.extract_behavioral_features, listening_data),
        ]
        
        if audio_features is not None and not audio_features.empty:
            tasks.append(('acoustic', self.acoustic_extractor.extract_audio_features, audio_features))
        
        if lyrics_data is not None and not lyrics_data.empty:
            tasks.append(('lyrical', self.lyrical_extractor.extract_lyrical_features, lyrics_data))
        
        # Execute tasks in parallel
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_task = {
                executor.submit(task_func, task_data): task_name
                for task_name, task_func, task_data in tasks
            }
            
            for future in future_to_task:
                task_name = future_to_task[future]
                try:
                    task_features = future.result(timeout=60)  # 60 second timeout
                    features.update(self._prefix_features(task_features, task_name))
                except Exception as e:
                    logger.error(f"Error extracting {task_name} features: {e}")
                    features.update(self._get_default_features(task_name))
        
        return features
    
    def _extract_features_sequential(
        self,
        listening_data: pd.DataFrame,
        audio_features: Optional[pd.DataFrame],
        lyrics_data: Optional[pd.DataFrame]
    ) -> Dict[str, float]:
        """Extract features sequentially."""
        features = {}
        
        # Temporal features
        try:
            temporal_features = self.temporal_extractor.extract_listening_patterns(listening_data)
            features.update(self._prefix_features(temporal_features, 'temporal'))
        except Exception as e:
            logger.error(f"Error extracting temporal features: {e}")
            features.update(self._get_default_features('temporal'))
        
        # Behavioral features
        try:
            behavioral_features = self.behavioral_extractor.extract_behavioral_features(listening_data)
            features.update(self._prefix_features(behavioral_features, 'behavioral'))
        except Exception as e:
            logger.error(f"Error extracting behavioral features: {e}")
            features.update(self._get_default_features('behavioral'))
        
        # Acoustic features
        if audio_features is not None and not audio_features.empty:
            try:
                acoustic_features = self.acoustic_extractor.extract_audio_features(audio_features)
                features.update(self._prefix_features(acoustic_features, 'acoustic'))
            except Exception as e:
                logger.error(f"Error extracting acoustic features: {e}")
                features.update(self._get_default_features('acoustic'))
        
        # Lyrical features
        if lyrics_data is not None and not lyrics_data.empty:
            try:
                lyrical_features = self.lyrical_extractor.extract_lyrical_features(lyrics_data)
                features.update(self._prefix_features(lyrical_features, 'lyrical'))
            except Exception as e:
                logger.error(f"Error extracting lyrical features: {e}")
                features.update(self._get_default_features('lyrical'))
        
        return features
    
    def _prefix_features(self, features: Dict[str, float], prefix: str) -> Dict[str, float]:
        """Add prefix to feature names."""
        return {f"{prefix}_{key}": value for key, value in features.items()}
    
    def _get_default_features(self, feature_type: str) -> Dict[str, float]:
        """Get default features for a specific type."""
        defaults = {
            'temporal': {
                'peak_hour': 12,
                'peak_hour_ratio': 0.0,
                'morning_listening_ratio': 0.0,
                'afternoon_listening_ratio': 0.0,
                'evening_listening_ratio': 0.0,
                'night_listening_ratio': 0.0
            },
            'behavioral': {
                'avg_session_length': 0.0,
                'listening_diversity': 0.0,
                'repeat_tendency': 0.0,
                'discovery_rate': 0.0
            },
            'acoustic': {
                'avg_energy': 0.5,
                'avg_valence': 0.5,
                'avg_danceability': 0.5,
                'avg_tempo': 120.0
            },
            'lyrical': {
                'emotional_intensity': 0.0,
                'vocabulary_richness': 0.0,
                'sentiment_polarity': 0.0
            }
        }
        
        default_features = defaults.get(feature_type, {})
        return self._prefix_features(default_features, feature_type)
    
    def _generate_cache_key(
        self,
        listening_data: pd.DataFrame,
        audio_features: Optional[pd.DataFrame],
        lyrics_data: Optional[pd.DataFrame],
        user_id: Optional[str]
    ) -> Optional[str]:
        """Generate a cache key for the feature extraction."""
        if user_id is None:
            return None
        
        # Create a hash of the data shapes and user_id
        listening_shape = listening_data.shape if not listening_data.empty else (0, 0)
        audio_shape = audio_features.shape if audio_features is not None and not audio_features.empty else (0, 0)
        lyrics_shape = lyrics_data.shape if lyrics_data is not None and not lyrics_data.empty else (0, 0)
        
        cache_key = f"{user_id}_{listening_shape}_{audio_shape}_{lyrics_shape}"
        return cache_key
    
    def extract_track_features(
        self,
        track_data: Dict[str, Any],
        include_audio: bool = True,
        include_lyrics: bool = True
    ) -> Dict[str, float]:
        """
        Extract features for a single track.
        
        Args:
            track_data: Dictionary containing track information
            include_audio: Whether to extract audio features
            include_lyrics: Whether to extract lyrical features
            
        Returns:
            Dictionary of track features
        """
        features = {}
        
        # Basic track features
        features['track_duration_ms'] = track_data.get('duration_ms', 0)
        features['track_popularity'] = track_data.get('popularity', 0)
        features['track_explicit'] = float(track_data.get('explicit', False))
        
        # Audio features
        if include_audio and 'audio_features' in track_data:
            audio_data = track_data['audio_features']
            if audio_data:
                features.update({
                    'energy': audio_data.get('energy', 0.5),
                    'valence': audio_data.get('valence', 0.5),
                    'danceability': audio_data.get('danceability', 0.5),
                    'acousticness': audio_data.get('acousticness', 0.5),
                    'instrumentalness': audio_data.get('instrumentalness', 0.5),
                    'liveness': audio_data.get('liveness', 0.5),
                    'speechiness': audio_data.get('speechiness', 0.5),
                    'tempo': audio_data.get('tempo', 120.0),
                    'loudness': audio_data.get('loudness', -10.0),
                    'mode': audio_data.get('mode', 1),
                    'key': audio_data.get('key', 5),
                    'time_signature': audio_data.get('time_signature', 4)
                })
        
        # Lyrical features
        if include_lyrics and 'lyrics' in track_data:
            lyrics = track_data['lyrics']
            if lyrics:
                lyrical_features = self.lyrical_extractor.extract_track_lyrical_features(lyrics)
                features.update(lyrical_features)
        
        return features
    
    def batch_extract_track_features(
        self,
        tracks_data: List[Dict[str, Any]],
        include_audio: bool = True,
        include_lyrics: bool = True
    ) -> List[Dict[str, float]]:
        """
        Extract features for multiple tracks in batch.
        
        Args:
            tracks_data: List of track data dictionaries
            include_audio: Whether to extract audio features
            include_lyrics: Whether to extract lyrical features
            
        Returns:
            List of feature dictionaries
        """
        if self.enable_parallel:
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                features_list = list(executor.map(
                    lambda track: self.extract_track_features(track, include_audio, include_lyrics),
                    tracks_data
                ))
        else:
            features_list = [
                self.extract_track_features(track, include_audio, include_lyrics)
                for track in tracks_data
            ]
        
        return features_list
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance rankings based on personality prediction performance.
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        # This would typically be learned from model training
        # For now, return static importance scores
        return {
            'temporal_listening_consistency': 0.85,
            'behavioral_diversity': 0.82,
            'acoustic_valence_std': 0.78,
            'temporal_evening_listening_ratio': 0.75,
            'behavioral_repeat_tendency': 0.72,
            'acoustic_energy_mean': 0.70,
            'lyrical_emotional_intensity': 0.68,
            'temporal_weekend_listening_ratio': 0.65,
            'acoustic_danceability_mean': 0.62,
            'behavioral_discovery_rate': 0.60
        }
    
    def clear_cache(self):
        """Clear the feature cache."""
        self.feature_cache.clear()
        logger.info("Feature cache cleared")
    
    def get_cache_stats(self) -> Dict[str, int]:
        """Get cache statistics."""
        return {
            'cache_size': len(self.feature_cache),
            'total_cached_users': len(set(
                key.split('_')[0] for key in self.feature_cache.keys()
            ))
        }
