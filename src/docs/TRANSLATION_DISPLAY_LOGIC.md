# Translation Display Logic

This document outlines the implementation details for translation positioning, line spacing, and dictionary lookups in the Reverso Reader.

## 1. Inline Translation Positioning

Inline translations are designed to appear directly above the source text without obstructing readability.

### Rules
- **Alignment**: Translations always align with the **first word** of a selected chunk.
- **Horizontal Position**: Uses `left-0` on an absolute container relative to the first token. This ensures consistent positioning regardless of chunk length.
- **Vertical Position**: Uses `bottom-full` with a small margin (`mb-0.5`) to sit just above the token.
- **Constraints**: Max width is capped at `250px` with `whitespace-nowrap` to prevent excessive line wrapping while keeping the UI clean.

### Implementation
- **Component**: `Token.tsx`
- **State**: `isSelectionStart` prop determines if the current token should render the appended translation.

## 2. Dynamic Line Height Spacing

To prevent vertical collisions between inline translations and the text of the line above, a dynamic line height is calculated.

### Calculation Logic
The base line height is adjusted based on several factors:
- **Translation Mode**: If `inline` mode is active, the line height increases from `1.625` to `2.4`.
- **Complex Scripts**: Languages with taller characters (Japanese, Chinese, Korean, Arabic, Hindi, Thai) receive an additional `+0.2` boost.
- **Font Size**: 
  - Large fonts (>24px) receive a `-0.1` reduction (relative padding needs are lower).
  - Small fonts (<14px) receive a `+0.1` increase (readability boost).

### Implementation
- **Location**: `ReaderSurface.tsx` (via `useMemo`)
- **Application**: Applied as a CSS variable `--reader-line-height` and directly to the main content container's style.

## 3. Dictionary Functionality

Dictionary lookups are restricted to single words to provide precise definitions, even when the user is translating a larger phrase or chunk.

### Logic
- **Selection**: When a user clicks a word, the app calculates a "selection" (which might be a chunk).
- **Clicked Word**: The specific token index clicked is preserved as `clickedIndex` in the selection state.
- **Lookup**: The `ReaderSurface` orchestrator uses `clickedIndex` to extract only the specific clicked word for the dictionary sidebar, while still using the full chunk for the inline translation and history.

### Implementation
- **State**: `Selection` interface in `types.ts` now includes `clickedIndex`.
- **Orchestrator**: `ReaderSurface.tsx` handles the dual-dispatch (Chunk -> Translation API, Single Word -> Dictionary State).

## 4. Verification

Logic is verified via unit tests in `src/test/`:
- `utils.test.ts`: Verifies language-aware tokenization and word detection.
- `useWordSelection.test.ts`: Verifies chunk expansion and `clickedIndex` preservation.
