"""
Lyrical feature extraction for sentiment and content analysis.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
import re
from collections import Counter

logger = logging.getLogger(__name__)


class LyricalFeatureExtractor:
    """Extract features from song lyrics for personality analysis."""
    
    def __init__(self):
        """Initialize the lyrical feature extractor."""
        self.emotion_keywords = self._load_emotion_keywords()
        self.theme_keywords = self._load_theme_keywords()
        
    def extract_lyrical_features(self, lyrics_data: pd.DataFrame) -> Dict[str, float]:
        """
        Extract features from song lyrics.
        
        Args:
            lyrics_data: DataFrame with columns ['track_id', 'lyrics', 'language']
            
        Returns:
            Dictionary of lyrical features
        """
        features = {}
        
        if lyrics_data.empty or 'lyrics' not in lyrics_data.columns:
            return self._get_default_features()
        
        # Clean and preprocess lyrics
        lyrics_data = lyrics_data.dropna(subset=['lyrics'])
        all_lyrics = ' '.join(lyrics_data['lyrics'].astype(str))
        
        if not all_lyrics.strip():
            return self._get_default_features()
        
        # Basic text statistics
        features.update(self._extract_text_statistics(all_lyrics))
        
        # Emotional content
        features.update(self._extract_emotional_features(all_lyrics))
        
        # Thematic content
        features.update(self._extract_thematic_features(all_lyrics))
        
        # Linguistic complexity
        features.update(self._extract_complexity_features(all_lyrics))
        
        # Sentiment analysis
        features.update(self._extract_sentiment_features(all_lyrics))
        
        return features
    
    def _extract_text_statistics(self, lyrics: str) -> Dict[str, float]:
        """Extract basic text statistics."""
        features = {}
        
        # Word and character counts
        words = lyrics.split()
        features['total_words'] = len(words)
        features['total_characters'] = len(lyrics)
        features['avg_word_length'] = np.mean([len(word) for word in words]) if words else 0
        
        # Sentences and lines
        sentences = re.split(r'[.!?]+', lyrics)
        sentences = [s.strip() for s in sentences if s.strip()]
        features['total_sentences'] = len(sentences)
        features['avg_sentence_length'] = len(words) / len(sentences) if sentences else 0
        
        # Vocabulary richness
        unique_words = set(word.lower() for word in words if word.isalpha())
        features['vocabulary_richness'] = len(unique_words) / len(words) if words else 0
        features['unique_words'] = len(unique_words)
        
        return features
    
    def _extract_emotional_features(self, lyrics: str) -> Dict[str, float]:
        """Extract emotional content features."""
        features = {}
        words = lyrics.lower().split()
        total_words = len(words)
        
        if total_words == 0:
            return {emotion: 0.0 for emotion in self.emotion_keywords.keys()}
        
        for emotion, keywords in self.emotion_keywords.items():
            emotion_count = sum(1 for word in words if word in keywords)
            features[f'{emotion}_ratio'] = emotion_count / total_words
        
        # Overall emotional intensity
        total_emotional_words = sum(
            sum(1 for word in words if word in keywords)
            for keywords in self.emotion_keywords.values()
        )
        features['emotional_intensity'] = total_emotional_words / total_words
        
        return features
    
    def _extract_thematic_features(self, lyrics: str) -> Dict[str, float]:
        """Extract thematic content features."""
        features = {}
        words = lyrics.lower().split()
        total_words = len(words)
        
        if total_words == 0:
            return {theme: 0.0 for theme in self.theme_keywords.keys()}
        
        for theme, keywords in self.theme_keywords.items():
            theme_count = sum(1 for word in words if word in keywords)
            features[f'{theme}_theme_ratio'] = theme_count / total_words
        
        return features
    
    def _extract_complexity_features(self, lyrics: str) -> Dict[str, float]:
        """Extract linguistic complexity features."""
        features = {}
        
        words = lyrics.split()
        if not words:
            return {'lexical_diversity': 0.0, 'syllable_complexity': 0.0}
        
        # Lexical diversity (Type-Token Ratio)
        unique_words = set(word.lower() for word in words if word.isalpha())
        features['lexical_diversity'] = len(unique_words) / len(words)
        
        # Approximate syllable complexity
        syllable_counts = [self._count_syllables(word) for word in words if word.isalpha()]
        features['avg_syllables_per_word'] = np.mean(syllable_counts) if syllable_counts else 0
        features['syllable_complexity'] = np.std(syllable_counts) if len(syllable_counts) > 1 else 0
        
        # Repetition patterns
        word_counts = Counter(word.lower() for word in words if word.isalpha())
        most_common_count = word_counts.most_common(1)[0][1] if word_counts else 0
        features['repetition_ratio'] = most_common_count / len(words) if words else 0
        
        return features
    
    def _extract_sentiment_features(self, lyrics: str) -> Dict[str, float]:
        """Extract sentiment-related features."""
        features = {}
        
        # Simple sentiment analysis based on keyword lists
        positive_words = {'love', 'happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'great', 'good', 'smile', 'laugh'}
        negative_words = {'hate', 'sad', 'pain', 'hurt', 'terrible', 'awful', 'bad', 'cry', 'tears', 'angry'}
        
        words = set(word.lower() for word in lyrics.split() if word.isalpha())
        
        positive_count = len(words.intersection(positive_words))
        negative_count = len(words.intersection(negative_words))
        total_sentiment_words = positive_count + negative_count
        
        if total_sentiment_words > 0:
            features['sentiment_polarity'] = (positive_count - negative_count) / total_sentiment_words
            features['sentiment_intensity'] = total_sentiment_words / len(words) if words else 0
        else:
            features['sentiment_polarity'] = 0.0
            features['sentiment_intensity'] = 0.0
        
        features['positive_word_ratio'] = positive_count / len(words) if words else 0
        features['negative_word_ratio'] = negative_count / len(words) if words else 0
        
        return features
    
    def _count_syllables(self, word: str) -> int:
        """Approximate syllable count for a word."""
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            if char in vowels:
                if not prev_was_vowel:
                    syllable_count += 1
                prev_was_vowel = True
            else:
                prev_was_vowel = False
        
        # Handle silent 'e'
        if word.endswith('e') and syllable_count > 1:
            syllable_count -= 1
        
        return max(1, syllable_count)
    
    def _load_emotion_keywords(self) -> Dict[str, set]:
        """Load emotion keyword dictionaries."""
        return {
            'joy': {'happy', 'joy', 'excited', 'cheerful', 'elated', 'euphoric', 'blissful', 'content', 'pleased', 'delighted'},
            'sadness': {'sad', 'depressed', 'melancholy', 'sorrowful', 'gloomy', 'dejected', 'despondent', 'mournful', 'grief', 'tears'},
            'anger': {'angry', 'furious', 'rage', 'mad', 'irritated', 'annoyed', 'hostile', 'aggressive', 'violent', 'hate'},
            'fear': {'afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'frightened', 'paranoid', 'phobia'},
            'love': {'love', 'romance', 'passion', 'affection', 'adore', 'cherish', 'devotion', 'intimate', 'tender', 'caring'},
            'nostalgia': {'remember', 'memories', 'past', 'yesterday', 'childhood', 'nostalgia', 'reminisce', 'former', 'history', 'old'}
        }
    
    def _load_theme_keywords(self) -> Dict[str, set]:
        """Load thematic keyword dictionaries."""
        return {
            'relationships': {'love', 'relationship', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'wedding', 'date', 'kiss', 'romance'},
            'party': {'party', 'club', 'dance', 'music', 'celebration', 'drinks', 'dancing', 'night', 'fun', 'crowd'},
            'nature': {'nature', 'trees', 'flowers', 'ocean', 'mountains', 'sky', 'sun', 'moon', 'stars', 'earth'},
            'urban': {'city', 'street', 'buildings', 'traffic', 'urban', 'downtown', 'subway', 'concrete', 'neon', 'crowds'},
            'introspection': {'think', 'thoughts', 'mind', 'soul', 'reflect', 'meditation', 'consciousness', 'inner', 'self', 'identity'},
            'rebellion': {'rebel', 'fight', 'against', 'system', 'revolution', 'change', 'freedom', 'break', 'escape', 'resist'},
            'spirituality': {'god', 'prayer', 'faith', 'spirit', 'soul', 'heaven', 'divine', 'sacred', 'holy', 'blessed'},
            'success': {'success', 'money', 'rich', 'wealth', 'fame', 'power', 'achievement', 'winner', 'champion', 'victory'}
        }
    
    def _get_default_features(self) -> Dict[str, float]:
        """Return default features when no lyrics are available."""
        features = {
            'total_words': 0,
            'total_characters': 0,
            'avg_word_length': 0,
            'total_sentences': 0,
            'avg_sentence_length': 0,
            'vocabulary_richness': 0,
            'unique_words': 0,
            'emotional_intensity': 0,
            'lexical_diversity': 0,
            'syllable_complexity': 0,
            'avg_syllables_per_word': 0,
            'repetition_ratio': 0,
            'sentiment_polarity': 0,
            'sentiment_intensity': 0,
            'positive_word_ratio': 0,
            'negative_word_ratio': 0
        }
        
        # Add emotion features
        for emotion in self.emotion_keywords.keys():
            features[f'{emotion}_ratio'] = 0.0
        
        # Add theme features
        for theme in self.theme_keywords.keys():
            features[f'{theme}_theme_ratio'] = 0.0
        
        return features
    
    def extract_track_lyrical_features(self, track_lyrics: str) -> Dict[str, float]:
        """
        Extract lyrical features for a single track.
        
        Args:
            track_lyrics: Lyrics text for a single track
            
        Returns:
            Dictionary of lyrical features for the track
        """
        if not track_lyrics or not track_lyrics.strip():
            return self._get_default_features()
        
        # Create a DataFrame-like structure for consistency
        lyrics_df = pd.DataFrame({'lyrics': [track_lyrics]})
        return self.extract_lyrical_features(lyrics_df)
