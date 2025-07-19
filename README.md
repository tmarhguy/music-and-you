# Music and You: Personality Prediction from Spotify Listening Behavior

A research project investigating the relationship between music listening patterns and personality traits using machine learning and naturalistic streaming data from multiple music platforms.

## Project Overview

This project aims to predict Big Five personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) from users' music listening behavior across multiple streaming platforms, addressing key gaps in the music psychology and personality computing literature.

### Key Features

- **Multi-modal feature engineering**: Acoustic features, temporal behavior, lyric semantics, and exploration metrics
- **Research-grounded approach**: Built on 20+ years of music psychology research
- **Ethical AI**: Privacy-preserving methods with federated learning and transparent model explanations
- **Cross-cultural considerations**: Cultural adaptation and bias mitigation strategies

### Research Contributions

1. **Unified feature schema** combining behavioral logs with derived MUSIC factor projections
2. **Concept bottleneck architecture** for interpretable psycho-musical concept predictions
3. **Privacy-preserving** personality inference with federated learning prototype
4. **Cultural moderation** analysis of trait-feature relationships across populations

## Technical Architecture

### MVP Components

- **Data Ingestion**: Multi-platform support (Spotify, YouTube Music, Last.fm) + unified feature extraction
- **Survey Module**: TIPI personality assessment + optional empathy-systemizing scales
- **Feature Engineering**: Comprehensive acoustic, temporal, and behavioral metrics across platforms
- **Modeling**: Ridge regression and Random Forest multi-target regressors
- **Evaluation**: 5-fold cross-validation with robust uncertainty quantification
- **Explainability**: SHAP values with human-readable explanations

### Success Metrics

- Target: r ≥ 0.20 for Openness or Extraversion prediction
- Sample size: ~200 users (powered for expected modest effect sizes)
- Temporal validation: Features from pre-survey listening only

## Research Foundation

This project is built on comprehensive literature review covering:

- Structural models of music preference (STOMP, MUSIC)
- Personality trait associations and Big Five correlations
- Cognitive styles, empathy, and systemizing theories
- Cross-cultural generalizability studies
- Computational personality computing approaches
- Ethical considerations and privacy frameworks

See [`literature.MD`](literature.MD) for the complete literature review and research framework.

## Planned Extensions

- **Sequence Transformer**: For temporal dynamics modeling
- **Concept Bottleneck**: Interpretable psycho-musical constructs
- **Federated Learning**: Privacy-preserving deployment
- **Moral Value Prediction**: Secondary inference targets
- **Cultural Mixed-Effects**: Cross-national validation

## Ethical Considerations

- Transparent communication of modest effect sizes and probabilistic nature
- Privacy-first design with local processing options
- Non-diagnostic framing (not for mental health assessment)
- User control over data deletion and processing preferences

## Getting Started

_[Development in progress]_

## License

_[To be determined]_

## Citation

_[Research paper in preparation]_

---

**Note**: This is an active research project. The codebase and methodological approaches may evolve as we implement and validate the research framework outlined in the literature review.
