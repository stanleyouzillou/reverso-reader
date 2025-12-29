# Article Metadata System - Component API Documentation

## Overview
The article metadata system provides a comprehensive UI for displaying article information and managing different sidebar modes (Dictionary, Vocabulary, AI Assistant). The system includes reusable components for displaying article metadata and a mode-based sidebar for different user interactions.

## Components

### ArticleHeader
The main header component that displays article metadata in a minimalist design.

#### Props
- `title` (string): The title of the article
- `tags` (string[]): Array of category tags for the article
- `level` (string): CEFR level of the article (e.g., "B1", "C2")
- `matchScore` (number): Percentage match score (0-100)
- `wordCount` (number): Total word count of the article
- `estimatedMinutes` (number): Estimated reading time in minutes
- `className` (string, optional): Additional CSS classes

#### Usage
```jsx
<ArticleHeader 
  title="Article Title"
  tags={["BUSINESS", "PROFESSIONAL"]}
  level="B1"
  matchScore={78}
  wordCount={1200}
  estimatedMinutes={5}
/>
```

### ArticleTags
Displays article tags as pill-shaped badges.

#### Props
- `tags` (string[]): Array of tags to display
- `className` (string, optional): Additional CSS classes

### ArticleLevel
Displays the CEFR level of the article.

#### Props
- `level` (string): CEFR level (e.g., "A1", "B2", "C1")
- `className` (string, optional): Additional CSS classes

### MatchScore
Displays a circular progress visualization for the match score.

#### Props
- `score` (number): Percentage score (0-100)
- `className` (string, optional): Additional CSS classes

### ReadingStats
Displays word count and estimated reading time.

#### Props
- `wordCount` (number): Total word count
- `estimatedMinutes` (number): Estimated reading time in minutes
- `className` (string, optional): Additional CSS classes

### ModeSelector
A tab-based selector for switching between sidebar modes.

#### Props
- `activeMode` (SidebarMode): Current active mode ('dictionary' | 'vocabulary' | 'ai')
- `onModeChange` (function): Callback when mode changes
- `className` (string, optional): Additional CSS classes

## Sidebar Modes

### Dictionary Mode
Provides context definition lookup functionality.

#### Features
- Shows the last clicked word with its translation
- Displays context sentence where the word was found
- Shows recent lookups history
- Placeholder for detailed dictionary definitions

### Vocabulary Mode
Maintains the existing vocabulary management functionality.

#### Features
- History tab: Shows recently looked up words
- Saved tab: Shows saved vocabulary
- To Learn tab: Shows recommended words to learn
- Context sentences for each vocabulary item
- Save/unsave functionality

### AI Assistant Mode
Provides an interface for AI-powered article analysis.

#### Features
- Text input for asking questions about the article
- Placeholder for AI responses
- Example prompts for user guidance

## State Management

### Store Additions
The following state and actions were added to the global store:

#### New State Properties
- `sidebarMode` (SidebarMode): Current active sidebar mode ('dictionary' | 'vocabulary' | 'ai')
- `selectedDictionaryWord` (VocabItem | null): The currently selected word for dictionary lookup

#### New Actions
- `setSidebarMode(mode: SidebarMode)`: Sets the active sidebar mode
- `setSelectedDictionaryWord(word: VocabItem | null)`: Sets the selected word for dictionary lookup

### Integration Points
When a word is clicked in the article:
1. The translation is fetched and added to history
2. The word is set as the selected dictionary word
3. If the dictionary mode is active, the selected word is displayed immediately

## CSS Methodology
All components follow the BEM (Block Element Modifier) methodology for consistent and maintainable CSS classes. Tailwind CSS is used for styling with custom utility classes where needed.

## Accessibility Features
- Proper ARIA roles and labels for all interactive elements
- Keyboard navigation support
- Semantic HTML structure
- Screen reader compatibility
- Focus management for interactive elements