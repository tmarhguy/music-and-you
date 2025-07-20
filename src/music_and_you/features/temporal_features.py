"""
Temporal feature extraction for music listening behavior analysis.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class TemporalFeatureExtractor:
    """Extract temporal patterns from music listening data."""
    
    def __init__(self):
        """Initialize the temporal feature extractor."""
        self.features = {}
        
    def extract_listening_patterns(self, listening_data: pd.DataFrame) -> Dict[str, float]:
        """
        Extract temporal listening patterns.
        
        Args:
            listening_data: DataFrame with columns ['timestamp', 'track_id', 'duration_ms']
            
        Returns:
            Dictionary of temporal features
        """
        features = {}
        
        if listening_data.empty:
            return self._get_default_features()
            
        # Convert timestamp to datetime if not already
        if not pd.api.types.is_datetime64_any_dtype(listening_data['timestamp']):
            listening_data['timestamp'] = pd.to_datetime(listening_data['timestamp'])
            
        # Extract time components
        listening_data['hour'] = listening_data['timestamp'].dt.hour
        listening_data['day_of_week'] = listening_data['timestamp'].dt.dayofweek
        listening_data['month'] = listening_data['timestamp'].dt.month
        
        # Listening time patterns
        features.update(self._extract_time_patterns(listening_data))
        
        # Session analysis
        features.update(self._extract_session_features(listening_data))
        
        # Weekly patterns
        features.update(self._extract_weekly_patterns(listening_data))
        
        # Seasonal patterns
        features.update(self._extract_seasonal_patterns(listening_data))
        
        return features
    
    def _extract_time_patterns(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract hourly listening patterns."""
        features = {}
        
        # Hour distribution
        hour_counts = data['hour'].value_counts().reindex(range(24), fill_value=0)
        
        # Peak listening hours
        features['peak_hour'] = hour_counts.idxmax()
        features['peak_hour_ratio'] = hour_counts.max() / len(data) if len(data) > 0 else 0
        
        # Time period preferences
        morning_hours = range(6, 12)
        afternoon_hours = range(12, 18)
        evening_hours = range(18, 24)
        night_hours = list(range(0, 6))
        
        features['morning_listening_ratio'] = sum(hour_counts[h] for h in morning_hours) / len(data)
        features['afternoon_listening_ratio'] = sum(hour_counts[h] for h in afternoon_hours) / len(data)
        features['evening_listening_ratio'] = sum(hour_counts[h] for h in evening_hours) / len(data)
        features['night_listening_ratio'] = sum(hour_counts[h] for h in night_hours) / len(data)
        
        # Regularity measures
        features['hour_entropy'] = self._calculate_entropy(hour_counts.values)
        features['hour_concentration'] = self._calculate_concentration_index(hour_counts.values)
        
        return features
    
    def _extract_session_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract listening session characteristics."""
        features = {}
        
        # Define session gaps (e.g., 30 minutes)
        session_gap = timedelta(minutes=30)
        
        # Identify sessions
        data_sorted = data.sort_values('timestamp')
        time_diffs = data_sorted['timestamp'].diff()
        session_starts = time_diffs > session_gap
        session_ids = session_starts.cumsum()
        
        sessions = data_sorted.groupby(session_ids).agg({
            'timestamp': ['min', 'max', 'count'],
            'duration_ms': 'sum'
        }).reset_index(drop=True)
        
        sessions.columns = ['start_time', 'end_time', 'track_count', 'total_duration_ms']
        sessions['session_duration_minutes'] = (
            (sessions['end_time'] - sessions['start_time']).dt.total_seconds() / 60
        )
        
        if len(sessions) > 0:
            features['avg_session_length_minutes'] = sessions['session_duration_minutes'].mean()
            features['avg_tracks_per_session'] = sessions['track_count'].mean()
            features['max_session_length_minutes'] = sessions['session_duration_minutes'].max()
            features['total_sessions'] = len(sessions)
            features['session_length_std'] = sessions['session_duration_minutes'].std()
        else:
            features.update({
                'avg_session_length_minutes': 0,
                'avg_tracks_per_session': 0,
                'max_session_length_minutes': 0,
                'total_sessions': 0,
                'session_length_std': 0
            })
        
        return features
    
    def _extract_weekly_patterns(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract weekly listening patterns."""
        features = {}
        
        # Day of week distribution
        dow_counts = data['day_of_week'].value_counts().reindex(range(7), fill_value=0)
        
        # Weekend vs weekday
        weekend_counts = dow_counts[5] + dow_counts[6]  # Saturday + Sunday
        weekday_counts = dow_counts[:5].sum()
        total_counts = len(data)
        
        features['weekend_listening_ratio'] = weekend_counts / total_counts if total_counts > 0 else 0
        features['weekday_listening_ratio'] = weekday_counts / total_counts if total_counts > 0 else 0
        
        # Most active day
        features['most_active_day'] = dow_counts.idxmax()
        features['least_active_day'] = dow_counts.idxmin()
        
        # Weekly regularity
        features['weekly_entropy'] = self._calculate_entropy(dow_counts.values)
        features['weekly_concentration'] = self._calculate_concentration_index(dow_counts.values)
        
        return features
    
    def _extract_seasonal_patterns(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract seasonal listening patterns."""
        features = {}
        
        # Month distribution
        month_counts = data['month'].value_counts().reindex(range(1, 13), fill_value=0)
        
        # Seasonal groupings
        spring_months = [3, 4, 5]
        summer_months = [6, 7, 8]
        fall_months = [9, 10, 11]
        winter_months = [12, 1, 2]
        
        total_counts = len(data)
        if total_counts > 0:
            features['spring_listening_ratio'] = sum(month_counts[m] for m in spring_months) / total_counts
            features['summer_listening_ratio'] = sum(month_counts[m] for m in summer_months) / total_counts
            features['fall_listening_ratio'] = sum(month_counts[m] for m in fall_months) / total_counts
            features['winter_listening_ratio'] = sum(month_counts[m] for m in winter_months) / total_counts
        else:
            features.update({
                'spring_listening_ratio': 0,
                'summer_listening_ratio': 0,
                'fall_listening_ratio': 0,
                'winter_listening_ratio': 0
            })
        
        # Seasonal regularity
        features['seasonal_entropy'] = self._calculate_entropy(month_counts.values)
        
        return features
    
    def _calculate_entropy(self, counts: np.ndarray) -> float:
        """Calculate Shannon entropy for distribution."""
        total = np.sum(counts)
        if total == 0:
            return 0.0
            
        probabilities = counts / total
        probabilities = probabilities[probabilities > 0]  # Remove zero probabilities
        
        if len(probabilities) <= 1:
            return 0.0
            
        return -np.sum(probabilities * np.log2(probabilities))
    
    def _calculate_concentration_index(self, counts: np.ndarray) -> float:
        """Calculate Herfindahl-Hirschman Index for concentration."""
        total = np.sum(counts)
        if total == 0:
            return 0.0
            
        probabilities = counts / total
        return np.sum(probabilities ** 2)
    
    def _get_default_features(self) -> Dict[str, float]:
        """Return default features when no data is available."""
        return {
            'peak_hour': 12,
            'peak_hour_ratio': 0.0,
            'morning_listening_ratio': 0.0,
            'afternoon_listening_ratio': 0.0,
            'evening_listening_ratio': 0.0,
            'night_listening_ratio': 0.0,
            'hour_entropy': 0.0,
            'hour_concentration': 0.0,
            'avg_session_length_minutes': 0.0,
            'avg_tracks_per_session': 0.0,
            'max_session_length_minutes': 0.0,
            'total_sessions': 0.0,
            'session_length_std': 0.0,
            'weekend_listening_ratio': 0.0,
            'weekday_listening_ratio': 0.0,
            'most_active_day': 0,
            'least_active_day': 0,
            'weekly_entropy': 0.0,
            'weekly_concentration': 0.0,
            'spring_listening_ratio': 0.0,
            'summer_listening_ratio': 0.0,
            'fall_listening_ratio': 0.0,
            'winter_listening_ratio': 0.0,
            'seasonal_entropy': 0.0
        }
    
    def extract_consistency_features(self, listening_data: pd.DataFrame) -> Dict[str, float]:
        """
        Extract features related to listening consistency and habits.
        
        Args:
            listening_data: DataFrame with timestamp and listening data
            
        Returns:
            Dictionary of consistency features
        """
        features = {}
        
        if listening_data.empty:
            return {'listening_consistency': 0.0, 'habit_strength': 0.0}
        
        # Convert timestamp if needed
        if not pd.api.types.is_datetime64_any_dtype(listening_data['timestamp']):
            listening_data['timestamp'] = pd.to_datetime(listening_data['timestamp'])
        
        # Daily listening consistency
        daily_counts = listening_data.groupby(listening_data['timestamp'].dt.date).size()
        features['listening_consistency'] = 1.0 / (1.0 + daily_counts.std()) if len(daily_counts) > 1 else 1.0
        
        # Habit strength (based on regular patterns)
        listening_data['hour'] = listening_data['timestamp'].dt.hour
        hour_regularity = listening_data['hour'].value_counts().std()
        features['habit_strength'] = 1.0 / (1.0 + hour_regularity) if hour_regularity > 0 else 1.0
        
        return features
