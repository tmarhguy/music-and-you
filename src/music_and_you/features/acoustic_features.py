"""
Acoustic feature extraction from music tracks.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
import logging

from music_and_you.core import FEATURE_CATEGORIES

logger = logging.getLogger(__name__)


class AcousticFeatureExtractor:
    """
    Extract acoustic features from music track data.
    
    This class processes audio features provided by music platforms
    (primarily Spotify's audio features) and computes aggregate
    statistics for personality prediction.
    """
    
    def __init__(self):
        """Initialize the acoustic feature extractor."""
        self.feature_names = FEATURE_CATEGORIES["acoustic"]
        
    def extract_features(
        self, 
        tracks_data: List[Dict[str, Any]],
        audio_features: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Extract acoustic features from track and audio feature data.
        
        Args:
            tracks_data: List of track information dictionaries
            audio_features: List of audio feature dictionaries from platform APIs
            
        Returns:
            Dictionary of extracted acoustic features
        """
        if not audio_features:
            logger.warning("No audio features provided")
            return self._get_default_features()
        
        # Convert to DataFrame for easier processing
        features_df = pd.DataFrame(audio_features)
        
        # Remove null values
        features_df = features_df.dropna()
        
        if features_df.empty:
            logger.warning("All audio features were null")
            return self._get_default_features()
        
        acoustic_features = {}
        
        # Basic statistics for each acoustic dimension
        for feature in self.feature_names:
            if feature in features_df.columns:
                values = features_df[feature].astype(float)
                
                # Basic statistics
                acoustic_features[f"{feature}_mean"] = float(values.mean())
                acoustic_features[f"{feature}_std"] = float(values.std())
                acoustic_features[f"{feature}_median"] = float(values.median())
                acoustic_features[f"{feature}_min"] = float(values.min())
                acoustic_features[f"{feature}_max"] = float(values.max())
                
                # Percentiles
                acoustic_features[f"{feature}_q25"] = float(values.quantile(0.25))
                acoustic_features[f"{feature}_q75"] = float(values.quantile(0.75))
                
                # Coefficient of variation (std/mean)
                if values.mean() != 0:
                    acoustic_features[f"{feature}_cv"] = float(values.std() / values.mean())
                else:
                    acoustic_features[f"{feature}_cv"] = 0.0
        
        # Composite features
        acoustic_features.update(self._compute_composite_features(features_df))
        
        # Energy-valence relationship (important for personality research)
        acoustic_features.update(self._compute_energy_valence_features(features_df))
        
        # Musical sophistication indicators
        acoustic_features.update(self._compute_sophistication_features(features_df))
        
        return acoustic_features
    
    def _compute_composite_features(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute composite acoustic features.
        
        Args:
            features_df: DataFrame of audio features
            
        Returns:
            Dictionary of composite features
        """
        composite = {}
        
        # Arousal proxy (energy + tempo + loudness)
        if all(col in features_df.columns for col in ['energy', 'tempo', 'loudness']):
            # Normalize tempo to 0-1 range (assuming 60-200 BPM range)
            tempo_norm = (features_df['tempo'] - 60) / 140
            tempo_norm = tempo_norm.clip(0, 1)
            
            # Normalize loudness to 0-1 range (assuming -60 to 0 dB range)
            loudness_norm = (features_df['loudness'] + 60) / 60
            loudness_norm = loudness_norm.clip(0, 1)
            
            arousal = (features_df['energy'] + tempo_norm + loudness_norm) / 3
            composite['arousal_mean'] = float(arousal.mean())
            composite['arousal_std'] = float(arousal.std())
        
        # Musical complexity proxy
        if all(col in features_df.columns for col in ['acousticness', 'instrumentalness']):
            complexity = (1 - features_df['acousticness']) * features_df['instrumentalness']
            composite['complexity_mean'] = float(complexity.mean())
            composite['complexity_std'] = float(complexity.std())
        
        # Danceability-energy correlation
        if all(col in features_df.columns for col in ['danceability', 'energy']):
            correlation = features_df['danceability'].corr(features_df['energy'])
            composite['danceability_energy_corr'] = float(correlation) if not pd.isna(correlation) else 0.0
        
        # Valence-energy relationship (circumplex model)
        if all(col in features_df.columns for col in ['valence', 'energy']):
            # High valence + high energy = excited/happy
            excited = (features_df['valence'] + features_df['energy']) / 2
            composite['excited_mean'] = float(excited.mean())
            
            # High valence + low energy = calm/peaceful  
            calm = features_df['valence'] * (1 - features_df['energy'])
            composite['calm_mean'] = float(calm.mean())
            
            # Low valence + high energy = angry/tense
            tense = (1 - features_df['valence']) * features_df['energy']
            composite['tense_mean'] = float(tense.mean())
            
            # Low valence + low energy = sad/depressed
            sad = (1 - features_df['valence']) * (1 - features_df['energy'])
            composite['sad_mean'] = float(sad.mean())
        
        return composite
    
    def _compute_energy_valence_features(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute energy-valence relationship features (key for personality research).
        
        Args:
            features_df: DataFrame of audio features
            
        Returns:
            Dictionary of energy-valence features
        """
        if not all(col in features_df.columns for col in ['energy', 'valence']):
            return {}
        
        ev_features = {}
        
        # Energy-valence correlation
        correlation = features_df['energy'].corr(features_df['valence'])
        ev_features['energy_valence_corr'] = float(correlation) if not pd.isna(correlation) else 0.0
        
        # Quadrant analysis (based on Russell's circumplex model)
        high_energy = features_df['energy'] > features_df['energy'].median()
        high_valence = features_df['valence'] > features_df['valence'].median()
        
        # Proportion of tracks in each quadrant
        ev_features['high_energy_high_valence_prop'] = float((high_energy & high_valence).mean())
        ev_features['high_energy_low_valence_prop'] = float((high_energy & ~high_valence).mean())
        ev_features['low_energy_high_valence_prop'] = float((~high_energy & high_valence).mean())
        ev_features['low_energy_low_valence_prop'] = float((~high_energy & ~high_valence).mean())
        
        # Energy-valence scatter (measure of emotional range)
        energy_range = features_df['energy'].max() - features_df['energy'].min()
        valence_range = features_df['valence'].max() - features_df['valence'].min()
        ev_features['emotional_range'] = float(energy_range * valence_range)
        
        return ev_features
    
    def _compute_sophistication_features(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """
        Compute musical sophistication indicators.
        
        Args:
            features_df: DataFrame of audio features
            
        Returns:
            Dictionary of sophistication features
        """
        soph_features = {}
        
        # Acoustic vs electronic preference
        if 'acousticness' in features_df.columns:
            soph_features['acoustic_preference'] = float(features_df['acousticness'].mean())
            
        # Instrumental vs vocal preference
        if 'instrumentalness' in features_df.columns:
            soph_features['instrumental_preference'] = float(features_df['instrumentalness'].mean())
            
        # Speech content (podcasts, spoken word)
        if 'speechiness' in features_df.columns:
            soph_features['speech_content'] = float(features_df['speechiness'].mean())
            
        # Live performance preference
        if 'liveness' in features_df.columns:
            soph_features['live_preference'] = float(features_df['liveness'].mean())
            
        # Musical key diversity (if available)
        if 'key' in features_df.columns:
            key_counts = features_df['key'].value_counts()
            # Shannon entropy of key distribution
            if len(key_counts) > 1:
                key_probs = key_counts / len(features_df)
                key_entropy = -sum(p * np.log2(p) for p in key_probs if p > 0)
                soph_features['key_diversity'] = float(key_entropy)
            else:
                soph_features['key_diversity'] = 0.0
                
        # Mode preference (major vs minor)
        if 'mode' in features_df.columns:
            soph_features['major_mode_preference'] = float(features_df['mode'].mean())
        
        return soph_features
    
    def _get_default_features(self) -> Dict[str, float]:
        """
        Get default feature values when no data is available.
        
        Returns:
            Dictionary of default acoustic features
        """
        default_features = {}
        
        # Set all statistics to 0 for each acoustic feature
        for feature in self.feature_names:
            for stat in ['mean', 'std', 'median', 'min', 'max', 'q25', 'q75', 'cv']:
                default_features[f"{feature}_{stat}"] = 0.0
        
        # Set composite features to 0
        composite_features = [
            'arousal_mean', 'arousal_std', 'complexity_mean', 'complexity_std',
            'danceability_energy_corr', 'excited_mean', 'calm_mean', 'tense_mean', 'sad_mean',
            'energy_valence_corr', 'high_energy_high_valence_prop', 'high_energy_low_valence_prop',
            'low_energy_high_valence_prop', 'low_energy_low_valence_prop', 'emotional_range',
            'acoustic_preference', 'instrumental_preference', 'speech_content', 'live_preference',
            'key_diversity', 'major_mode_preference'
        ]
        
        for feature in composite_features:
            default_features[feature] = 0.0
        
        return default_features
