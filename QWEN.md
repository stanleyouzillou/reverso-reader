# Reverso Reader - Project Architecture & Development Guide

## Overview
Reverso Reader is a language learning application that provides an interactive reading experience with translation capabilities. The application allows users to read articles in a target language while getting contextual translations, vocabulary tracking, and audio support.

## Project Structure

```
reverso-reader/
├── api/                    # Backend API server
│   ├── app.ts             # Main Express application
│   ├── server.ts          # Server entry point
│   └── routes/            # API route handlers
│       ├── auth.ts        # Authentication endpoints
│       ├── reverso.ts     # Reverso API integration
│       └── translate.ts   # Google Translate integration
├── src/                   # Frontend React application
│   ├── components/        # React UI components
│   │   ├── Layout.tsx     # Main layout component
│   │   ├── Header.tsx     # Header component
│   │   ├── Sidebar.tsx    # Sidebar component
│   │   ├── ControlBar.tsx # Control bar component
│   │   ├── ReaderSurface.tsx # Main reader surface
│   │   └── reader/        # Reader-specific components
│   │       ├── ReaderHeader.tsx
│   │       ├── DualModeView.tsx
│   │       ├── SingleModeView.tsx
│   │       └── Token.tsx
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Service layer (API calls, etc.)
│   ├── store/             # Zustand store
│   ├── constants/         # Constants and demo content
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## Architecture Overview

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS with custom configuration
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Proxy**: Vite proxy to backend API

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Language**: TypeScript
- **Runtime**: Node.js with ES modules
- **Development**: Nodemon for auto-restart
- **API**: RESTful endpoints

## Key Features

### 1. Reading Modes
- **Clean Mode**: Minimal interface for distraction-free reading
- **Learning Mode**: Interactive mode with clickable words for translations
- **Dual Mode**: Side-by-side view with original and translated content

### 2. Translation Services
- **Multiple Providers**: Google Translate, Reverso, and Gemini integration
- **Contextual Translation**: Translation with context awareness
- **Caching**: Translation caching for performance
- **Proxy Support**: Google Translate with proxy rotation to avoid rate limits

### 3. Vocabulary Management
- **Vocabulary Tracking**: Track learned and learning words
- **CEFR Levels**: Support for CEFR language levels (A1-C2)
- **Word Status**: Track word status (Unknown, Learning, Known)
- **History**: Maintain translation history

### 4. Audio Features
- **Text-to-Speech**: Sentence-based audio playback
- **Karaoke Mode**: Highlight words as they're spoken
- **Playback Speed**: Adjustable playback speed

### 5. Reading Settings
- **Customizable UI**: Font family, size, weight, background color
- **Reading Modes**: Different column widths and themes
- **Personalization**: User preferences storage

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration (TODO)
- `POST /login` - User login (TODO)
- `POST /logout` - User logout (TODO)

### Translation (`/api/translate`)
- `POST /` - Translate text using Google Translate with proxy support

### Reverso (`/api/reverso`)
- `POST /translation` - Get translations from Reverso API
- `POST /context` - Get context examples from Reverso API
- `POST /synonyms` - Get synonyms from Reverso API

### Health Check (`/api/health`)
- `GET /health` - Health check endpoint

## Technology Stack

### Frontend Dependencies
- **React 18**: UI library
- **Zustand**: State management
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Styling framework
- **Lucide React**: Icon library
- **clsx & tailwind-merge**: Utility classes

### Backend Dependencies
- **Express**: Web framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **reverso-api**: Reverso API client
- **@vitalets/google-translate-api**: Google Translate API client

### Development Dependencies
- **TypeScript**: Type checking
- **Vite**: Build tool and dev server
- **ESLint**: Code linting
- **nodemon**: Development server auto-restart
- **concurrently**: Running multiple processes

## Key Components & Hooks

### Store (`src/store/useStore.ts`)
- Manages global application state
- Tracks reading mode, vocabulary history, audio state
- Uses Zustand for state management

### Translation Engine (`src/hooks/useTranslationEngine.ts`)
- Provides translation functionality
- Integrates with multiple translation services
- Handles caching and error management

### Article Ingestion (`src/hooks/useArticleIngestion.ts`)
- Processes article content into tokens and sentences
- Manages dual-language content pairing
- Provides context for translations

### Reader Settings (`src/hooks/useReaderSettings.ts`)
- Manages user preferences for reading experience
- Handles font, theme, and layout preferences

## Current Limitations & Areas for Improvement

### 1. Architecture & Scalability
- **Monolithic Structure**: Currently a single application without clear separation of concerns
- **State Management**: Complex state management could benefit from more structured patterns
- **Error Handling**: Inconsistent error handling across components

### 2. Performance
- **Translation Caching**: Basic caching without expiration or size limits
- **Large Text Processing**: No optimization for handling very large articles
- **Memory Management**: Potential memory leaks with long reading sessions

### 3. Security
- **Authentication**: Basic auth routes with no implementation
- **API Security**: No rate limiting or input validation
- **CORS**: Wide-open CORS policy

### 4. Testing
- **No Unit Tests**: Missing automated tests
- **No Integration Tests**: No API or component testing
- **No E2E Tests**: No end-to-end testing

### 5. Documentation
- **Limited Documentation**: Missing detailed API documentation
- **Code Comments**: Inconsistent commenting across codebase

## Recommendations for Scaling & Improvements

### 1. Architecture Improvements
- **Microservices**: Consider splitting into separate services (auth, translation, user management)
- **API Gateway**: Implement API gateway for better routing and security
- **Database Integration**: Add database for user data, vocabulary, and articles
- **Caching Layer**: Implement Redis for better caching strategy

### 2. Code Quality
- **Type Safety**: Enhance TypeScript usage with stricter configuration
- **Component Structure**: Better component organization and reusability
- **Code Splitting**: Implement code splitting for better performance
- **Testing Strategy**: Add comprehensive testing (unit, integration, E2E)

### 3. Performance Optimizations
- **Virtual Scrolling**: Implement for large articles
- **Lazy Loading**: Lazy load components and data
- **CDN Integration**: Use CDN for static assets
- **Image Optimization**: Optimize images and media

### 4. Security Enhancements
- **Authentication**: Implement JWT-based authentication
- **Input Validation**: Add comprehensive input validation
- **Rate Limiting**: Implement API rate limiting
- **Security Headers**: Add security headers

### 5. Feature Additions
- **User Profiles**: Personalized user experience
- **Progress Tracking**: Track reading progress and achievements
- **Offline Mode**: Support for offline reading
- **Article Management**: User-uploaded articles
- **Social Features**: Sharing and collaboration

### 6. DevOps & Deployment
- **Containerization**: Docker for consistent deployments
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring
- **Logging**: Comprehensive logging strategy

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (both client and server)
npm run dev

# Run client only
npm run client:dev

# Run server only
npm run server:dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run check
```

## Environment Variables

The application uses a `.env` file for configuration:

```
PORT=3001
NODE_ENV=development
# Add API keys for translation services
```

## API Rate Limiting & Proxy Strategy

The application implements a sophisticated proxy rotation system for Google Translate to avoid rate limits:
- Multiple public proxies are used in rotation
- Direct connection is attempted first
- If direct fails, proxies are tried in random order
- Error handling for different types of failures

## Data Flow

1. **Article Loading**: Articles are loaded into the application (currently using demo content)
2. **Tokenization**: Content is broken into tokens and sentences
3. **User Interaction**: User clicks on words to get translations
4. **Translation Request**: Translation is requested from backend
5. **Response Processing**: Translation is displayed and added to history
6. **State Update**: Vocabulary and reading state are updated

## Future Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Distribute requests across multiple instances
- **Session Management**: Implement shared session storage
- **Database Scaling**: Consider database sharding for user data

### Vertical Scaling
- **Caching Strategy**: Multi-level caching (in-memory, Redis, CDN)
- **CDN Integration**: Serve static assets from CDN
- **Compression**: Implement response compression

### Database Integration
- **User Data**: Store user profiles, preferences, and history
- **Articles**: Store and manage article content
- **Vocabulary**: Persistent vocabulary tracking
- **Analytics**: Reading behavior and progress tracking

This architecture provides a solid foundation for a language learning application with room for significant expansion and scaling.