# Implementation Plan: Theme and Enhancements

## Overview

This plan implements three enhancements to the existing Expense & Budget Visualizer: dark/light theme toggle with CSS variables, custom category management (up to 10 categories), and transaction sorting by amount or category. The implementation follows the established modular architecture with three new modules (ThemeManager, CategoryManager, SortManager) that integrate seamlessly with existing components (AppState, UIRenderer, ChartManager, StorageModule). All user preferences persist to Local Storage.

## Tasks

- [x] 1. Set up CSS theming infrastructure
  - [x] 1.1 Add CSS variables for dark theme to styles.css
    - Define dark theme color variables in body.dark-theme selector
    - Include background colors with luminance <20%
    - Include text colors with luminance >80%
    - Define dark theme chart colors (food, transport, fun, text, grid)
    - Add 300ms transition for theme changes on body and major sections
    - _Requirements: 1.3, 1.4, 4.1, 4.2, 4.5_
  
  - [x] 1.2 Create theme toggle button in HTML
    - Add theme toggle button to index.html (before balance section)
    - Include appropriate ARIA label describing current state
    - Make button keyboard accessible (tabindex, role)
    - Add visible focus indicator styling in CSS
    - _Requirements: 1.1, 7.1, 7.2, 7.4_

- [x] 2. Implement ThemeManager module
  - [x] 2.1 Create ThemeManager object in app.js
    - Define currentTheme property (default: 'light')
    - Define STORAGE_KEY constant ('theme_preference')
    - Implement init() method to load saved theme and set up event listener
    - Implement loadTheme() method to retrieve from Local Storage
    - Implement applyTheme() method to update CSS variables and body class
    - Implement toggleTheme() method to switch between light/dark
    - Implement getThemeColors() method to return theme-appropriate colors
    - _Requirements: 1.2, 1.5, 1.6, 1.7_
  
  - [ ]* 2.2 Write property test for theme toggle
    - **Property 1: Theme Toggle Switches State**
    - **Validates: Requirements 1.2**
  
  - [ ]* 2.3 Write property test for theme persistence
    - **Property 4: Theme Persistence Round-Trip**
    - **Validates: Requirements 1.5, 1.6**
  
  - [ ]* 2.4 Write property test for theme color requirements
    - **Property 2: Theme Color Requirements**
    - **Validates: Requirements 1.3, 1.4, 4.1, 4.2**
  
  - [ ]* 2.5 Write property test for contrast ratios
    - **Property 3: Theme Contrast Ratios**
    - **Validates: Requirements 4.3**

- [x] 3. Integrate ThemeManager with existing components
  - [x] 3.1 Update AppState.init() to initialize ThemeManager
    - Call ThemeManager.init() before other initializations
    - _Requirements: 1.6, 1.7_
  
  - [x] 3.2 Update ChartManager to support theme-aware colors
    - Modify ChartManager.init() to use ThemeManager.getThemeColors()
    - Add ChartManager.updateThemeColors() method
    - Call updateThemeColors() when theme changes
    - Update chart text and grid colors for current theme
    - _Requirements: 4.4, 4.5_
  
  - [ ]* 3.3 Write property test for chart color updates
    - **Property 5: Chart Colors Update With Theme**
    - **Validates: Requirements 4.4**
  
  - [ ]* 3.4 Write property test for keyboard accessibility
    - **Property 19: Theme Toggle Keyboard Accessibility**
    - **Validates: Requirements 7.3**
  
  - [ ]* 3.5 Write property test for ARIA labels
    - **Property 20: Theme Toggle ARIA Label**
    - **Validates: Requirements 7.4**

- [ ] 4. Checkpoint - Ensure theme switching works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement custom category management UI
  - [x] 5.1 Add custom category management section to HTML
    - Add section after form with heading "Manage Categories"
    - Add input field for new category name
    - Add "Add Category" button
    - Add container for custom category list
    - Add count display showing "X/10 custom categories"
    - _Requirements: 2.1, 8.2, 8.3_
  
  - [x] 5.2 Style custom category management section in CSS
    - Style category list with delete buttons
    - Style add category form
    - Style disabled state for add button at limit
    - Add visual feedback for category operations
    - _Requirements: 2.1, 2.8_

- [x] 6. Implement CategoryManager module
  - [x] 6.1 Create CategoryManager object in app.js
    - Define customCategories array property
    - Define MAX_CUSTOM_CATEGORIES constant (10)
    - Define STORAGE_KEY constant ('custom_categories')
    - Implement init() method to load categories and render UI
    - Implement loadCategories() method to retrieve from Local Storage
    - Implement validateCategoryName() method (non-empty, alphanumeric + spaces, max 20 chars)
    - Implement addCategory() method with validation and duplicate checking
    - Implement deleteCategory() method with transaction checking
    - Implement getAllCategories() method (default + custom)
    - Implement categoryHasTransactions() method
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9, 2.10, 5.5, 8.1_
  
  - [ ]* 6.2 Write property test for category addition
    - **Property 6: Custom Category Addition**
    - **Validates: Requirements 2.2**
  
  - [ ]* 6.3 Write property test for name validation
    - **Property 7: Custom Category Name Validation**
    - **Validates: Requirements 2.3, 5.5**
  
  - [ ]* 6.4 Write property test for duplicate prevention
    - **Property 8: Custom Category Duplicate Prevention**
    - **Validates: Requirements 2.4**
  
  - [ ]* 6.5 Write property test for category persistence
    - **Property 9: Custom Category Round-Trip**
    - **Validates: Requirements 2.5, 2.6**
  
  - [ ]* 6.6 Write property test for default categories invariant
    - **Property 10: Default Categories Invariant**
    - **Validates: Requirements 2.7**
  
  - [ ]* 6.7 Write property test for category deletion
    - **Property 11: Custom Category Deletion**
    - **Validates: Requirements 2.9**
  
  - [ ]* 6.8 Write property test for protected deletion
    - **Property 12: Protected Category Deletion**
    - **Validates: Requirements 2.10**
  
  - [ ]* 6.9 Write property test for category limit
    - **Property 18: Custom Category Limit Enforcement**
    - **Validates: Requirements 8.1**

- [x] 7. Integrate CategoryManager with existing components
  - [x] 7.1 Update AppState to support custom categories
    - Add customCategories property to AppState
    - Update AppState.init() to initialize CategoryManager
    - Update AppState.addTransaction() to validate against all categories
    - Update AppState.getCategoryTotals() to include custom categories
    - _Requirements: 2.2, 2.7, 5.2_
  
  - [x] 7.2 Update UIRenderer to support custom categories
    - Add UIRenderer.renderCategoryOptions() method
    - Update form category dropdown with default + custom categories
    - Add UIRenderer.renderCategoryManagement() method
    - Display custom category list with delete buttons
    - Update category count display (X/10)
    - Disable add button when at limit
    - _Requirements: 2.1, 2.2, 2.8, 8.2, 8.3_
  
  - [x] 7.3 Update ChartManager to support custom categories
    - Modify ChartManager.update() to handle custom categories
    - Implement ChartManager.getCategoryColor() for custom categories
    - Generate distinct colors for custom categories
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 7.4 Write property test for transaction category validation
    - **Property 13: Transaction Category Validation**
    - **Validates: Requirements 5.2**
  
  - [ ]* 7.5 Write unit tests for orphaned categories
    - Test transactions with deleted custom categories display correctly
    - Test orphaned categories marked as inactive
    - _Requirements: 5.3, 5.4_

- [ ] 8. Checkpoint - Ensure custom category management works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement transaction sorting UI
  - [ ] 9.1 Add sort controls to HTML
    - Add sort controls section above transaction list
    - Add dropdown for sort field (Date, Amount, Category)
    - Add toggle button for sort order (Ascending/Descending)
    - Style sort controls in CSS
    - _Requirements: 3.1, 3.4_

- [ ] 10. Implement SortManager module
  - [ ] 10.1 Create SortManager object in app.js
    - Define currentSort property with field and order
    - Define STORAGE_KEY constant ('sort_preference')
    - Implement init() method to load preference and render controls
    - Implement loadSortPreference() method to retrieve from Local Storage
    - Implement setSortPreference() method to update and persist
    - Implement sortTransactions() method to return sorted array
    - Implement sortByAmount() helper method
    - Implement sortByCategory() helper method
    - Implement sortByDate() helper method
    - _Requirements: 3.2, 3.3, 3.6, 3.7, 3.8, 6.2_
  
  - [ ]* 10.2 Write property test for amount sorting
    - **Property 14: Sort By Amount**
    - **Validates: Requirements 3.2**
  
  - [ ]* 10.3 Write property test for category sorting
    - **Property 15: Sort By Category**
    - **Validates: Requirements 3.3**
  
  - [ ]* 10.4 Write property test for sort persistence
    - **Property 17: Sort Preference Round-Trip**
    - **Validates: Requirements 3.6, 3.7**

- [ ] 11. Integrate SortManager with existing components
  - [ ] 11.1 Update AppState to support sorting
    - Add sortPreference property to AppState
    - Update AppState.init() to initialize SortManager
    - Add AppState.getSortedTransactions() method
    - Update transaction operations to respect current sort
    - _Requirements: 3.5, 3.7, 3.8_
  
  - [ ] 11.2 Update UIRenderer to use sorted transactions
    - Modify UIRenderer.renderTransactionList() to use sorted array
    - Add UIRenderer.renderSortControls() method
    - Update sort controls when preference changes
    - Trigger re-render on sort change
    - _Requirements: 3.5, 6.1_
  
  - [ ]* 11.3 Write property test for sort re-rendering
    - **Property 16: Sort Order Re-Rendering**
    - **Validates: Requirements 3.5**
  
  - [ ]* 11.4 Write unit tests for sort edge cases
    - Test sorting empty transaction list
    - Test sorting single transaction
    - Test sorting with all same amounts
    - Test sorting with all same categories
    - Test sort performance with 1000 transactions
    - _Requirements: 6.1_

- [ ] 12. Checkpoint - Ensure transaction sorting works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement error handling for new features
  - [ ] 13.1 Add theme switching error handling
    - Wrap theme application in try-catch
    - Revert to previous theme on error
    - Display user-friendly error message
    - Log errors to console
  
  - [ ] 13.2 Add custom category error handling
    - Display specific validation error messages
    - Show warning when attempting to delete category with transactions
    - Handle storage errors gracefully
    - Show max limit message when at 10 categories
    - _Requirements: 2.10, 8.3_
  
  - [ ] 13.3 Add sort preference error handling
    - Validate sort preference structure on load
    - Use default sort if invalid preference found
    - Handle corrupted sort data gracefully
    - _Requirements: 3.8_
  
  - [ ] 13.4 Add orphaned category handling
    - Detect transactions with deleted custom categories on load
    - Display orphaned category names with "(inactive)" suffix
    - Add visual indicator for orphaned categories
    - Log warning to console
    - _Requirements: 5.3, 5.4_

- [ ] 14. Final integration and wiring
  - [ ] 14.1 Update AppState.init() with complete initialization sequence
    - Initialize ThemeManager first
    - Initialize CategoryManager second
    - Initialize SortManager third
    - Load and validate transactions
    - Initialize ChartManager with theme colors
    - Render all UI components in correct order
    - Set up all event listeners
  
  - [ ] 14.2 Ensure all Local Storage operations are coordinated
    - Verify theme preference saves and loads correctly
    - Verify custom categories save and load correctly
    - Verify sort preference saves and loads correctly
    - Verify transactions with custom categories persist correctly
    - Handle storage quota errors across all features
  
  - [ ]* 14.3 Write integration tests
    - Test complete flow: load app → change theme → add custom category → add transaction → sort
    - Test app initialization with all saved preferences
    - Test app initialization with no saved preferences
    - Test rapid theme switching with chart updates
    - Test adding transaction with custom category then deleting category
    - Test sorting after adding/deleting transactions

- [ ] 15. Final checkpoint - Ensure all features work together
  - Ensure all tests pass, ask the user if questions arise.
  - Verify theme changes complete within 300ms
  - Verify sort operations complete within 200ms for up to 1000 transactions
  - Verify all features work on mobile (320px), tablet (768px), and desktop (1920px)
  - Verify keyboard accessibility for all new controls
  - Verify ARIA labels are appropriate
  - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
  - _Requirements: 4.5, 6.1, 6.3, 7.1, 7.2, 7.3, 7.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests are tagged with format: `Feature: theme-and-enhancements, Property {number}: {property_text}`
- Unit tests use Jest or Vitest framework
- Checkpoints ensure incremental validation at key milestones
- Implementation builds on existing vanilla JavaScript architecture
- All new modules follow the established pattern (object literals with methods)
- CSS variables approach ensures smooth theme transitions
- Custom category colors should be visually distinct from default categories
- Sort operations should not mutate the original transactions array
