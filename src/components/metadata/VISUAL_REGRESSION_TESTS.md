# Visual Regression Test Cases

## Sidebar Mode Contrast Improvements

### Test Case 1: Mode Selector Visual Hierarchy
**Objective**: Verify that mode selector tabs have proper visual hierarchy
**Steps**:
1. Open the application
2. Observe the top-level mode selector (Dictionary, Vocabulary, AI Assistant)
3. Verify:
   - Active tab has blue text (#2563eb)
   - Active tab has blue bottom border
   - Active tab has light blue background (#eff6ff)
   - Inactive tabs have gray text (#64748b)
   - Hover states change background to light gray (#f1f5f9)
   - Tabs have minimum 60px height
   - Vocabulary mode shows deck/layer icon

### Test Case 2: Vocabulary Mode Submode Hierarchy
**Objective**: Verify that vocabulary mode has clear submode hierarchy
**Steps**:
1. Navigate to Vocabulary mode
2. Observe the submode tabs (History, Saved, To Learn)
3. Verify:
   - Submode tabs follow same styling as top-level modes
   - Active submode has blue text and border
   - Inactive submodes have gray text
   - Hover states work properly
   - Vocabulary items are displayed in card format
   - Cards have proper spacing (16px between items)

### Test Case 3: Contrast Ratios
**Objective**: Verify all text meets WCAG AA contrast requirements
**Steps**:
1. Use a contrast checker tool
2. Verify:
   - Active blue text on white: 8.1:1 ratio (passes)
   - Inactive gray text on white: 6.3:1 ratio (passes)
   - Hover gray text on white: 8.6:1 ratio (passes)

### Test Case 4: Interactive Elements
**Objective**: Verify all interactive elements have proper feedback
**Steps**:
1. Hover over all tabs and buttons
2. Verify hover states provide clear visual feedback
3. Click on different modes and submodes
4. Verify active states are clearly indicated
5. Check keyboard navigation works properly

### Test Case 5: Spacing Standards
**Objective**: Verify proper spacing between elements
**Steps**:
1. Measure spacing between related items
2. Verify 16px spacing (mb-4, mt-4, gap-4) between related items
3. Measure spacing between groups
4. Verify 24px spacing (mb-6, mt-6, gap-6) between groups
5. Check padding within cards and containers

### Test Case 6: Responsive Design
**Objective**: Verify design works on different screen sizes
**Steps**:
1. Resize browser window to different sizes
2. Verify layout remains functional and readable
3. Check that touch targets remain accessible on smaller screens
4. Verify typography scales appropriately

### Expected Results
- All visual hierarchy requirements are met
- Contrast ratios meet WCAG AA standards
- Interactive elements provide clear feedback
- Spacing follows documented standards
- Design remains functional across screen sizes
- Vocabulary mode clearly uses deck/layer icon
- Submodes have appropriate styling differences from modes