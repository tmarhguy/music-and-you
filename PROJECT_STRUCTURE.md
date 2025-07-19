# Music and You: Project Structure & Development Guide

## 📁 Project Structure

```
music-and-you/
├── 📄 README.md                    # Project overview and quick start
├── 📄 literature.MD                # Comprehensive literature review
├── 📄 pyproject.toml               # Python project configuration
├── 📄 requirements.txt             # Python dependencies
├── 📄 .gitignore                   # Git ignore patterns
├── 🛠️ setup_dev.sh                # Development environment setup
│
├── 📁 src/music_and_you/           # Main source code
│   ├── 📄 __init__.py              # Package initialization
│   ├── 📄 core.py                  # Core constants and configurations
│   ├── 📄 config.py                # Configuration management
│   ├── 📄 cli.py                   # Command-line interface
│   │
│   ├── 📁 data/                    # Data ingestion modules
│   │   ├── 📄 __init__.py
│   │   ├── 📄 base_client.py       # Abstract base for API clients
│   │   ├── 📄 spotify_client.py    # Spotify API integration
│   │   ├── 📄 lastfm_client.py     # Last.fm API integration
│   │   └── 📄 youtube_music_client.py  # YouTube Music integration
│   │
│   ├── 📁 features/                # Feature extraction
│   │   ├── 📄 __init__.py
│   │   ├── 📄 acoustic_features.py # Audio feature extraction
│   │   ├── 📄 behavioral_features.py # Listening behavior features
│   │   ├── 📄 temporal_features.py # Time-based patterns
│   │   ├── 📄 lyrical_features.py  # Lyric analysis features
│   │   └── 📄 feature_pipeline.py  # Complete feature pipeline
│   │
│   ├── 📁 models/                  # Machine learning models
│   │   ├── 📄 __init__.py
│   │   ├── 📄 personality_predictor.py # Base predictor class
│   │   ├── 📄 ridge_model.py       # Ridge regression implementation
│   │   ├── 📄 random_forest_model.py # Random Forest implementation
│   │   └── 📄 model_ensemble.py    # Ensemble methods
│   │
│   ├── 📁 api/                     # Web API (FastAPI)
│   │   ├── 📄 __init__.py
│   │   ├── 📄 main.py              # FastAPI application
│   │   ├── 📄 auth.py              # Authentication routes
│   │   ├── 📄 prediction.py        # Prediction endpoints
│   │   └── 📄 admin.py             # Admin/monitoring endpoints
│   │
│   └── 📁 utils/                   # Utility functions
│       ├── 📄 __init__.py
│       ├── 📄 logging.py           # Logging configuration
│       ├── 📄 database.py          # Database utilities
│       ├── 📄 validation.py        # Data validation
│       └── 📄 encryption.py        # Privacy/security utilities
│
├── 📁 config/                      # Configuration files
│   ├── 📄 config.yaml              # Main configuration
│   ├── 📄 .env.example             # Environment variables template
│   └── 📄 secrets.yaml.example     # Secrets template
│
├── 📁 data/                        # Data storage
│   ├── 📁 raw/                     # Raw data from APIs
│   ├── 📁 processed/               # Processed/cleaned data
│   ├── 📁 external/                # External datasets
│   └── 📁 features/                # Extracted features
│
├── 📁 models/                      # Trained models
│   ├── 📁 saved/                   # Production models
│   ├── 📁 checkpoints/             # Training checkpoints
│   └── 📁 experiments/             # Experimental models
│
├── 📁 notebooks/                   # Jupyter notebooks
│   ├── 📄 01_data_exploration.ipynb
│   ├── 📄 02_feature_engineering.ipynb
│   ├── 📄 03_model_development.ipynb
│   ├── 📄 04_evaluation.ipynb
│   └── 📄 05_privacy_analysis.ipynb
│
├── 📁 tests/                       # Test suite
│   ├── 📄 conftest.py              # Test configuration
│   ├── 📄 test_data_clients.py     # API client tests
│   ├── 📄 test_features.py         # Feature extraction tests
│   ├── 📄 test_models.py           # Model tests
│   └── 📄 test_api.py              # API tests
│
├── 📁 experiments/                 # Research experiments
│   ├── 📁 ablation_studies/        # Feature ablation experiments
│   ├── 📁 cross_cultural/          # Cross-cultural validation
│   ├── 📁 privacy_experiments/     # Privacy-preserving methods
│   └── 📁 baselines/               # Baseline comparisons
│
├── 📁 reports/                     # Analysis reports
│   ├── 📁 figures/                 # Generated plots
│   ├── 📁 tables/                  # Statistical tables
│   └── 📄 analysis_report.md       # Main analysis report
│
├── 📁 frontend/                    # Web interface (future)
│   ├── 📄 package.json
│   ├── 📁 src/
│   └── 📁 public/
│
└── 📁 docker/                      # Containerization
    ├── 📄 Dockerfile               # Main application container
    ├── 📄 docker-compose.yml       # Multi-service setup
    ├── 📄 Dockerfile.research      # Research environment
    └── 📄 nginx.conf               # Web server configuration
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone and setup
git clone https://github.com/tmarhguy/music-and-you.git
cd music-and-you
chmod +x setup_dev.sh
./setup_dev.sh
```

### 2. Configuration

```bash
# Copy and configure environment
cp config/.env.example .env
cp config/secrets.yaml.example config/secrets.yaml

# Edit with your API credentials
nano .env
```

### 3. Data Collection

```bash
# Authenticate with Spotify
music-and-you auth --platform spotify

# Collect listening data
music-and-you collect --user-id YOUR_USER_ID --days 180
```

### 4. Feature Extraction

```bash
# Extract features from listening data
music-and-you extract-features --input-file data/raw/listening_history.json
```

### 5. Model Training

```bash
# Train personality prediction model
music-and-you train --features-file data/features/features.csv --survey-file data/survey_responses.csv
```

### 6. Web API

```bash
# Start the web server
music-and-you serve --host 0.0.0.0 --port 8000
```

## 🧪 Development Workflow

### Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/test_features.py -v
pytest -m "not slow"  # Skip slow tests

# Coverage report
pytest --cov=src/music_and_you --cov-report=html
```

### Code Quality

```bash
# Format code
black src/ tests/
isort src/ tests/

# Lint code
flake8 src/ tests/
mypy src/

# Pre-commit hooks
pre-commit install
pre-commit run --all-files
```

### Docker Development

```bash
# Build development container
docker-compose up --build

# Run in research mode
docker-compose -f docker/docker-compose.research.yml up
```

## 📊 Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐
│   Music APIs    │    │   Feature        │    │   ML Models       │
│                 │    │   Extraction     │    │                   │
│ • Spotify       │───▶│                  │───▶│ • Ridge Regression│
│ • Last.fm       │    │ • Acoustic       │    │ • Random Forest   │
│ • YouTube Music │    │ • Behavioral     │    │ • Ensemble        │
│ • Apple Music   │    │ • Temporal       │    │ • Neural Networks │
└─────────────────┘    │ • Lyrical        │    └───────────────────┘
                       └──────────────────┘              │
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐
│   Web API       │    │   Data Storage   │    │   Predictions     │
│                 │    │                  │    │                   │
│ • FastAPI       │◀───│ • PostgreSQL     │    │ • Personality     │
│ • Authentication│    │ • Redis Cache    │    │   Traits          │
│ • Rate Limiting │    │ • File Storage   │    │ • Confidence      │
│ • Documentation│    │ • Backups        │    │ • Explanations    │
└─────────────────┘    └──────────────────┘    └───────────────────┘
```

## 🔬 Research Components

### Literature Foundation

- **STOMP & MUSIC Models**: Structural music preference frameworks
- **Big Five Personality**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Cross-Cultural Studies**: 50+ country validation studies
- **Privacy & Ethics**: Responsible AI deployment considerations

### Key Innovations

1. **Multi-Platform Integration**: Unified feature extraction across streaming services
2. **Concept Bottleneck Models**: Interpretable intermediate psycho-musical concepts
3. **Privacy-Preserving ML**: Federated learning and differential privacy
4. **Cultural Adaptation**: Cross-cultural normalization and bias mitigation

### Success Metrics

- **Target Performance**: r ≥ 0.20 correlation (realistic based on literature)
- **Sample Size**: ~200 users (powered for modest effect sizes)
- **Validation**: 5-fold cross-validation with temporal splitting
- **Interpretability**: SHAP explanations with domain-specific concepts

## 🛡️ Privacy & Ethics

### Privacy-First Design

- **Local Processing**: Feature extraction can run entirely locally
- **Federated Learning**: Model training without centralized data
- **Differential Privacy**: Statistical noise injection for anonymization
- **Data Minimization**: Only collect necessary features, not raw listening logs

### Ethical Considerations

- **Transparent Limitations**: Clear communication of modest effect sizes
- **Non-Diagnostic**: Explicitly not for mental health assessment
- **User Control**: Easy data deletion and processing preferences
- **Research Purpose**: Academic/research use with proper ethics review

## 📚 Dependencies

### Core ML Stack

- **scikit-learn**: Traditional ML algorithms
- **pandas/numpy**: Data manipulation
- **matplotlib/seaborn**: Visualization
- **statsmodels**: Statistical analysis

### Music & Audio

- **spotipy**: Spotify Web API client
- **pylast**: Last.fm API client
- **librosa**: Audio analysis (future)
- **mutagen**: Audio metadata

### Web & API

- **FastAPI**: Modern web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation
- **httpx**: Async HTTP client

### Development

- **pytest**: Testing framework
- **black/isort**: Code formatting
- **mypy**: Type checking
- **pre-commit**: Git hooks

## 🎯 Next Steps

### Phase 1: MVP (Current)

- [x] Project structure setup
- [x] Spotify API integration
- [x] Basic feature extraction
- [ ] Simple Ridge/RF models
- [ ] Web API endpoints
- [ ] Basic validation study

### Phase 2: Enhancement

- [ ] Multi-platform support (Last.fm, YouTube Music)
- [ ] Advanced feature engineering
- [ ] Concept bottleneck models
- [ ] Cross-validation framework
- [ ] Privacy analysis

### Phase 3: Research

- [ ] Cross-cultural validation
- [ ] Federated learning implementation
- [ ] Academic paper submission
- [ ] Open source release
- [ ] Community contributions

---

**Ready to contribute?** Check out our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

**Questions?** Open an issue or contact the maintainers.
