# Generalized Translation Service Architecture

## Overview
This document outlines the architecture for the translation service that supports all application modes requiring translation functionality. The architecture is designed to maintain clean separation of concerns while avoiding service dependencies through proper dependency injection.

## Architecture Components

### 1. Translation Service Interface (ITranslationService)
- Defines the contract for all translation services
- Includes methods for translating text with context
- Supports multiple target languages
- Handles error cases consistently

### 2. Concrete Translation Services
- GoogleTranslationService: Uses Google Cloud Translation API (Primary)
- GeminiTranslationService: Uses Google Gemini API
- Each service implements the ITranslationService interface

## Adding a New Translation Service

To add a new translation provider to the application, follow these steps:

1. **Create the Service Class**: 
   - Create a new file in `src/services/translation/` (e.g., `MyNewService.ts`).
   - Implement the `ITranslationService` interface.
   - Handle API calls and response mapping within the `translate` method.

2. **Update the Provider Type**:
   - In `src/hooks/useReaderSettings.ts`, add your new provider name to the `TranslationProvider` type.

3. **Register the Service**:
   - In `src/services/translation/TranslationRegistry.ts`, import your new service.
   - Add it to the `services` object in the `TranslationRegistry` constructor.
   - Update the `TranslationProvider` type in `TranslationRegistry.ts`.

4. **Update the UI**:
   - In `src/components/settings/DebugSettings.tsx`, add your provider to the list of available services in the UI to allow users to select it.

### 3. Translation Registry
- Manages available translation services
- Provides service lookup by provider name
- Handles service initialization and lifecycle

### 4. Translation Service Manager
- Coordinates between different translation services
- Implements caching layer to reduce API calls
- Handles fallback mechanisms when primary service fails

### 5. React Hooks Layer
- useTranslationEngine: High-level hook for components
- useInlineTranslation: Specialized hook for inline translation functionality
- Abstracts away service complexity from UI components

### 6. UI Components
- Token: Handles individual word interactions
- InlineTranslation: Displays translation popups
- ReaderSurface: Orchestrates translation functionality

## Dependency Injection Strategy

### Service Registration
- Services are registered in TranslationRegistry at application startup
- Components receive services through React hooks rather than direct instantiation
- Configuration is managed through environment variables and settings store

### Separation of Concerns
- UI components only handle presentation logic
- Hooks manage state and service orchestration
- Services handle API communication and business logic
- Store manages global state and persistence

## Implementation Patterns

### 1. Factory Pattern
- TranslationRegistry acts as a factory for translation services
- Allows for dynamic service selection based on configuration

### 2. Strategy Pattern
- Different translation algorithms can be swapped at runtime
- Supports A/B testing of different translation providers

### 3. Decorator Pattern
- Caching layer decorates base translation services
- Error handling wraps service calls

### 4. Observer Pattern
- Store updates propagate to interested components
- Translation results update UI elements reactively

## Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns makes code easier to maintain
2. **Testability**: Each component can be tested in isolation
3. **Extensibility**: New translation services can be added without modifying existing code
4. **Performance**: Caching and efficient state management
5. **Reliability**: Fallback mechanisms ensure service availability

## Integration Points

### Inline Translation Mode
- Token component triggers translation requests
- InlineTranslation component displays results
- useInlineTranslation hook manages state and positioning

### Settings Integration
- Translation provider selection through settings
- Language preferences stored in global state
- Locale-specific configurations

### Error Handling
- Graceful degradation when translation services fail
- User-friendly error messages
- Fallback to cached translations when available

## Future Enhancements

1. **Plugin Architecture**: Allow third-party translation services
2. **Advanced Caching**: Implement more sophisticated caching strategies
3. **Performance Monitoring**: Track translation response times
4. **A/B Testing Framework**: Compare translation quality between providers