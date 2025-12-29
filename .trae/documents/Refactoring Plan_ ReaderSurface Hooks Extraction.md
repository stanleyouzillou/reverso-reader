I will proceed with the refactoring of `ReaderSurface.tsx` following the provided plan. I will start with **Phase 1: Immediate Extraction** to move logic into custom hooks.

### **Phase 1: Custom Hooks Extraction**
I will create a `src/hooks` directory and implement the following hooks:

1.  **`useTranslationEngine.ts`**
    *   **Goal**: Encapsulate translation API calls and caching.
    *   **Logic**: Move the `fetch('/api/translate')` logic, the `translationCache` (`useRef`), and the `loading` state management.
    *   **Output**: `{ translateText, cache, loading, error }`.

2.  **`useWordSelection.ts`**
    *   **Goal**: Manage word clicking and selection expansion.
    *   **Logic**: Move `handleWordClick`, the adjacency detection logic (expanding "labor" to "labor market"), and the `selection` state.
    *   **Output**: `{ selection, handleWordClick, clearSelection }`.

3.  **`useAudioPlayer.ts`**
    *   **Goal**: Manage karaoke and audio state.
    *   **Logic**: Move the `karaokeIndex` state, the `useEffect` with the interval timer, and auto-scroll logic.
    *   **Output**: `{ karaokeIndex, isPlaying, ... }`.

4.  **`useArticleIngestion.ts`**
    *   **Goal**: handle text processing.
    *   **Logic**: Move the `useMemo` blocks that split content into paragraphs, sentences, and tokens.
    *   **Output**: `{ paragraphs, l1Paragraphs, paragraphTokens, allTokens, pairedSentences }`.

5.  **`useVocabulary.ts`**
    *   **Goal**: Interface with the global store.
    *   **Logic**: Wrap `useStore` selectors for `addToHistory`, `history`, `saved`, etc.
    *   **Output**: `{ addToHistory, history, saved, ... }`.

### **Phase 2: Integration**
*   Refactor `ReaderSurface.tsx` to import and use these hooks instead of having the logic inline.
*   Verify that all features (Translation, Expansion, Karaoke, Dual Mode) still work as expected.

### **Next Steps (Phases 2 & 3)**
*   After the hooks are stable, I will proceed to extract the UI components (`FloatingAudioBar`, `ArticleRenderer`, etc.) and create the Service layer as outlined in your plan.

I will start by creating the `src/hooks` directory and the `useTranslationEngine` hook.