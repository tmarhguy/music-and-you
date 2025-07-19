# Music and You - Frontend

A modern React/Next.js frontend for the Music and You personality prediction application.

## 🚀 Features

### Core Functionality
- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand for client-side state with persistence
- **API Integration**: Axios-based API client with automatic token refresh
- **Data Fetching**: TanStack Query for server state management
- **UI Components**: Custom component library with Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Optimized with Next.js features and lazy loading

### User Experience
- **Authentication**: Spotify OAuth2 integration with secure token handling
- **Music Analysis**: Real-time visualization of listening patterns and preferences  
- **Personality Insights**: Interactive Big Five personality trait visualization
- **Progress Tracking**: Real-time analysis progress with loading states
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support

### Developer Experience
- **TypeScript**: Full type safety with comprehensive type definitions
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
- **Testing**: Jest and React Testing Library setup
- **Storybook**: Component documentation and isolated development
- **Hot Reload**: Fast development with Next.js development server

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage with hero and features
│   │   ├── providers.tsx      # React Query and toast providers
│   │   └── globals.css        # Global styles and Tailwind
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (Button, Card, etc.)
│   │   ├── charts/           # Data visualization components
│   │   ├── forms/            # Form components and validation
│   │   └── layout/           # Layout components (Header, Footer, etc.)
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts            # API client with auth and error handling
│   │   └── utils.ts          # Utility functions and helpers
│   ├── stores/               # Zustand state management
│   │   └── index.ts          # Auth, analysis, and personality stores
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Comprehensive type system
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on localhost:8000

### Quick Start

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME="Music and You"
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler

# Testing
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Storybook
npm run storybook       # Start Storybook server
npm run build-storybook # Build Storybook
```

## 🎨 Component Library

### Base Components
- **Button**: Multiple variants (primary, secondary, spotify, outline, ghost)
- **Card**: Flexible container with title, description, and footer
- **Input**: Form inputs with validation states
- **Modal**: Accessible modal dialogs with backdrop
- **Toast**: Success, error, and info notifications

### Specialized Components
- **PersonalityChart**: Big Five traits visualization with radar and bar charts
- **MusicVisualizer**: Audio feature visualization with waveforms
- **AnalysisProgress**: Real-time progress tracking with status updates
- **TrackCard**: Music track display with play controls
- **FeatureMetrics**: Music feature analysis with explanations

### Layout Components
- **Header**: Navigation with authentication status
- **Sidebar**: Dashboard navigation with active states
- **Footer**: Links and attribution
- **PageLayout**: Standard page wrapper with breadcrumbs

## 📊 State Management

### Auth Store (`useAuthStore`)
```typescript
{
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  platforms: { spotify: boolean; lastfm: boolean; youtube_music: boolean };
  loginWithSpotify: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### Analysis Store (`useAnalysisStore`)
```typescript
{
  currentAnalysis: MusicAnalysis | null;
  loading: LoadingState;
  startAnalysis: (timeRange?: string) => Promise<void>;
  getLatestAnalysis: () => Promise<void>;
}
```

### Personality Store (`usePersonalityStore`)
```typescript
{
  currentPrediction: PersonalityPrediction | null;
  submitQuestionnaire: (data: QuestionnaireData) => Promise<void>;
  getPrediction: (id?: string) => Promise<void>;
}
```

## 🎯 Key Features Implementation

### Authentication Flow
1. User clicks "Connect with Spotify"
2. Redirect to Spotify OAuth2 authorization
3. Handle callback with authorization code
4. Exchange code for access/refresh tokens
5. Store tokens securely and update auth state

### Music Analysis Pipeline
1. Fetch user's listening history from connected platforms
2. Extract acoustic features using Spotify's Audio Features API
3. Calculate behavioral metrics (diversity, exploration, etc.)
4. Analyze temporal patterns and session characteristics
5. Display comprehensive analysis with visualizations

### Personality Prediction Workflow
1. Present TIPI (Ten Item Personality Inventory) questionnaire
2. Combine questionnaire responses with music features
3. Generate Big Five personality predictions using ML models
4. Visualize results with confidence intervals and explanations
5. Provide actionable insights and comparisons

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: Minimal sensitive data storage with encryption
- **Token Security**: Automatic token refresh and secure storage
- **API Security**: CSRF protection and request validation
- **Privacy Controls**: User data deletion and export options

### User Consent
- **Transparent Permissions**: Clear explanation of data usage
- **Granular Control**: Users can control which platforms to connect
- **Opt-out Options**: Easy account deletion and data removal
- **Usage Analytics**: Optional and anonymized only

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large**: 1440px+ (optimized layouts)

### Mobile-First Features
- **Touch Interactions**: Swipe gestures for charts and carousels
- **Responsive Navigation**: Collapsible sidebar and mobile menu
- **Optimized Loading**: Progressive image loading and lazy components
- **Offline Support**: Service worker with cache strategies

## 🎨 Design System

### Color Palette
- **Primary**: Blue scale for primary actions and branding
- **Secondary**: Gray scale for secondary content
- **Spotify**: Official Spotify green for platform integration
- **Personality**: Unique colors for each Big Five trait
- **Semantic**: Success, warning, and error states

### Typography
- **Primary Font**: Inter (system-ui fallback)
- **Monospace**: JetBrains Mono for code and data
- **Scale**: Responsive type scale from 12px to 72px
- **Weights**: 300, 400, 500, 600, 700 available

### Spacing & Layout
- **Grid System**: CSS Grid and Flexbox based layouts
- **Spacing Scale**: 4px base unit with logical progressions  
- **Container Sizes**: Responsive max-width containers
- **Aspect Ratios**: Consistent ratios for cards and media

## 🧪 Testing Strategy

### Unit Tests
- **Components**: React Testing Library for component behavior
- **Utilities**: Jest for utility function testing
- **Stores**: Zustand store testing with mock data
- **API Client**: Mock HTTP requests and error scenarios

### Integration Tests
- **User Flows**: End-to-end authentication and analysis workflows
- **API Integration**: Real API testing with test data
- **Cross-browser**: Testing across modern browsers
- **Performance**: Lighthouse CI for performance regression testing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Configuration
```env
# Production
NEXT_PUBLIC_API_URL=https://api.musicandyou.com
NEXT_PUBLIC_APP_NAME="Music and You"
NODE_ENV=production
```

### Performance Optimization
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Bundle Analysis**: `@next/bundle-analyzer` for size monitoring
- **Caching**: Aggressive caching strategies for static assets

## 📖 Usage Examples

### Basic Authentication
```typescript
import { useAuthStore } from '@/stores';

function LoginButton() {
  const { loginWithSpotify, loading } = useAuthStore();
  
  return (
    <Button
      onClick={loginWithSpotify}
      loading={loading.isLoading}
      variant="spotify"
    >
      Connect with Spotify
    </Button>
  );
}
```

### Music Analysis
```typescript
import { useAnalysisStore } from '@/stores';

function AnalysisButton() {
  const { startAnalysis, loading } = useAnalysisStore();
  
  return (
    <Button
      onClick={() => startAnalysis('medium_term')}
      loading={loading.isLoading}
    >
      Analyze My Music
    </Button>
  );
}
```

### Personality Prediction
```typescript
import { usePersonalityStore } from '@/stores';

function PersonalityResults() {
  const { currentPrediction } = usePersonalityStore();
  
  if (!currentPrediction) return <div>No prediction available</div>;
  
  return (
    <PersonalityChart
      scores={currentPrediction.scores}
      confidence={currentPrediction.overall_confidence}
    />
  );
}
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting and type checking
5. Submit a pull request

### Code Style
- **ESLint**: Airbnb configuration with TypeScript
- **Prettier**: Automatic code formatting
- **Commit Convention**: Conventional commits for changelog generation

---

**Built with ❤️ for the Music and You project**
