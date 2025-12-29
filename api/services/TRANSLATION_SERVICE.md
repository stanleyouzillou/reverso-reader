# Translation Service Documentation

## Overview
This service provides translation functionality using Google Cloud Translation API v3 with additional dictionary enrichment for single words. It replaces the previous proxy-based solution with a more reliable and scalable approach.

## Features
- Uses official Google Cloud Translation API v3
- Supports both single strings and arrays of strings
- Implements local caching to reduce API calls and costs
- Provides dictionary enrichment for single words
- Robust error handling with appropriate HTTP status codes

## Environment Variables
- `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account key file (for Application Default Credentials)

## API

### translateText(text, targetLanguage = 'en', sourceLanguage = 'auto')
Translates text using Google Cloud Translation API.

**Parameters:**
- `text`: string | string[] - Text to translate (single string or array of strings)
- `targetLanguage`: string - Target language code (default: 'en')
- `sourceLanguage`: string - Source language code (default: 'auto')

**Returns:**
Promise resolving to:
```typescript
{
  translation: string | string[],  // Translated text(s)
  dictionary: any | null          // Dictionary data if input was a single word
}
```

### getDictionaryData(word)
Fetches dictionary data for a single word from dictionaryapi.dev.

**Parameters:**
- `word`: string - The word to look up

**Returns:**
Promise resolving to dictionary data or null if not found

### clearCache()
Clears the translation cache.

### getCacheStats()
Returns cache statistics including key count and hit rate.

## Caching Strategy
- Translation results are cached with a 1-hour TTL
- Dictionary data is cached with a 2-hour TTL
- Cache keys are based on the input text and target language
- Cache hit rate is tracked for performance monitoring

## Error Handling
- 400: Bad Request (missing required parameters)
- 429: Rate Limit Exceeded (quota exceeded)
- 500: Internal Server Error (authentication or other API errors)

## Performance Considerations
- Uses async/await for non-blocking operations
- Implements parallel processing for translation and dictionary lookup
- Implements caching to avoid redundant API calls
- Properly handles both single strings and arrays of strings