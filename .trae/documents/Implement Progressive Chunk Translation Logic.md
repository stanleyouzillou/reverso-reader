# Progressive Chunk Translation Implementation Plan

I will implement the progressive chunk translation logic by refining the selection state management and updating the translation service interface.

## 1. Refine Selection Logic (`src/hooks/useWordSelection.ts`)
*   **Strict Adjacency Check**: Replace the current loose boundary check with a strict "word adjacency" check. The logic will iterate between the current selection and the new click:
    *   If any **word** token is found (using `isWord`), the click is treated as **non-adjacent** (starts new selection).
    *   If any **sentence terminator** (`.`, `!`, `?`) is found, the click is treated as **non-adjacent** (starts new selection).
    *   If only whitespace/punctuation (non-terminators) are found, the click is treated as **adjacent** (expands selection).
*   **Fix Expansion Logic**: Correct the bug where expanding a selection discarded the original anchor point.
    *   If clicking *before*: `newStart = index`, `newEnd = existingSelection.end`.
    *   If clicking *after*: `newStart = existingSelection.start`, `newEnd = index`.

## 2. Update Translation Service Interface (`src/services/translation/`)
*   **Interface Update**: Modify `ITranslationService` to accept an optional `context` parameter: `translate(text, to, from, context?)`.
*   **Service Updates**: Update `GoogleTranslationService`, `ReversoTranslationService`, and `GeminiTranslationService` to match the new signature.
*   **Main Service**: Update `TranslationService.ts` to accept and pass the `context` parameter.

## 3. Integration (`src/components/ReaderSurface.tsx`)
*   **Context Extraction**: Implement a helper to extract the full sentence containing the selected phrase using the existing `allTokens` and sentence boundary logic.
*   **Translation Call**: Pass this full sentence as the `context` parameter when calling `translateText`.

## 4. Verification
*   **Test Case 1 (Adjacency)**: Click "labor", then "market". Result: Selection becomes "labor market", translation popup shows phrase translation.
*   **Test Case 2 (Gap)**: Click "labor", then "conditions" (skipping "market"). Result: Selection resets to just "conditions".
*   **Test Case 3 (Sentence Boundary)**: Click word at end of sentence, then word at start of next. Result: Selection resets to new word.
*   **Test Case 4 (Reverse)**: Click "market", then "labor". Result: Selection becomes "labor market".
