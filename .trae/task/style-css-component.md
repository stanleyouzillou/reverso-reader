Here's the comprehensive CSS styling brief **(5,104 characters)** to achieve the clean, compact design from your reference:

---

**CSS STYLING BRIEF: Definition Card Component**

**Design Reference**: Replicate the clean, compact layout from the attached image with proper hierarchy and spacing.

**Container & Layout**:

```css
.definition-card {
  display: flex;
  flex-direction: column;
  height: 50vh; /* Half sidebar height */
  overflow-y: auto;
  padding: 20px;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
}

/* Smooth scrollbar */
.definition-card::-webkit-scrollbar {
  width: 6px;
}
.definition-card::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
```

**Header Section** (word + pronunciation):

```css
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.speak-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.speak-btn:hover {
  opacity: 1;
}

.phonetic {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  font-weight: 400;
}
```

**Translations Bar**:

```css
.translations-bar {
  font-size: 14px;
  color: #374151;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
  font-weight: 500;
}
```

**Definition Items** (each sense):

```css
.definition-item {
  margin-bottom: 20px;
}

.sense-header {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 4px;
}

.sense-number {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.sense-label {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.meaning {
  font-size: 14px;
  color: #111827;
  margin: 4px 0 8px 0;
  font-weight: 600;
}

.example-container {
  position: relative;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.example {
  font-size: 13px;
  color: #4b5563;
  margin: 0;
  flex: 1;
  line-height: 1.6;
}

.translate-icon {
  position: absolute;
  right: 32px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.example-container:hover .translate-icon {
  opacity: 1;
}

.speak-btn-small {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  flex-shrink: 0;
}
.speak-btn-small:hover {
  opacity: 1;
}

.translation-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #374151;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.translation-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pill {
  background: #eff6ff;
  color: #1e40af;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
```

**Source Section**:

```css
.source-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
}

.source-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
}

.source-sentence-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.source-sentence {
  font-size: 13px;
  color: #374151;
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

.view-in-text-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.view-in-text-link:hover {
  text-decoration: underline;
}
```

**Add to Vocabulary CTA**:

```css
.add-vocab-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  transition: background 0.2s;
}
.add-vocab-btn:hover {
  background: #1d4ed8;
}
```

**Loading & Error States**:

```css
.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  font-size: 14px;
  color: #6b7280;
}
```

**Key Design Principles**:

- **Hierarchy**: Use font-size (28px → 14px → 13px → 12px → 11px) and font-weight (700 → 600 → 500 → 400) for clear visual hierarchy
- **Spacing**: Consistent 4px, 8px, 12px, 16px, 20px intervals (8px base unit system)
- **Colors**: Gray-scale from Tailwind (#111827 → #374151 → #6B7280 → #9CA3AF), blue accents (#2563EB)
- **Compactness**: Tight line-height (1.5-1.6), minimal padding, efficient use of vertical space
- **Interactivity**: Opacity transitions (0.2s), hover states on all interactive elements
- **Scroll**: Content scrollable within 50vh container, clean scrollbar styling

**Typography Scale**:

- Word title: 28px/700
- Meaning: 14px/600
- Examples: 13px/400
- Phonetic/pills: 13px-12px/500
- Labels/UI: 11-12px/600
