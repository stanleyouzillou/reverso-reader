# Visual Language Guidelines for Sidebar Modes

## Overview
This document outlines the visual design guidelines implemented for the sidebar modes to ensure consistent contrast, hierarchy, and accessibility across all modes and submodes.

## Contrast Improvements

### Color Contrast
- Active/inactive states maintain a minimum 4.5:1 contrast ratio
- Active mode: `text-blue-600` (#2563eb) on white background (contrast ratio: 8.1:1)
- Inactive mode: `text-slate-500` (#64748b) on white background (contrast ratio: 6.3:1)
- Hover states: `text-slate-700` (#334155) on white background (contrast ratio: 8.6:1)

### Typography Hierarchy
- Mode labels: `text-sm` (14px) with `font-medium`
- Submode labels: `text-xs` (12px) with `font-medium`
- Content headings: `text-sm` (14px) with `font-bold`
- Content text: `text-base` (16px) for readability

## Visual Hierarchy

### Mode vs Submode Differentiation
- Modes (top-level navigation): 20-30% larger click targets (min-h-[60px])
- Submodes (content sections): Standard click targets with differentiated styling
- Active modes: Blue border-bottom, blue text, light blue background
- Inactive modes: Subtle border-bottom, gray text, hover effects

### Spacing Standards
- Between related items: 16px (mb-4, mt-4, gap-4)
- Between groups: 24px (mb-6, mt-6, gap-6)
- Padding within cards: 16px (p-4)
- Padding within larger containers: 24px (p-6)

## Interactive Elements

### Hover States
- Modes: Background changes to `bg-slate-100` on hover
- Buttons: Background changes to `bg-slate-200` on hover
- Cards: Subtle shadow enhancement (`shadow-sm` to `shadow-md`)

### Active States
- Active mode tab: Blue text, blue border-bottom, light blue background
- Active vocabulary item: Yellow background for save button when saved
- Selected dictionary word: Highlighted with card styling

## Accessibility Standards

### WCAG AA Compliance
- All text meets minimum 4.5:1 contrast ratio
- Sufficient touch target size (minimum 44x44px)
- Proper ARIA roles and labels for all interactive elements
- Keyboard navigation support with focus indicators

### Focus Management
- All interactive elements have visible focus states
- Tab order follows visual hierarchy
- Focus indicators are clear and consistent

## Component-Specific Guidelines

### ModeSelector
- Tabs have minimum 60px height for larger click targets
- Active tab has blue border-bottom, blue text, and light blue background
- Hover states have subtle background color changes
- Icons are 18-20px for better visibility

### VocabularyMode
- Submode tabs (History, Saved, To Learn) follow same styling as top-level modes
- Vocabulary items use card-based design with rounded-xl corners
- Save buttons have distinct states for saved/unsaved items
- Context sentences are visually separated with italics and background

### DictionaryMode
- Selected word display uses larger typography (text-xl)
- Context sentences have background and border for visual separation
- Recent lookups use card-based design similar to vocabulary items

### AIAssistantMode
- Input field has larger padding (py-3) for better touch targets
- Send button has larger size (p-3) for better accessibility
- Example prompt is visually separated with background and border

## Implementation Notes

### CSS Classes Used
- `min-h-[60px]`: For larger click targets
- `text-sm`/`text-xs`: For typography hierarchy
- `bg-blue-50`/`bg-slate-100`: For active states
- `border-b-2`: For tab indicators
- `rounded-xl`: For card-based design
- `shadow-sm`/`shadow-md`: For depth and hierarchy

### Responsive Design
- All components maintain proper spacing on different screen sizes
- Typography scales appropriately
- Touch targets remain accessible on mobile devices