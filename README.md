# Music and You: Personality Analysis Through Music 🎵🧠

> **Live Application**: A full-stack web application that analyzes your personality through your Spotify listening habits using advanced music psychology research.

## 🚀 **What We've Built**

A complete personality analysis platform that connects to your Spotify account and provides insights into your Big Five personality traits based on your music preferences and listening behavior.

### ✨ **Key Features Implemented**

- **🎧 Real Spotify Integration**: Full OAuth2 authentication with Spotify Web API
- **📊 Comprehensive Data Analysis**: Unlimited music data collection and visualization
- **🧠 Personality Analysis**: Advanced algorithms based on music psychology research
- **💻 Modern Web Application**: Beautiful, responsive UI built with Next.js and React
- **🔄 Real-time Processing**: Live analysis with progress tracking and confidence scoring
- **📱 Mobile-Friendly**: Responsive design that works on all devices

## 🛠 **Technical Stack**

### **Backend (Python)**
- **FastAPI**: High-performance API server with automatic documentation
- **Spotify Web API**: Real OAuth2 integration for music data access
- **Advanced Analytics**: Music psychology algorithms for personality prediction
- **Feature Engineering**: Acoustic, temporal, behavioral, and lyrical analysis
- **Data Processing**: Pandas, NumPy for comprehensive music data analysis

### **Frontend (Next.js/React)**
- **Next.js 14**: Modern React framework with TypeScript
- **Tailwind CSS**: Beautiful, responsive styling
- **Interactive UI**: Real-time progress tracking and data visualization
- **Seamless Navigation**: Multi-page application with smooth user experience

### **Integration & Deployment**
- **Real OAuth Flow**: Secure Spotify authentication
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Management**: Secure credential handling
- **Git Workflow**: Version control with GitHub integration

## 🎯 **Application Features**

### **1. Spotify Authentication**
- Secure OAuth2 flow with Spotify
- User profile integration
- Token management and refresh

### **2. Music Data Collection**
- **Unlimited Liked Songs**: Fetch entire music library (300+ songs supported)
- **Listening History**: Recent tracks and comprehensive playback data
- **Top Content**: Most played tracks and artists with time range filtering
- **Audio Features**: Detailed acoustic analysis (energy, valence, danceability, etc.)

### **3. Personality Analysis**
- **Big Five Traits**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Music Psychology**: Research-based algorithms linking music preferences to personality
- **Confidence Scoring**: Analysis reliability based on data quality
- **Detailed Insights**: Human-readable explanations of personality characteristics
- **Visual Results**: Interactive charts and progress indicators

### **4. Data Visualization**
- **Interactive Dashboards**: Multiple views of your music data
- **Audio Features Analysis**: Visual representation of your music's characteristics
- **Listening Patterns**: Insights into your music consumption habits
- **Comprehensive Statistics**: Track counts, feature distributions, and more

## 🏗 **Project Architecture**

```
music-and-you/
├── src/music_and_you/           # Python backend
│   ├── api/                     # FastAPI application
│   │   └── simple_main.py       # Main API server with all endpoints
│   ├── data/                    # Data collection
│   │   └── spotify_client.py    # Spotify API integration
│   ├── features/                # Feature engineering
│   │   ├── feature_pipeline.py  # Main feature extraction pipeline
│   │   ├── temporal_features.py # Time-based analysis
│   │   └── lyrical_features.py  # Lyrical content analysis
│   └── models/                  # ML models and analysis
│       └── personality_predictor.py # Personality prediction algorithms
├── frontend/                    # Next.js frontend
│   ├── src/app/                 # App router pages
│   │   ├── page.tsx            # Main dashboard
│   │   ├── analyze/            # Personality analysis page
│   │   ├── data/               # Music data visualization
│   │   └── auth/               # Authentication handling
│   └── [configuration files]
└── [project configuration]
```

## 🔬 **Research Foundation**

This project is built on comprehensive literature review covering:

- **Structural Models**: STOMP and MUSIC frameworks for music preference
- **Personality Psychology**: Big Five trait associations with music preferences  
- **Music Psychology**: 20+ years of research linking musical taste to personality
- **Computational Methods**: Modern machine learning approaches to personality prediction
- **Cultural Considerations**: Cross-cultural validation and bias mitigation
- **Ethical AI**: Privacy-preserving methods and transparent explanations

## 🚀 **Getting Started**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- Spotify Developer Account

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/tmarhguy/music-and-you.git
cd music-and-you
```

2. **Set up Python environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up frontend**
```bash
cd frontend
npm install
```

4. **Configure environment**
```bash
# Copy example environment file
cp config/.env.example .env
# Add your Spotify credentials to .env
```

5. **Start the application**
```bash
# Terminal 1: Start backend
source venv/bin/activate
uvicorn src.music_and_you.api.simple_main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev -- --port 3001
```

6. **Access the application**
- Open http://localhost:3001 in your browser
- Connect your Spotify account
- Start analyzing your music personality!

## 📊 **API Endpoints**

### **Authentication**
- `GET /api/auth/spotify/login` - Initiate Spotify OAuth
- `GET /api/auth/spotify/callback` - Handle OAuth callback

### **User Data**
- `GET /api/user/profile` - Get user profile information
- `GET /api/user/liked-songs` - Fetch unlimited liked songs
- `GET /api/user/top-tracks` - Get top tracks with time ranges
- `GET /api/user/top-artists` - Get top artists with time ranges
- `GET /api/user/recent-tracks` - Get recently played tracks

### **Analysis**
- `POST /api/analysis/personality` - Comprehensive personality analysis
- Returns Big Five trait scores, insights, and confidence metrics

## 🎨 **User Interface**

### **Dashboard**
- Welcome screen with Spotify connection
- Feature overview cards
- Navigation to analysis and data views

### **Personality Analysis Page**
- Interactive analysis initiation
- Real-time progress tracking
- Visual trait score displays
- Detailed personality insights
- Action buttons for further exploration

### **Data Visualization**
- Tabbed interface for different data types
- Unlimited liked songs display
- Audio features charts
- Listening history tables
- Time range filtering

## 🔒 **Security & Privacy**

- **Secure OAuth**: Industry-standard Spotify authentication
- **No Data Storage**: User data processed in real-time, not persisted
- **Environment Variables**: Sensitive credentials properly managed
- **CORS Protection**: Proper cross-origin request handling
- **Token Management**: Secure handling of access and refresh tokens

## 🎯 **Success Metrics Achieved**

- ✅ **Real Spotify Integration**: Full OAuth2 implementation
- ✅ **Unlimited Data Collection**: Fetch complete music libraries
- ✅ **Advanced Analysis**: Music psychology-based personality prediction
- ✅ **Beautiful UI**: Modern, responsive web application
- ✅ **Real-time Processing**: Live analysis with progress tracking
- ✅ **Production Ready**: Deployable full-stack application

## 📈 **Future Enhancements**

- **Music Recommendations**: Personality-based music discovery
- **Data Persistence**: User analysis history and tracking
- **Social Features**: Share and compare personality profiles
- **Advanced Analytics**: Deeper music psychology insights
- **Mobile App**: Native iOS/Android applications
- **Cultural Adaptation**: Multi-cultural personality models

## 🤝 **Contributing**

This project represents a complete implementation of music-based personality analysis. The codebase is well-structured and documented for future enhancements and research applications.

## 📝 **License**

This project is for research and educational purposes. Please respect Spotify's API terms of service and user privacy.

---

**🎵 Discover your musical personality today!** Connect your Spotify account and unlock insights about yourself through the music you love.

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
