MPLEMENTATION BRIEF: Word Definition Card Component

Build a React component that displays comprehensive word definitions fetched from Gemini 2.5 Flash API. Component appears in dictionary sidebar when user clicks a word in reading text.

1. COMPONENT STRUCTURE
   File: DefinitionCard.tsx

Props interface:

typescript
interface DefinitionCardProps {
word: string;
sourceSentence: string;
sourceLanguage: string; // L2 (e.g., "en")
targetLanguage: string; // L1 (e.g., "fr", "es")
textPosition: number; // For scroll-to-source feature
onAddToVocabulary: (word: string) => void;
onNavigateToSource: (position: number) => void;
}
Component sections:

Header: Word title + pronunciation button + phonetic spelling + part of speech

Translations bar: L1 translations as pills (e.g., "omniprésent · répandu · partout")

Definitions list: Each sense with label, meaning, example, translation icons, TTS buttons

Source section: Original sentence with TTS + translation icon + "View in text" link

CTA: "Add to vocabulary" button at bottom

2. GEMINI API INTEGRATION
   File: services/gemini.ts

typescript
interface GeminiDefinitionResponse {
word: string;
pronunciation: string; // "yoo-BIK-wi-tus" format
partOfSpeech: string;
definitions: {
senseLabel: string;
meaning: string;
example: string;
translations: string[];
}[];
}

export async function fetchDefinition(
word: string,
sourceSentence: string,
sourceLanguage: string,
targetLanguage: string
): Promise<GeminiDefinitionResponse> {

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

const prompt = `Word: ${word}
Source sentence: "${sourceSentence}"
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

Generate a detailed definition card with:

- Simplified pronunciation (CAP-itals for stress, e.g., yoo-BIK-wi-tus)
- Part of speech
- 2-4 definitions ordered by frequency, each with:

  - senseLabel: 1-3 word context tag (e.g., "commonality", "weather")
  - meaning: Clear explanation in source language
  - example: Natural 10-20 word sentence in source language
  - translations: 3-4 target language equivalents (single words/short phrases)`;

  const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
  responseMimeType: "application/json",
  responseSchema: {
  type: "object",
  properties: {
  word: { type: "string" },
  pronunciation: { type: "string" },
  partOfSpeech: { type: "string" },
  definitions: {
  type: "array",
  items: {
  type: "object",
  properties: {
  senseLabel: { type: "string" },
  meaning: { type: "string" },
  example: { type: "string" },
  translations: { type: "array", items: { type: "string" } }
  },
  required: ["senseLabel", "meaning", "example", "translations"]
  }
  }
  },
  required: ["word", "pronunciation", "partOfSpeech", "definitions"]
  }
  }
  })
  }
  );

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
  }

3. TRANSLATION SERVICE (Google Translate API)
   File: services/translation.ts

typescript
export async function translateText(
text: string,
sourceLang: string,
targetLang: string
): Promise<string> {
const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_KEY;

const response = await fetch(
`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
{
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
q: text,
source: sourceLang,
target: targetLang
})
}
);

const data = await response.json();
return data.data.translations[0].translatedText;
} 4. UI BEHAVIOR SPECIFICATIONS
Translation icon behavior:

Translation icon (A⇄B) appears ONLY on hover over example sentences and source sentence

On hover: Show icon aligned to right of sentence

On click: Fetch translation via Google Translate API and display as tooltip below sentence

Tooltip persists until user clicks outside or hovers away (300ms delay)

TTS button behavior:

Speaker icon (🔊) visible on hover next to word pronunciation and each example sentence

On click: Use Web Speech API to speak text in source language

Visual feedback: Pulse animation while speaking

Source section:

Display original sentence from which word was clicked

"View in text →" link calls onNavigateToSource(textPosition) to scroll main reader

Translation icon on hover (same behavior as example sentences)

Add to vocabulary:

Blue CTA button at bottom

On click: Call onAddToVocabulary(word) to save word to user's vocab collection

Show success toast/checkmark feedback

5. COMPONENT IMPLEMENTATION
   File: DefinitionCard.tsx

typescript
import React, { useState, useEffect } from 'react';
import { fetchDefinition } from './services/gemini';
import { translateText } from './services/translation';

export function DefinitionCard(props: DefinitionCardProps) {
const [definition, setDefinition] = useState<GeminiDefinitionResponse | null>(null);
const [loading, setLoading] = useState(true);
const [translations, setTranslations] = useState<Record<string, string>>({});
const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);

useEffect(() => {
fetchDefinition(
props.word,
props.sourceSentence,
props.sourceLanguage,
props.targetLanguage
)
.then(setDefinition)
.finally(() => setLoading(false));
}, [props.word]);

const handleTranslateClick = async (text: string, key: string) => {
if (translations[key]) return; // Already translated

    const translated = await translateText(
      text,
      props.sourceLanguage,
      props.targetLanguage
    );
    setTranslations(prev => ({ ...prev, [key]: translated }));

};

const handleSpeak = (text: string) => {
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = props.sourceLanguage;
speechSynthesis.speak(utterance);
};

if (loading) return <div>Loading definition...</div>;
if (!definition) return <div>Error loading definition</div>;

return (
<div className="definition-card">
{/_ HEADER _/}
<div className="header">
<h2>{definition.word}</h2>
<button onClick={() => handleSpeak(definition.word)} className="speak-btn">
🔊
</button>
</div>

      <div className="phonetic">
        {definition.pronunciation} · {definition.partOfSpeech}
      </div>

      {/* TRANSLATIONS BAR */}
      <div className="translations-bar">
        {definition.definitions[0]?.translations.join(' · ')}
      </div>

      {/* DEFINITIONS */}
      {definition.definitions.map((def, idx) => (
        <div key={idx} className="definition-item">
          <div className="sense-header">
            <span className="sense-number">{idx + 1}.</span>
            <span className="sense-label">{def.senseLabel}</span>
          </div>
          <p className="meaning">{def.meaning}</p>

          <div
            className="example-container"
            onMouseEnter={() => setHoveredSentence(`ex-${idx}`)}
            onMouseLeave={() => setHoveredSentence(null)}
          >
            <p className="example">"{def.example}"</p>

            {hoveredSentence === `ex-${idx}` && (
              <button
                className="translate-icon"
                onClick={() => handleTranslateClick(def.example, `ex-${idx}`)}
              >
                A⇄B
              </button>
            )}

            <button onClick={() => handleSpeak(def.example)} className="speak-btn-small">
              🔊
            </button>

            {translations[`ex-${idx}`] && (
              <div className="translation-tooltip">
                {translations[`ex-${idx}`]}
              </div>
            )}
          </div>

          <div className="translation-pills">
            {def.translations.map((t, i) => (
              <span key={i} className="pill">{t}</span>
            ))}
          </div>
        </div>
      ))}

      {/* SOURCE SECTION */}
      <div className="source-section">
        <p className="source-label">source</p>
        <div
          className="source-sentence-container"
          onMouseEnter={() => setHoveredSentence('source')}
          onMouseLeave={() => setHoveredSentence(null)}
        >
          <p className="source-sentence">{props.sourceSentence}</p>

          {hoveredSentence === 'source' && (
            <button
              className="translate-icon"
              onClick={() => handleTranslateClick(props.sourceSentence, 'source')}
            >
              A⇄B
            </button>
          )}

          <button onClick={() => handleSpeak(props.sourceSentence)} className="speak-btn-small">
            🔊
          </button>
        </div>

        {translations['source'] && (
          <div className="translation-tooltip">{translations['source']}</div>
        )}

        <button
          className="view-in-text-link"
          onClick={() => props.onNavigateToSource(props.textPosition)}
        >
          View in text →
        </button>
      </div>

      {/* ADD TO VOCABULARY CTA */}
      <button
        className="add-vocab-btn"
        onClick={() => props.onAddToVocabulary(props.word)}
      >
        🎓 Add to vocabulary
      </button>
    </div>

);
} 6. ENVIRONMENT VARIABLES
File: .env

text
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GOOGLE_TRANSLATE_KEY=your_google_translate_key_here 7. STYLING GUIDELINES
Header: Large font (24px), pronunciation button aligned right

Phonetic: Muted gray, 14px, below word

Translations bar: Pills with light background, separated by middot (·)

Sense labels: Italic, smaller (12px), muted color

Examples: Quoted, 14px, with sufficient padding

Translation icon: Absolute positioned right side, fade-in on hover

Translation tooltip: Light background, small shadow, positioned below sentence

Source section: Light gray background box, separated from definitions

Add to vocabulary: Full-width blue button, 16px text, icon prefix

VALIDATION CHECKLIST
Gemini API returns structured JSON with all fields

Translation icon only appears on hover

Translation tooltip persists after clicking icon

TTS works for word + all examples + source

"View in text" scrolls to correct position

"Add to vocabulary" triggers callback with word

Loading state displays before definition loads

Error handling for API failures
