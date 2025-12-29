# Locale Support and Modular Structure

## Overview
This document outlines how to add new locales to the translation system in a modular way that maintains the existing architecture.

## Current Default Configuration
- L2 (second language) is set to English (GB) locale by default
- Default target language code: `en-GB`
- Source language detection: `auto` (automatic detection)

## Adding New Locales

### 1. Translation Service Level
The translation services are already designed to accept any valid language code:

```typescript
// In GoogleTranslationService.ts
async translate(
  text: string,
  to: string = "en-GB",  // Change this default or pass different value
  from: string = "auto",
  context?: string
): Promise<TranslationResult>
```

### 2. Settings Configuration
To support multiple locales, update the settings store:

1. Add locale options to the settings interface
2. Create a dropdown or selector in the UI
3. Store the selected locale in the global state

### 3. Language Code Standards
- Use ISO 639-1 language codes (2-letter codes)
- Use ISO 3166-1 country codes when needed (e.g., en-GB, en-US)
- Follow the format: `{language}-{COUNTRY}`

### 4. Supported Language Examples
Common language codes for the service:
- English (US): `en-US`
- English (GB): `en-GB` (current default)
- French: `fr`
- Spanish: `es`
- German: `de`
- Italian: `it`
- Portuguese: `pt`
- Chinese (Simplified): `zh`
- Japanese: `ja`
- Korean: `ko`

### 5. UI Locale Selection
To implement a locale selector:

1. Create a dropdown component in the settings panel
2. Update the global store with the selected locale
3. Pass the locale to the translation services
4. Cache translations per locale to avoid redundant API calls

### 6. Caching Strategy
The current caching system already supports multiple locales:
- Cache keys include the target language: `${provider}:${text}:${to}`
- Translations for different locales are stored separately
- No changes needed to support multiple locales

### 7. Implementation Example
```typescript
// In a settings component
const handleLocaleChange = (locale: string) => {
  // Update global store
  updateTranslationLocale(locale);
  
  // The translation service will automatically use the new locale
};

// The translation service will receive the locale automatically
const result = await translationService.translate(text, selectedLocale);
```

### 8. Future Enhancements
- Add locale detection based on article language
- Implement locale-specific formatting (dates, numbers, etc.)
- Add RTL (right-to-left) language support
- Include locale-specific dictionaries

## Architecture Benefits
- The modular design allows adding new locales without changing core logic
- Services are loosely coupled through the ITranslationService interface
- Caching system automatically handles multiple locales
- Settings store can manage locale preferences per user