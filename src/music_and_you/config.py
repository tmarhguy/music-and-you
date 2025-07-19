"""
Configuration management for the Music and You project.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
from music_and_you.core import CONFIG_DIR


@dataclass
class DatabaseConfig:
    """Database configuration settings."""
    host: str = "localhost"
    port: int = 5432
    database: str = "music_and_you"
    username: str = "postgres"
    password: str = ""


@dataclass 
class APIConfig:
    """API configuration for music platforms."""
    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_redirect_uri: str = "http://localhost:8080/callback"
    
    lastfm_api_key: str = ""
    lastfm_secret: str = ""
    
    youtube_api_key: str = ""


@dataclass
class ModelConfig:
    """Machine learning model configuration."""
    random_state: int = 42
    test_size: float = 0.2
    cv_folds: int = 5
    target_correlation: float = 0.20
    
    # Model hyperparameters
    ridge_alpha: float = 1.0
    rf_n_estimators: int = 100
    rf_max_depth: Optional[int] = None
    
    # Feature selection
    feature_selection: bool = True
    max_features: Optional[int] = None


@dataclass
class Config:
    """Main configuration class."""
    database: DatabaseConfig
    api: APIConfig  
    model: ModelConfig
    
    # General settings
    log_level: str = "INFO"
    data_dir: str = str(CONFIG_DIR.parent / "data")
    cache_ttl: int = 3600  # 1 hour
    
    @classmethod
    def from_yaml(cls, config_path: Optional[Path] = None) -> "Config":
        """
        Load configuration from YAML file.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Config instance
        """
        if config_path is None:
            config_path = CONFIG_DIR / "config.yaml"
            
        if not config_path.exists():
            # Return default config if file doesn't exist
            return cls(
                database=DatabaseConfig(),
                api=APIConfig(),
                model=ModelConfig()
            )
        
        with open(config_path, 'r') as f:
            config_data = yaml.safe_load(f)
        
        return cls(
            database=DatabaseConfig(**config_data.get('database', {})),
            api=APIConfig(**config_data.get('api', {})),
            model=ModelConfig(**config_data.get('model', {})),
            **{k: v for k, v in config_data.items() 
               if k not in ['database', 'api', 'model']}
        )
    
    @classmethod
    def from_env(cls) -> "Config":
        """
        Load configuration from environment variables.
        
        Returns:
            Config instance with values from environment
        """
        return cls(
            database=DatabaseConfig(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', '5432')),
                database=os.getenv('DB_NAME', 'music_and_you'),
                username=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            ),
            api=APIConfig(
                spotify_client_id=os.getenv('SPOTIFY_CLIENT_ID', ''),
                spotify_client_secret=os.getenv('SPOTIFY_CLIENT_SECRET', ''),
                spotify_redirect_uri=os.getenv(
                    'SPOTIFY_REDIRECT_URI', 
                    'http://localhost:8080/callback'
                ),
                lastfm_api_key=os.getenv('LASTFM_API_KEY', ''),
                lastfm_secret=os.getenv('LASTFM_SECRET', ''),
                youtube_api_key=os.getenv('YOUTUBE_API_KEY', '')
            ),
            model=ModelConfig(
                random_state=int(os.getenv('MODEL_RANDOM_STATE', '42')),
                test_size=float(os.getenv('MODEL_TEST_SIZE', '0.2')),
                cv_folds=int(os.getenv('MODEL_CV_FOLDS', '5'))
            ),
            log_level=os.getenv('LOG_LEVEL', 'INFO'),
            data_dir=os.getenv('DATA_DIR', str(CONFIG_DIR.parent / "data")),
            cache_ttl=int(os.getenv('CACHE_TTL', '3600'))
        )


# Global config instance
config = Config.from_env()
