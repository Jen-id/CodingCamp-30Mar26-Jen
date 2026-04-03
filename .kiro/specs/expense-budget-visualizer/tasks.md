# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements a client-side expense tracking web application using vanilla JavaScript, HTML5, and CSS3. The implementation follows a modular architecture with clear separation between state management, UI rendering, storage operations, and chart visualization. All data persists in Local Storage, and spending is visualized using Chart.js pie charts.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure (css/, js/)
  - Create index.html with semantic HTML5 structure
  - Add input form with fields for Item Name, Amount, and Category dropdown
  - Add transaction list container with appropriate ARIA labels
  - Add total balance display element at top of interface
  - Add canvas element for Chart.js pie chart
  - Include Chart.js CDN link in HTML head
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 6.2_

- [x] 2. Implement CSS styling and responsive layout
  - Create css/styles.css with mobile-first approach
  - Style input form with touch-friendly controls (44x44px minimum)
  - Style transaction list with clear visual hierarchy
  - Style total balance display prominently at top
  - Implement responsive breakpoints for mobile (320px), tablet (768px), and desktop (1920px)
  - Add visual feedback for buttons and interactive elements
  - Style error message display area
  - Ensure no horizontal scrolling on mobile devices
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implement core data models and Storage Module
  - [x] 3.1 Create js/app.js and define Transaction data structure
    - Define Transaction object structure with id, itemName, amount, category
    - Implement unique ID generation using timestamp and random string
    - _Requirements: 9.1, 9.4_
  
  - [x] 3.2 Implement StorageModule for Local Storage operations
    - Create StorageModule with STORAGE_KEY constant
    - Implement save() method with JSON serialization
    - Implement load() method with JSON parsing and validation
    - Implement clear() method
    - Add error handling for QuotaExceededError
    - Add error handling for corrupted JSON data
    - Add error handling for unavailable Local Storage
    - _Requirements: 5.1, 5.2, 5.3, 9.3_
  
  - [ ]* 3.3 Write property test for Storage Module
    - **Property 8: Storage Persistence Round-Trip**
    - **Validates: Requirements 5.1, 5.2, 9.1**

- [x] 4. Implement Application State Manager
  - [x] 4.1 Create AppState object with transactions array and chartInstance
    - Initialize empty transactions array
    - Initialize chartInstance as null
    - _Requirements: 9.1_
  
  - [x] 4.2 Implement AppState.addTransaction() method
    - Validate inputs using FormHandler
    - Create new transaction object with unique ID
    - Add transaction to transactions array
    - Call StorageModule.save()
    - Trigger UI and chart updates
    - _Requirements: 1.3, 1.5, 3.3, 9.4_
  
  - [x] 4.3 Implement AppState.deleteTransaction() method
    - Find and remove transaction by ID
    - Call StorageModule.save()
    - Trigger UI and chart updates
    - _Requirements: 2.4, 3.4_
  
  - [x] 4.4 Implement AppState.calculateTotal() method
    - Sum all transaction amounts
    - Return total as number
    - _Requirements: 3.2_
  
  - [x] 4.5 Implement AppState.getCategoryTotals() method
    - Calculate spending for Food, Transport, and Fun categories
    - Return object with category totals
    - _Requirements: 4.1, 9.2_
  
  - [ ]* 4.6 Write property tests for AppState operations
    - **Property 1: Transaction Addition Completeness**
    - **Validates: Requirements 1.3, 1.5, 3.2, 3.3**
  
  - [ ]* 4.7 Write property test for deletion
    - **Property 3: Transaction Deletion Completeness**
    - **Validates: Requirements 2.4, 3.4, 4.2**
  
  - [ ]* 4.8 Write property test for balance calculation
    - **Property 4: Total Balance Accuracy**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.9 Write property test for category validation
    - **Property 9: Category Validation**
    - **Validates: Requirements 9.2**
  
  - [ ]* 4.10 Write property test for unique IDs
    - **Property 11: Unique Identifier Generation**
    - **Validates: Requirements 9.4**

- [x] 5. Checkpoint - Ensure core data layer works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Form Handler and input validation
  - [x] 6.1 Create FormHandler object with validate() method
    - Check for empty item name
    - Check for empty or invalid amount (must be positive number)
    - Check for empty category selection
    - Return validation result with error message
    - _Requirements: 1.4_
  
  - [x] 6.2 Implement FormHandler.handleSubmit() method
    - Prevent default form submission
    - Extract form values (itemName, amount, category)
    - Call validate() method
    - If valid, call AppState.addTransaction()
    - If invalid, call UIRenderer.showError()
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 6.3 Write property test for input validation
    - **Property 2: Input Validation Rejection**
    - **Validates: Requirements 1.4**
  
  - [ ]* 6.4 Write unit tests for edge cases
    - Test amount of 0
    - Test negative amounts
    - Test very large amounts (>1,000,000)
    - Test very long item names (>100 characters)
    - Test special characters in item name

- [x] 7. Implement UI Renderer
  - [x] 7.1 Create UIRenderer object with renderTransactionList() method
    - Clear existing transaction list DOM
    - Create DOM elements for each transaction (item name, amount, category)
    - Add delete button for each transaction with event listener
    - Update DOM with new elements
    - Handle empty list case with appropriate message
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 7.2 Implement UIRenderer.updateTotalBalance() method
    - Format total as currency (e.g., "$123.45")
    - Update balance display element
    - _Requirements: 3.1, 3.2_
  
  - [x] 7.3 Implement UIRenderer.clearForm() method
    - Reset all form fields to empty/default values
    - _Requirements: 1.5_
  
  - [x] 7.4 Implement UIRenderer.showError() and hideError() methods
    - Display validation error message below form
    - Add visual styling for error state
    - Auto-dismiss error after 3 seconds
    - _Requirements: 1.4_
  
  - [ ]* 7.5 Write property test for transaction list rendering
    - **Property 5: Transaction List Rendering Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ]* 7.6 Write unit tests for UI rendering
    - Test empty transaction list displays message
    - Test delete button click removes correct transaction
    - Test error message auto-dismisses after 3 seconds
    - Test form clears after successful submission

- [x] 8. Implement Chart Manager with Chart.js integration
  - [x] 8.1 Create ChartManager object with init() method
    - Get canvas element from DOM
    - Create Chart.js pie chart instance
    - Configure chart options (responsive, legend, colors)
    - Use distinct colors for Food, Transport, and Fun categories
    - Store chart instance reference
    - Add error handling for Chart.js load failure
    - _Requirements: 4.1, 4.3, 4.5_
  
  - [x] 8.2 Implement ChartManager.update() method
    - Get category totals from AppState
    - Filter out categories with zero spending
    - Update chart data and labels
    - Trigger chart re-render
    - _Requirements: 4.2, 4.4_
  
  - [x] 8.3 Implement ChartManager.destroy() method
    - Clean up chart instance properly
    - _Requirements: 4.2_
  
  - [ ]* 8.4 Write property test for chart synchronization
    - **Property 6: Chart Data Synchronization**
    - **Validates: Requirements 4.2**
  
  - [ ]* 8.5 Write property test for zero-category exclusion
    - **Property 7: Zero-Category Exclusion**
    - **Validates: Requirements 4.4**
  
  - [ ]* 8.6 Write unit tests for chart edge cases
    - Test chart with all categories at zero
    - Test chart with only one category having data
    - Test chart updates correctly on rapid additions/deletions
    - Test fallback when Chart.js fails to load

- [x] 9. Checkpoint - Ensure UI and chart rendering work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire all components together and implement initialization
  - [x] 10.1 Implement AppState.init() method
    - Load transactions from StorageModule
    - Initialize ChartManager with canvas element
    - Render initial transaction list
    - Update total balance display
    - Update chart with initial data
    - Set up form submit event listener
    - Handle corrupted data gracefully
    - _Requirements: 5.1, 5.3, 7.1_
  
  - [x] 10.2 Add DOMContentLoaded event listener
    - Call AppState.init() when DOM is ready
    - Add error handling for initialization failures
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 10.3 Write property test for data structure validation
    - **Property 10: Data Structure Validation**
    - **Validates: Requirements 9.3, 5.3**
  
  - [ ]* 10.4 Write integration tests
    - Test complete flow: load app → add transaction → delete transaction
    - Test app initialization with existing data
    - Test app initialization with empty storage
    - Test app initialization with corrupted data
    - Test rapid successive additions and deletions

- [x] 11. Implement error handling and edge cases
  - [x] 11.1 Add Local Storage quota exceeded handling
    - Catch QuotaExceededError in StorageModule.save()
    - Display user-friendly error message
    - Log error to console
    - Allow app to continue functioning
    - _Requirements: 5.3_
  
  - [x] 11.2 Add Chart.js CDN failure handling
    - Check if Chart object is available before initialization
    - Display fallback text-based category totals if Chart.js unavailable
    - Log error to console
    - _Requirements: 4.5_
  
  - [x] 11.3 Add Local Storage unavailable handling
    - Detect if localStorage is accessible
    - Display warning message if unavailable
    - Allow app to function with in-memory state only
    - _Requirements: 5.3_
  
  - [ ]* 11.4 Write unit tests for error conditions
    - Test Local Storage quota exceeded
    - Test corrupted JSON in Local Storage
    - Test Chart.js library fails to load
    - Test invalid data types in transaction fields
    - Test Local Storage unavailable (private browsing mode)

- [x] 12. Final checkpoint and performance validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify app loads within 2 seconds
  - Verify transaction operations complete within 200ms
  - Verify chart updates complete within 300ms
  - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests are tagged with format: `Feature: expense-budget-visualizer, Property {number}: {property_text}`
- Unit tests use Jest or Vitest framework
- Checkpoints ensure incremental validation at key milestones
- Implementation uses vanilla JavaScript (ES6+) with no frameworks except Chart.js for visualization
- All code should be production-ready with proper error handling
