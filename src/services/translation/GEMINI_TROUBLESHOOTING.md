# Gemini LLM Service Troubleshooting

This document provides information on the Gemini LLM service used for word definitions and how to troubleshoot common issues.

## Overview
The Gemini LLM service (using `gemini-2.0-flash`) is responsible for generating detailed definition cards in the dictionary component. It provides pronunciations, multiple definitions with examples, and usage examples.

## Configuration Requirements
To use the Gemini service, ensure the following environment variable is set in your `.env` file:

```env
VITE_GEMINI_API_KEY="your_api_key_here"
```

**Note:** Only variables prefixed with `VITE_` are accessible to the client-side code.

## Monitoring
You can monitor the health and performance of the LLM service in the **Debug & Integrations** section of the application settings.
- **Total Calls:** Number of times the service was requested.
- **Success/Failed:** Count of successful and failed API calls.
- **Avg Time:** Average response time in milliseconds.
- **Last Error:** Displays the exact error message from the last failed call.
- **Mock Fallbacks:** Count of times the system fell back to mock data due to errors or missing configuration.

## Common Issues and Solutions

### 1. Defaulting to Mock Data
**Symptoms:** Definitions appear but look generic (e.g., "Definition for word (Mock Data)").
- **Check API Key:** Ensure `VITE_GEMINI_API_KEY` is correctly set in `.env` and the application has been restarted.
- **Check Console:** Look for `[Gemini Service] VITE_GEMINI_API_KEY not set in .env.` in the browser console.
- **Check Network:** Verify the browser can reach `generativelanguage.googleapis.com`.

### 2. HTTP 403 Forbidden
**Symptoms:** "Gemini API error: HTTP error 403" in the Debug settings.
- **Invalid API Key:** The key provided is incorrect or has expired.
- **API Restrictions:** Ensure the Gemini API is enabled for your project in the [Google AI Studio](https://aistudio.google.com/).

### 3. HTTP 429 Too Many Requests
**Symptoms:** "Gemini API error: HTTP error 429"
- **Rate Limiting:** You have exceeded the free tier quota. Wait a few minutes or upgrade your plan.

### 4. Invalid Response Structure
**Symptoms:** "Gemini API error: Invalid response structure from Gemini API"
- **API Changes:** The Gemini API might have changed its response format. Check `src/services/gemini.ts` for schema validation.

## Development and Testing
- **Cache:** Definitions are cached for 7 days in LocalStorage. Use the "Clear Translation Cache" button in Debug settings to force new API calls.
- **Mock Data:** If the API key is missing, the service automatically falls back to `getMockDefinition` to maintain UI functionality.
