# Design Document: Theme and Enhancements

## Overview

This feature enhances the existing Expense & Budget Visualizer with three key capabilities: dark/light theme switching, custom category management, and transaction sorting. The design maintains the application's vanilla JavaScript architecture while adding new modules that integrate seamlessly with the existing codebase.

The enhancements follow the established modular pattern with clear separation of concerns. A new ThemeManager handles theme switching and persistence, CategoryManager extends the category system beyond the fixed three defaults, and SortManager provides flexible transaction ordering. All new features persist user preferences to Local Storage and integrate with the existing AppState, UIRenderer, and ChartManager modules.

## Architecture

### Enhanced Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HTML (index.html)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Theme Toggle │  │ Input Form   │  │ Transaction List │  │
│  │ (NEW)        │  │ (Enhanced)   │  │ (Enhanced)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Category Mgmt│  │ Sort Controls│  │ Total Balance    │  │
│  │ (NEW)        │  │ (NEW)        │  │ Display          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Pie Chart Canvas (Chart.js)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              JavaScript (js/app.js)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Application State Manager                  │  │
│  │  - transactions: Transaction[]                        │  │
│  │  - chartInstance: Chart | null                        │  │
│  │  - customCategories: string[] (NEW)                   │  │
│  │  - sortPreference: SortConfig (NEW)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Storage      │  │ UI Renderer  │  │ Chart Manager    │ │
│  │ Module       │  │ (Enhanced)   │  │ (Enhanced)       │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ ThemeManager │  │ Category     │  │ SortManager      │ │
│  │ (NEW)        │  │ Manager(NEW) │  │ (NEW)            │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser Local Storage                           │
│  - expense_transactions (existing)                          │
│  - theme_preference (NEW)                                   │
│  - custom_categories (NEW)                                  │
│  - sort_preference (NEW)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

The new modules integrate with existing components:

1. **ThemeManager** → CSS Variables: Updates root CSS custom properties
2. **ThemeManager** → ChartManager: Triggers chart color updates on theme change
3. **CategoryManager** → FormHandler: Provides dynamic category options
4. **CategoryManager** → UIRenderer: Updates category display in transaction list
5. **SortManager** → AppState: Provides sorted transaction arrays
6. **SortManager** → UIRenderer: Triggers list re-rendering on sort change

## Components and Interfaces

### 1. ThemeManager (NEW)

Manages theme switching, persistence, and CSS variable updates.

```javascript
const ThemeManager = {
  currentTheme: 'light',
  STORAGE_KEY: 'theme_preference',
  
  init() {
    // Load saved theme preference
    // Apply theme to document
    // Set up toggle event listener
    // Update chart colors if needed
  },
  
  loadTheme() {
    // Retrieve theme from Local Storage
    // Return 'light' or 'dark'
    // Default to 'light' if not found
  },
  
  applyTheme(theme) {
    // Update CSS custom properties
    // Add/remove theme class on body
    // Update chart colors
    // Save to Local Storage
  },
  
  toggleTheme() {
    // Switch between light and dark
    // Apply new theme
    // Update toggle button state
  },
  
  getThemeColors() {
    // Return color palette for current theme
    // Used by ChartManager for chart colors
  }
};
```

### 2. CategoryManager (NEW)

Manages custom categories with validation and persistence.

```javascript
const CategoryManager = {
  customCategories: [],
  MAX_CUSTOM_CATEGORIES: 10,
  STORAGE_KEY: 'custom_categories',
  
  init() {
    // Load custom categories from storage
    // Render category management UI
    // Set up event listeners
  },
  
  loadCategories() {
    // Retrieve from Local Storage
    // Validate structure
    // Return array of custom category names
  },
  
  addCategory(name) {
    // Validate name (non-empty, alphanumeric + spaces)
    // Check for duplicates (case-insensitive)
    // Check max limit (10)
    // Add to customCategories array
    // Save to storage
    // Update form dropdown
    // Return success/error
  },
  
  deleteCategory(name) {
    // Check if category has associated transactions
    // If yes, prevent deletion and show warning
    // If no, remove from customCategories
    // Save to storage
    // Update form dropdown
    // Return success/error
  },
  
  getAllCategories() {
    // Return array of default + custom categories
    // Default: ['Food', 'Transport', 'Fun']
    // Combined with customCategories
  },
  
  validateCategoryName(name) {
    // Check non-empty
    // Check alphanumeric + spaces only
    // Check max length (20 characters)
    // Return validation result
  },
  
  categoryHasTransactions(name) {
    // Check if any transactions use this category
    // Return boolean
  }
};
```

### 3. SortManager (NEW)

Manages transaction sorting with multiple criteria and persistence.

```javascript
const SortManager = {
  currentSort: {
    field: 'date',      // 'date', 'amount', or 'category'
    order: 'desc'       // 'asc' or 'desc'
  },
  STORAGE_KEY: 'sort_preference',
  
  init() {
    // Load sort preference from storage
    // Render sort controls
    // Set up event listeners
  },
  
  loadSortPreference() {
    // Retrieve from Local Storage
    // Validate structure
    // Return sort config or default
  },
  
  setSortPreference(field, order) {
    // Update currentSort
    // Save to storage
    // Trigger transaction list re-render
  },
  
  sortTransactions(transactions) {
    // Clone transactions array
    // Apply sort based on currentSort.field
    // Apply order (asc/desc)
    // Return sorted array
  },
  
  sortByAmount(transactions, order) {
    // Sort by amount field
    // Descending: highest first
    // Ascending: lowest first
  },
  
  sortByCategory(transactions, order) {
    // Sort alphabetically by category name
    // Ascending: A-Z
    // Descending: Z-A
  },
  
  sortByDate(transactions, order) {
    // Sort by transaction ID (contains timestamp)
    // Descending: newest first
    // Ascending: oldest first
  }
};
```

### 4. Enhanced AppState

Extended to support custom categories and sorting.

```javascript
const AppState = {
  transactions: [],
  chartInstance: null,
  customCategories: [],      // NEW
  sortPreference: {},        // NEW
  
  init() {
    // Initialize ThemeManager (NEW)
    // Initialize CategoryManager (NEW)
    // Initialize SortManager (NEW)
    // Load transactions from storage
    // Initialize ChartManager
    // Render initial UI
    // Set up event listeners
  },
  
  addTransaction(itemName, amount, category) {
    // Validate category against all categories (default + custom)
    // Create transaction
    // Add to transactions array
    // Save to storage
    // Apply current sort
    // Update UI and chart
  },
  
  deleteTransaction(id) {
    // Remove transaction
    // Save to storage
    // Apply current sort
    // Update UI and chart
  },
  
  getSortedTransactions() {
    // Get transactions from SortManager
    // Return sorted array
  },
  
  getCategoryTotals() {
    // Calculate spending for all categories (default + custom)
    // Return object with category totals
  }
};
```

### 5. Enhanced UIRenderer

Extended to support theme-aware rendering and custom categories.

```javascript
const UIRenderer = {
  errorTimeout: null,
  
  renderTransactionList(transactions) {
    // Get sorted transactions from SortManager
    // Clear existing list
    // Create DOM elements for each transaction
    // Apply theme-aware styling
    // Attach delete event listeners
  },
  
  renderCategoryOptions() {
    // Get all categories from CategoryManager
    // Update form dropdown with default + custom categories
    // Maintain selected value if exists
  },
  
  renderCategoryManagement() {
    // Render custom category list
    // Render add category form
    // Show count (X/10 custom categories)
    // Disable add button if at max
  },
  
  renderSortControls() {
    // Render sort field selector (Amount, Category, Date)
    // Render order toggle (Asc/Desc)
    // Highlight current sort preference
  },
  
  renderThemeToggle() {
    // Render theme toggle button
    // Update button icon/text based on current theme
    // Add accessibility attributes
  }
};
```

### 6. Enhanced ChartManager

Extended to support theme-aware colors and custom categories.

```javascript
const ChartManager = {
  chartInstance: null,
  fallbackMode: false,
  
  init() {
    // Create Chart.js instance
    // Apply theme-aware colors
    // Configure options
  },
  
  update(categoryTotals) {
    // Filter zero-value categories
    // Apply theme-aware colors
    // Update chart data
    // Trigger re-render
  },
  
  updateThemeColors() {
    // Get colors from ThemeManager
    // Update chart background colors
    // Update chart text colors
    // Trigger re-render
  },
  
  getCategoryColor(categoryName, theme) {
    // Return color for category based on theme
    // Default categories: predefined colors
    // Custom categories: generated colors
  }
};
```

## Data Models

### Theme Preference

```javascript
{
  theme: string  // 'light' or 'dark'
}
```

Example:
```javascript
{
  theme: 'dark'
}
```

### Custom Categories Array

```javascript
[
  string,  // Category name (max 20 chars, alphanumeric + spaces)
  ...
]
```

Example:
```javascript
[
  'Healthcare',
  'Entertainment',
  'Utilities'
]
```

### Sort Preference

```javascript
{
  field: string,  // 'date', 'amount', or 'category'
  order: string   // 'asc' or 'desc'
}
```

Example:
```javascript
{
  field: 'amount',
  order: 'desc'
}
```

### Enhanced Transaction (unchanged structure, expanded category values)

```javascript
{
  id: string,           // Unique identifier
  itemName: string,     // Name of expense item
  amount: number,       // Expense amount
  category: string      // Default or custom category name
}
```

Example with custom category:
```javascript
{
  id: "1704067200000-abc123",
  itemName: "Doctor visit",
  amount: 75.00,
  category: "Healthcare"
}
```

### Local Storage Schema

```javascript
// Key: "theme_preference"
{
  "theme": "dark"
}

// Key: "custom_categories"
[
  "Healthcare",
  "Entertainment",
  "Utilities"
]

// Key: "sort_preference"
{
  "field": "amount",
  "order": "desc"
}

// Key: "expense_transactions" (existing, unchanged)
[
  {
    "id": "1704067200000-abc123",
    "itemName": "Doctor visit",
    "amount": 75.00,
    "category": "Healthcare"
  }
]
```

## CSS Variable Approach for Theming

### Root CSS Variables

```css
:root {
  /* Light theme (default) */
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
  --color-text-primary: #2c3e50;
  --color-text-secondary: #7f8c8d;
  --color-background: #f8f9fa;
  --color-surface: #ffffff;
  --color-border: #e1e8ed;
  
  /* Chart colors */
  --chart-food: #FF6384;
  --chart-transport: #36A2EB;
  --chart-fun: #FFCE56;
  --chart-text: #666666;
  --chart-grid: #e0e0e0;
}

body.dark-theme {
  /* Dark theme overrides */
  --color-primary: #5ba3ff;
  --color-primary-dark: #4a90e2;
  --color-text-primary: #e8e8e8;
  --color-text-secondary: #b0b0b0;
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-border: #404040;
  
  /* Chart colors for dark theme */
  --chart-food: #ff7a9a;
  --chart-transport: #4fb8ff;
  --chart-fun: #ffd966;
  --chart-text: #e8e8e8;
  --chart-grid: #404040;
}
```

### Theme Transition

```css
body {
  transition: background-color 300ms ease-in-out,
              color 300ms ease-in-out;
}

.balance-section,
.form-section,
.transactions-section,
.chart-section {
  transition: background-color 300ms ease-in-out,
              color 300ms ease-in-out,
              border-color 300ms ease-in-out;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

Reviewing all testable properties from prework to eliminate redundancy:

**Theme Properties:**
- 1.3 and 1.4 (dark/light theme color requirements) can be combined into a single property that validates theme colors meet requirements for the active theme
- 1.5 and 1.6 (theme persistence) form a round-trip property that can be combined

**Category Properties:**
- 2.2, 2.5, and 2.6 (add category, persist, load) can be combined into a round-trip property
- 2.8 and 2.9 (delete control exists, deletion works) - 2.8 is redundant if 2.9 works (you can't delete without a control)

**Sort Properties:**
- 3.6 and 3.7 (sort persistence) form a round-trip property that can be combined

**Consolidation Decisions:**
1. Combine 1.3 and 1.4 into "Theme color requirements"
2. Combine 1.5 and 1.6 into "Theme persistence round-trip"
3. Combine 2.2, 2.5, and 2.6 into "Custom category round-trip"
4. Remove 2.8 as redundant (covered by 2.9)
5. Combine 3.6 and 3.7 into "Sort preference round-trip"

### Property 1: Theme Toggle Switches State

*For any* current theme state (light or dark), clicking the theme toggle should switch to the opposite theme and update the UI accordingly.

**Validates: Requirements 1.2**

### Property 2: Theme Color Requirements

*For any* active theme (light or dark), all background colors should meet the luminance requirements for that theme (dark: <20%, light: >80% for backgrounds), and text colors should provide adequate contrast (dark theme: text >80% luminance, light theme: text <20% luminance).

**Validates: Requirements 1.3, 1.4, 4.1, 4.2**

### Property 3: Theme Contrast Ratios

*For any* text element in dark theme, the contrast ratio between text and background should be at least 4.5:1 for normal text.

**Validates: Requirements 4.3**

### Property 4: Theme Persistence Round-Trip

*For any* theme preference (light or dark), setting the theme, saving to Local Storage, and reloading the application should restore the same theme preference.

**Validates: Requirements 1.5, 1.6**

### Property 5: Chart Colors Update With Theme

*For any* theme change, the chart colors should update to theme-appropriate values within the update cycle.

**Validates: Requirements 4.4**

### Property 6: Custom Category Addition

*For any* valid custom category name (non-empty, alphanumeric + spaces, max 20 chars, non-duplicate, under limit), adding it should make it appear in the category options.

**Validates: Requirements 2.2**

### Property 7: Custom Category Name Validation

*For any* string that is empty, contains non-alphanumeric characters (except spaces), or exceeds 20 characters, attempting to add it as a custom category should be rejected.

**Validates: Requirements 2.3, 5.5**

### Property 8: Custom Category Duplicate Prevention

*For any* existing category name (default or custom), attempting to add a custom category with the same name (case-insensitive) should be rejected.

**Validates: Requirements 2.4**

### Property 9: Custom Category Round-Trip

*For any* set of valid custom categories, adding them, saving to Local Storage, and reloading the application should restore all custom categories.

**Validates: Requirements 2.5, 2.6**

### Property 10: Default Categories Invariant

*For any* sequence of operations (adding custom categories, deleting custom categories, adding transactions, deleting transactions), the three default categories (Food, Transport, Fun) should always be present in the category options.

**Validates: Requirements 2.7**

### Property 11: Custom Category Deletion

*For any* custom category without associated transactions, deleting it should remove it from the category options.

**Validates: Requirements 2.9**

### Property 12: Protected Category Deletion

*For any* custom category that has associated transactions, attempting to delete it should fail, keep the category in the options, and display a warning message.

**Validates: Requirements 2.10**

### Property 13: Transaction Category Validation

*For any* transaction in the application, its category value should match either a default category or an existing custom category.

**Validates: Requirements 5.2**

### Property 14: Sort By Amount

*For any* list of transactions, when sorted by amount in descending order, each transaction's amount should be greater than or equal to the next transaction's amount.

**Validates: Requirements 3.2**

### Property 15: Sort By Category

*For any* list of transactions, when sorted by category alphabetically, the category names should be in lexicographic order.

**Validates: Requirements 3.3**

### Property 16: Sort Order Re-Rendering

*For any* sort preference change, the transaction list in the DOM should reflect the new sort order immediately after the change.

**Validates: Requirements 3.5**

### Property 17: Sort Preference Round-Trip

*For any* sort preference (field and order), setting the preference, saving to Local Storage, and reloading the application should restore the same sort preference.

**Validates: Requirements 3.6, 3.7**

### Property 18: Custom Category Limit Enforcement

*For any* application state with 10 custom categories, attempting to add an 11th custom category should be rejected.

**Validates: Requirements 8.1**

### Property 19: Theme Toggle Keyboard Accessibility

*For any* keyboard event (Enter or Space) on the focused theme toggle, the theme should switch to the opposite theme.

**Validates: Requirements 7.3**

### Property 20: Theme Toggle ARIA Label

*For any* theme state (light or dark), the theme toggle should have an ARIA label that describes the current state or the action that will be performed.

**Validates: Requirements 7.4**

## Error Handling

### Theme Switching Errors

**Scenario**: CSS variables fail to update or theme class fails to apply

**Handling**:
- Wrap theme application in try-catch block
- Log error to console: "Failed to apply theme"
- Revert to previous theme state
- Display user message: "Theme change failed. Please try again."
- Continue app functionality with previous theme

### Custom Category Validation Errors

**Scenario 1**: User attempts to add invalid category name

**Handling**:
- Validate before adding to array
- Display specific error messages:
  - "Category name cannot be empty"
  - "Category name can only contain letters, numbers, and spaces"
  - "Category name must be 20 characters or less"
  - "This category already exists"
- Keep add category form visible
- Focus on input field for correction

**Scenario 2**: User attempts to delete category with transactions

**Handling**:
- Check for associated transactions before deletion
- Display warning: "Cannot delete category 'X' because it has Y transaction(s). Delete those transactions first."
- Prevent deletion
- Keep category in list
- Highlight affected transactions (optional enhancement)

**Scenario 3**: Maximum custom categories reached

**Handling**:
- Disable add category button
- Display message: "Maximum of 10 custom categories reached"
- Allow deletion of existing categories to make room
- Re-enable add button when below limit

### Custom Category Storage Errors

**Scenario**: Custom categories fail to save to Local Storage

**Handling**:
- Catch storage errors (quota exceeded, unavailable)
- Log error to console
- Display warning: "Failed to save custom categories. Changes may not persist."
- Allow app to continue functioning with in-memory categories
- Retry save on next operation

### Sort Preference Errors

**Scenario**: Invalid sort preference loaded from Local Storage

**Handling**:
- Validate sort preference structure on load
- Check field is one of: 'date', 'amount', 'category'
- Check order is one of: 'asc', 'desc'
- If invalid, use default: {field: 'date', order: 'desc'}
- Log warning to console: "Invalid sort preference, using default"
- Continue with default sort

### Orphaned Category Handling

**Scenario**: Transaction references a deleted custom category

**Handling**:
- Detect orphaned categories on load
- Display transaction with category name
- Add visual indicator (e.g., "(inactive)" suffix or grayed out)
- Allow transaction to remain in list
- Allow deletion of transaction
- Prevent re-adding transactions with orphaned categories
- Log warning: "Found transactions with deleted categories"

### Chart Update Errors

**Scenario**: Chart fails to update with theme colors or custom categories

**Handling**:
- Wrap chart update in try-catch
- Log error to console: "Failed to update chart"
- Attempt to re-initialize chart
- If re-initialization fails, switch to fallback mode
- Display text-based category totals
- Continue app functionality without chart

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive coverage. This ensures both concrete edge cases and general correctness across all possible inputs.

### Property-Based Testing

**Library**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: theme-and-enhancements, Property {number}: {property_text}`

**Property Test Implementation**:

Each of the 20 correctness properties will be implemented as a property-based test:

1. **Property 1 Test**: Generate random theme states, toggle, verify opposite theme applied
2. **Property 2 Test**: For each theme, verify CSS variables meet luminance requirements
3. **Property 3 Test**: Generate random text elements in dark theme, verify contrast ratios
4. **Property 4 Test**: Generate random theme preferences, verify save/load round-trip
5. **Property 5 Test**: Generate theme changes, verify chart colors update
6. **Property 6 Test**: Generate random valid category names, verify addition works
7. **Property 7 Test**: Generate random invalid strings, verify rejection
8. **Property 8 Test**: Generate random existing category names with case variations, verify rejection
9. **Property 9 Test**: Generate random custom category sets, verify save/load round-trip
10. **Property 10 Test**: Generate random operation sequences, verify default categories always present
11. **Property 11 Test**: Generate random custom categories without transactions, verify deletion works
12. **Property 12 Test**: Generate random custom categories with transactions, verify deletion blocked
13. **Property 13 Test**: Generate random transactions, verify all have valid categories
14. **Property 14 Test**: Generate random transaction lists, verify amount sort order
15. **Property 15 Test**: Generate random transaction lists, verify category sort order
16. **Property 16 Test**: Generate random sort changes, verify DOM updates
17. **Property 17 Test**: Generate random sort preferences, verify save/load round-trip
18. **Property 18 Test**: Generate state with 10 categories, verify 11th rejected
19. **Property 19 Test**: Generate random keyboard events on toggle, verify theme switches
20. **Property 20 Test**: For each theme state, verify ARIA label exists and is appropriate

**Custom Generators**:
- `arbitraryTheme()`: Generates 'light' or 'dark'
- `arbitraryValidCategoryName()`: Generates valid category names (alphanumeric + spaces, 1-20 chars)
- `arbitraryInvalidCategoryName()`: Generates invalid category names
- `arbitraryCategoryList()`: Generates arrays of custom categories (0-10)
- `arbitrarySortPreference()`: Generates valid sort configurations
- `arbitraryTransactionWithCustomCategory()`: Generates transactions with custom categories

### Unit Testing

**Library**: Jest or Vitest (JavaScript testing framework)

**Focus Areas**:

1. **Specific Examples**:
   - Theme toggle button exists in DOM (1.1)
   - Add category control exists in DOM (2.1)
   - Sort controls exist in DOM (3.1, 3.4)
   - Default theme is light when no preference exists (1.7)
   - Default sort is by date descending when no preference exists (3.8)
   - Custom categories stored as separate array in Local Storage (5.1)
   - Orphaned category transactions display with inactive marker (5.3, 5.4)
   - Theme toggle is keyboard accessible (7.1)
   - Theme toggle shows focus indicator (7.2)
   - Add button disabled at 10 categories (8.2)
   - Max categories message displayed at limit (8.3)

2. **Edge Cases**:
   - Adding custom category with exactly 20 characters
   - Adding custom category with 21 characters (should fail)
   - Deleting last custom category
   - Switching themes rapidly multiple times
   - Adding transaction with custom category then deleting category
   - Sorting empty transaction list
   - Sorting list with single transaction
   - Sorting list with all same amounts
   - Sorting list with all same categories
   - Theme toggle with corrupted theme preference in storage
   - Custom categories with corrupted data in storage
   - Sort preference with corrupted data in storage

3. **Integration Points**:
   - Theme change triggers chart color update
   - Custom category addition updates form dropdown
   - Custom category deletion updates form dropdown
   - Sort change triggers transaction list re-render
   - Transaction addition respects current sort order
   - Transaction deletion respects current sort order
   - Theme preference persists across page reload
   - Custom categories persist across page reload
   - Sort preference persists across page reload

4. **Error Conditions**:
   - Local Storage quota exceeded when saving theme
   - Local Storage quota exceeded when saving custom categories
   - Local Storage quota exceeded when saving sort preference
   - Local Storage unavailable (private browsing)
   - Invalid theme value in Local Storage
   - Invalid custom category data in Local Storage
   - Invalid sort preference in Local Storage
   - Chart fails to update with theme colors
   - Attempting to delete category with transactions

### Test Organization

```
tests/
├── unit/
│   ├── theme-manager.test.js
│   ├── category-manager.test.js
│   ├── sort-manager.test.js
│   ├── theme-integration.test.js
│   ├── category-integration.test.js
│   ├── sort-integration.test.js
│   └── edge-cases.test.js
└── property/
    ├── theme-properties.property.test.js
    ├── category-properties.property.test.js
    ├── sort-properties.property.test.js
    └── integration-properties.property.test.js
```

### Testing Guidelines

**Unit Tests**:
- Keep tests focused on single behaviors
- Use descriptive test names following "should..." pattern
- Mock Local Storage for isolation
- Mock Chart.js for theme color tests
- Aim for fast execution (<100ms per test)
- Test both success and failure paths

**Property Tests**:
- Each property test should map to exactly one correctness property
- Use shrinking to find minimal failing cases
- Log generated inputs for debugging failures
- Set appropriate size parameters for generators
- Test with realistic data ranges (e.g., 0-100 transactions)

**Coverage Goals**:
- 90%+ code coverage for new modules (ThemeManager, CategoryManager, SortManager)
- 100% coverage of error handling paths
- All 20 correctness properties implemented as property tests
- All edge cases covered by unit tests

### Manual Testing Checklist

While automated tests provide comprehensive coverage, manual testing should verify:

- Theme toggle button is visually appealing and intuitive
- Dark theme is comfortable to read in low light
- Light theme is comfortable to read in bright light
- Theme transition animation is smooth (300ms)
- Custom category UI is easy to understand and use
- Sort controls are intuitive and responsive
- All features work across different screen sizes (320px, 768px, 1920px)
- Keyboard navigation works for all new controls
- Focus indicators are visible and clear
- ARIA labels are appropriate and helpful
- Chart colors are visually distinct in both themes
- Custom category colors are distinguishable
- Error messages are clear and actionable
- Warning messages are appropriately styled
- App works in Chrome, Firefox, Safari, and Edge

### Performance Testing

While not part of automated test suite, manual performance verification:

- Theme change completes within 300ms (Requirement 4.5)
- Sort operation completes within 200ms for 1000 transactions (Requirement 6.1)
- UI remains responsive during sort operations
- No visual lag when switching themes
- No memory leaks from repeated theme switches
- No memory leaks from repeated sort operations
