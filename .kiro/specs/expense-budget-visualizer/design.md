# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a client-side web application built with vanilla JavaScript, HTML, and CSS. The application provides a simple interface for tracking daily expenses across three categories (Food, Transport, Fun) with real-time visualization using Chart.js. All data persists in the browser's Local Storage, making it a zero-backend solution suitable for personal expense tracking.

The architecture follows a modular approach with clear separation between data management, UI rendering, and chart visualization. The application uses an event-driven model where user actions trigger state updates, which cascade to UI and storage updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     HTML (index.html)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Input Form   │  │ Transaction  │  │ Total Balance│  │
│  │              │  │ List         │  │ Display      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Pie Chart Canvas (Chart.js)             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              JavaScript (js/app.js)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Application State Manager              │  │
│  │  - transactions: Transaction[]                    │  │
│  │  - chartInstance: Chart | null                    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Storage      │  │ UI Renderer  │  │ Chart        │ │
│  │ Module       │  │              │  │ Manager      │ │
│  │              │  │              │  │              │ │
│  │ - save()     │  │ - render()   │  │ - update()   │ │
│  │ - load()     │  │ - clear()    │  │ - destroy()  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Browser Local Storage                       │
│  Key: "expense_transactions"                            │
│  Value: JSON string of Transaction[]                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- HTML5: Semantic markup for structure
- CSS3: Responsive styling with Flexbox/Grid
- Vanilla JavaScript (ES6+): Application logic
- Chart.js (v3.x): Pie chart visualization
- Local Storage API: Client-side persistence

### File Structure

```
expense-budget-visualizer/
├── index.html           # Main HTML structure
├── css/
│   └── styles.css       # All application styles
└── js/
    └── app.js           # All application logic
```

## Components and Interfaces

### 1. Application State Manager

The central state management module that coordinates all application operations.

```javascript
const AppState = {
  transactions: [],
  chartInstance: null,
  
  init() {
    // Initialize application
    // Load data from storage
    // Set up event listeners
    // Render initial UI
  },
  
  addTransaction(itemName, amount, category) {
    // Create new transaction
    // Add to transactions array
    // Save to storage
    // Update UI and chart
  },
  
  deleteTransaction(id) {
    // Remove transaction by id
    // Save to storage
    // Update UI and chart
  },
  
  calculateTotal() {
    // Sum all transaction amounts
    // Return total
  },
  
  getCategoryTotals() {
    // Calculate spending per category
    // Return object with category totals
  }
};
```

### 2. Storage Module

Handles all Local Storage operations with error handling.

```javascript
const StorageModule = {
  STORAGE_KEY: 'expense_transactions',
  
  save(transactions) {
    // Serialize transactions to JSON
    // Save to localStorage
    // Handle quota exceeded errors
  },
  
  load() {
    // Retrieve from localStorage
    // Parse JSON
    // Validate structure
    // Return transactions or empty array
  },
  
  clear() {
    // Remove data from localStorage
  }
};
```

### 3. UI Renderer

Manages DOM manipulation and UI updates.

```javascript
const UIRenderer = {
  renderTransactionList(transactions) {
    // Clear existing list
    // Create DOM elements for each transaction
    // Attach delete event listeners
    // Update DOM
  },
  
  updateTotalBalance(total) {
    // Format total as currency
    // Update balance display element
  },
  
  clearForm() {
    // Reset all form fields
  },
  
  showError(message) {
    // Display validation error
    // Auto-hide after timeout
  },
  
  hideError() {
    // Remove error message
  }
};
```

### 4. Chart Manager

Manages Chart.js pie chart lifecycle.

```javascript
const ChartManager = {
  chartInstance: null,
  
  init(canvasElement) {
    // Create initial Chart.js instance
    // Configure options
  },
  
  update(categoryTotals) {
    // Filter out zero-value categories
    // Update chart data
    // Trigger chart re-render
  },
  
  destroy() {
    // Clean up chart instance
  }
};
```

### 5. Form Handler

Validates and processes form submissions.

```javascript
const FormHandler = {
  validate(itemName, amount, category) {
    // Check for empty fields
    // Validate amount is positive number
    // Return validation result
  },
  
  handleSubmit(event) {
    // Prevent default form submission
    // Extract form values
    // Validate inputs
    // Call AppState.addTransaction if valid
    // Show error if invalid
  }
};
```

## Data Models

### Transaction

Represents a single expense entry.

```javascript
{
  id: string,           // Unique identifier (timestamp + random)
  itemName: string,     // Name of the expense item
  amount: number,       // Expense amount (positive number)
  category: string      // One of: "Food", "Transport", "Fun"
}
```

Example:
```javascript
{
  id: "1704067200000-abc123",
  itemName: "Lunch at cafe",
  amount: 15.50,
  category: "Food"
}
```

### Category Totals

Aggregated spending by category.

```javascript
{
  Food: number,
  Transport: number,
  Fun: number
}
```

Example:
```javascript
{
  Food: 45.75,
  Transport: 20.00,
  Fun: 35.50
}
```

### Local Storage Schema

```javascript
// Key: "expense_transactions"
// Value: JSON string
[
  {
    id: "1704067200000-abc123",
    itemName: "Lunch at cafe",
    amount: 15.50,
    category: "Food"
  },
  {
    id: "1704067300000-def456",
    itemName: "Bus ticket",
    amount: 2.50,
    category: "Transport"
  }
]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transaction Addition Completeness

*For any* valid transaction (non-empty item name, positive amount, valid category), when added to the application, the transaction list length should increase by one, the form fields should be cleared, and the total balance should equal the sum of all transaction amounts.

**Validates: Requirements 1.3, 1.5, 3.2, 3.3**

### Property 2: Input Validation Rejection

*For any* transaction submission where at least one field (item name, amount, or category) is empty or invalid, the application should reject the submission, display an error message, and leave the transaction list unchanged.

**Validates: Requirements 1.4**

### Property 3: Transaction Deletion Completeness

*For any* transaction in the transaction list, when the delete button is clicked, that transaction should be removed from the list, the total balance should be recalculated correctly, and the chart should update to reflect the new data.

**Validates: Requirements 2.4, 3.4, 4.2**

### Property 4: Total Balance Accuracy

*For any* set of transactions, the displayed total balance should always equal the sum of all transaction amounts in the list.

**Validates: Requirements 3.2**

### Property 5: Transaction List Rendering Completeness

*For any* set of transactions in the application state, all transactions should be rendered in the DOM with their item name, amount, and category visible, and each should have an associated delete button.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Chart Data Synchronization

*For any* transaction addition or deletion operation, the pie chart should update to display the current spending distribution across all three categories based on the updated transaction list.

**Validates: Requirements 4.2**

### Property 7: Zero-Category Exclusion

*For any* set of transactions, categories with zero total spending should not appear in the pie chart visualization.

**Validates: Requirements 4.4**

### Property 8: Storage Persistence Round-Trip

*For any* set of transactions, saving them to Local Storage and then loading them back should produce an equivalent set of transactions with all properties (id, itemName, amount, category) preserved.

**Validates: Requirements 5.1, 5.2, 9.1**

### Property 9: Category Validation

*For any* transaction created or loaded by the application, the category field should contain exactly one of the three valid values: "Food", "Transport", or "Fun".

**Validates: Requirements 9.2**

### Property 10: Data Structure Validation

*For any* data loaded from Local Storage, if the data structure is invalid or corrupted, the application should initialize with an empty transaction list and log an error to the console without crashing.

**Validates: Requirements 9.3, 5.3**

### Property 11: Unique Identifier Generation

*For any* set of transactions created by the application, all transaction IDs should be unique with no duplicates.

**Validates: Requirements 9.4**

## Error Handling

### Input Validation Errors

**Scenario**: User submits form with empty or invalid fields

**Handling**:
- Validate all fields before processing
- Display user-friendly error message below form
- Highlight invalid fields with visual indicators
- Auto-dismiss error after 3 seconds or on next valid submission
- Prevent transaction creation until all fields are valid

**Example Error Messages**:
- "Please fill in all fields"
- "Amount must be a positive number"
- "Please select a category"

### Local Storage Errors

**Scenario 1**: Local Storage quota exceeded

**Handling**:
- Catch `QuotaExceededError` exception
- Display error message: "Storage limit reached. Please delete some transactions."
- Allow user to continue using app (new transactions won't persist)
- Log error to console for debugging

**Scenario 2**: Corrupted data in Local Storage

**Handling**:
- Wrap JSON.parse in try-catch block
- Validate data structure after parsing
- If invalid, initialize with empty array
- Log error to console: "Corrupted data detected, starting fresh"
- Continue normal operation with empty state

**Scenario 3**: Local Storage unavailable (private browsing)

**Handling**:
- Detect if localStorage is accessible
- Display warning: "Storage unavailable. Data will not persist."
- Allow app to function with in-memory state only
- Disable persistence features gracefully

### Chart Rendering Errors

**Scenario**: Chart.js fails to load or render

**Handling**:
- Wrap chart initialization in try-catch
- Display fallback message: "Chart visualization unavailable"
- Show category totals as text list instead
- Log error to console for debugging
- Continue app functionality without chart

### Network Errors

**Scenario**: Chart.js CDN fails to load

**Handling**:
- Check if Chart.js is loaded before initializing chart
- Display message: "Chart library unavailable. Using text summary."
- Provide text-based spending breakdown by category
- App remains functional without visualization

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive coverage. This ensures both concrete edge cases and general correctness across all possible inputs.

### Property-Based Testing

**Library**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: expense-budget-visualizer, Property {number}: {property_text}`

**Property Test Implementation**:

Each of the 11 correctness properties will be implemented as a property-based test:

1. **Property 1 Test**: Generate random valid transactions, verify addition increases list length, clears form, and updates balance
2. **Property 2 Test**: Generate random invalid inputs (empty strings, negative amounts), verify rejection and error display
3. **Property 3 Test**: Generate random transaction lists, delete random transactions, verify removal and updates
4. **Property 4 Test**: Generate random transaction sets, verify total always equals sum
5. **Property 5 Test**: Generate random transaction lists, verify all rendered with complete information
6. **Property 6 Test**: Generate random transaction operations, verify chart updates
7. **Property 7 Test**: Generate random transaction sets including zero-spending categories, verify exclusion
8. **Property 8 Test**: Generate random transaction sets, verify save/load round-trip preserves data
9. **Property 9 Test**: Generate random transactions, verify category is always one of three valid values
10. **Property 10 Test**: Generate random corrupted data structures, verify graceful handling
11. **Property 11 Test**: Generate large sets of transactions, verify all IDs are unique

**Custom Generators**:
- `arbitraryTransaction()`: Generates valid transaction objects
- `arbitraryInvalidInput()`: Generates invalid form inputs
- `arbitraryTransactionList()`: Generates arrays of transactions
- `arbitraryCorruptedData()`: Generates malformed JSON and invalid structures

### Unit Testing

**Library**: Jest or Vitest (JavaScript testing framework)

**Focus Areas**:

1. **Specific Examples**:
   - Form has exactly three category options (Food, Transport, Fun)
   - Total balance display appears at top of interface
   - Pie chart displays with distinct colors for each category
   - Empty transaction list shows appropriate message

2. **Edge Cases**:
   - Adding transaction with amount of 0
   - Deleting the last transaction in the list
   - Loading app with empty Local Storage
   - Handling very large transaction amounts (>1,000,000)
   - Handling very long item names (>100 characters)
   - Rapid successive additions/deletions

3. **Integration Points**:
   - Form submission triggers all necessary updates
   - Delete button click removes correct transaction
   - Page load initializes all components correctly
   - Chart.js integration works with category data

4. **Error Conditions**:
   - Local Storage quota exceeded
   - Corrupted JSON in Local Storage
   - Chart.js library fails to load
   - Invalid data types in transaction fields

### Test Organization

```
tests/
├── unit/
│   ├── form-validation.test.js
│   ├── storage.test.js
│   ├── ui-rendering.test.js
│   ├── chart-manager.test.js
│   └── edge-cases.test.js
└── property/
    ├── transaction-operations.property.test.js
    ├── balance-calculation.property.test.js
    ├── storage-persistence.property.test.js
    └── data-validation.property.test.js
```

### Testing Guidelines

**Unit Tests**:
- Keep tests focused on single behaviors
- Use descriptive test names following "should..." pattern
- Mock Local Storage and Chart.js for isolation
- Aim for fast execution (<100ms per test)

**Property Tests**:
- Each property test should map to exactly one correctness property
- Use shrinking to find minimal failing cases
- Log generated inputs for debugging failures
- Set appropriate size parameters for generators

**Coverage Goals**:
- 90%+ code coverage for core logic
- 100% coverage of error handling paths
- All 11 correctness properties implemented as property tests
- All edge cases covered by unit tests

### Manual Testing Checklist

While automated tests provide comprehensive coverage, manual testing should verify:

- Visual appearance across different screen sizes (320px, 768px, 1920px)
- Touch interactions on mobile devices
- Chart colors are visually distinct
- Animations and transitions are smooth
- Error messages are user-friendly and clear
- App works in Chrome, Firefox, Safari, and Edge

