"""
Database utilities and models for the Music and You project.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from typing import Optional
import uuid

Base = declarative_base()


class User(Base):
    """User model for storing participant information."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Basic info
    display_name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    country = Column(String(10))
    age_range = Column(String(20))  # e.g., "18-24", "25-34"
    
    # Consent and privacy
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime)
    data_retention_consent = Column(Boolean, default=True)
    
    # Platform connections
    spotify_connected = Column(Boolean, default=False)
    lastfm_connected = Column(Boolean, default=False)
    youtube_connected = Column(Boolean, default=False)
    
    # Relationships
    personality_scores = relationship("PersonalityScore", back_populates="user")
    listening_sessions = relationship("ListeningSession", back_populates="user")


class PersonalityScore(Base):
    """Model for storing personality assessment results."""
    __tablename__ = "personality_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Assessment info
    assessment_type = Column(String(50))  # e.g., "TIPI", "BFI-2"
    assessment_version = Column(String(20))
    
    # Big Five scores
    openness = Column(Float)
    conscientiousness = Column(Float)
    extraversion = Column(Float)
    agreeableness = Column(Float)
    neuroticism = Column(Float)
    
    # Additional measures
    empathy_score = Column(Float)
    systemizing_score = Column(Float)
    
    # Relationship
    user = relationship("User", back_populates="personality_scores")


class Platform(Base):
    """Model for music platforms."""
    __tablename__ = "platforms"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)  # spotify, lastfm, youtube
    display_name = Column(String(100))
    api_version = Column(String(20))
    
    # Relationships
    tracks = relationship("Track", back_populates="platform")


class Artist(Base):
    """Model for music artists."""
    __tablename__ = "artists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    external_id = Column(String(255), nullable=False)  # Platform-specific ID
    
    name = Column(String(500), nullable=False)
    genres = Column(Text)  # JSON array of genres
    popularity = Column(Integer)
    followers = Column(Integer)
    
    # Relationships
    tracks = relationship("Track", back_populates="artist")


class Album(Base):
    """Model for music albums."""
    __tablename__ = "albums"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    external_id = Column(String(255), nullable=False)
    
    name = Column(String(500), nullable=False)
    release_date = Column(DateTime)
    album_type = Column(String(50))  # album, single, compilation
    total_tracks = Column(Integer)
    
    # Relationships
    tracks = relationship("Track", back_populates="album")


class Track(Base):
    """Model for music tracks."""
    __tablename__ = "tracks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    external_id = Column(String(255), nullable=False)
    
    # Basic info
    name = Column(String(500), nullable=False)
    duration_ms = Column(Integer)
    explicit = Column(Boolean)
    popularity = Column(Integer)
    
    # Relationships
    artist_id = Column(UUID(as_uuid=True), ForeignKey("artists.id"))
    album_id = Column(UUID(as_uuid=True), ForeignKey("albums.id"))
    
    platform = relationship("Platform", back_populates="tracks")
    artist = relationship("Artist", back_populates="tracks")
    album = relationship("Album", back_populates="tracks")
    audio_features = relationship("AudioFeatures", back_populates="track", uselist=False)
    listening_records = relationship("ListeningRecord", back_populates="track")


class AudioFeatures(Base):
    """Model for track audio features."""
    __tablename__ = "audio_features"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    track_id = Column(UUID(as_uuid=True), ForeignKey("tracks.id"), unique=True)
    
    # Spotify audio features
    danceability = Column(Float)
    energy = Column(Float)
    key = Column(Integer)
    loudness = Column(Float)
    mode = Column(Integer)
    speechiness = Column(Float)
    acousticness = Column(Float)
    instrumentalness = Column(Float)
    liveness = Column(Float)
    valence = Column(Float)
    tempo = Column(Float)
    time_signature = Column(Integer)
    
    # Additional computed features
    musical_complexity = Column(Float)
    emotional_intensity = Column(Float)
    
    # Relationship
    track = relationship("Track", back_populates="audio_features")


class ListeningSession(Base):
    """Model for listening sessions."""
    __tablename__ = "listening_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    
    session_start = Column(DateTime, nullable=False)
    session_end = Column(DateTime)
    total_tracks = Column(Integer)
    total_duration_ms = Column(Integer)
    
    # Context
    device_type = Column(String(50))
    location = Column(String(100))
    
    # Relationships
    user = relationship("User", back_populates="listening_sessions")
    listening_records = relationship("ListeningRecord", back_populates="session")


class ListeningRecord(Base):
    """Model for individual track listening records."""
    __tablename__ = "listening_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("listening_sessions.id"))
    track_id = Column(UUID(as_uuid=True), ForeignKey("tracks.id"))
    
    played_at = Column(DateTime, nullable=False)
    duration_played_ms = Column(Integer)
    skipped = Column(Boolean, default=False)
    liked = Column(Boolean)
    
    # Context
    shuffle = Column(Boolean)
    repeat_mode = Column(String(20))  # off, track, context
    
    # Relationships
    session = relationship("ListeningSession", back_populates="listening_records")
    track = relationship("Track", back_populates="listening_records")


class DatabaseManager:
    """Database connection and session management."""
    
    def __init__(self, database_url: str):
        """
        Initialize database manager.
        
        Args:
            database_url: SQLAlchemy database URL
        """
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_tables(self):
        """Create all database tables."""
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self) -> Session:
        """Get a database session."""
        return self.SessionLocal()
    
    def close(self):
        """Close database connection."""
        self.engine.dispose()
