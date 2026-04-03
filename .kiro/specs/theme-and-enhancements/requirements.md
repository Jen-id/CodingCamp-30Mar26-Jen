# Requirements Document

## Introduction

This feature enhances the existing Expense & Budget Visualizer application with three key improvements: a dark/light mode toggle for better user experience in different lighting conditions, custom category management to allow users to define their own expense categories beyond the fixed three, and transaction sorting capabilities to help users analyze their spending patterns. These enhancements maintain the application's vanilla JavaScript architecture while significantly expanding its flexibility and usability.

## Glossary

- **Application**: The Expense & Budget Visualizer web application
- **User**: A person using the Application to track expenses
- **Transaction**: A single expense entry with item name, amount, and category
- **Category**: A classification label for transactions (default: Food, Transport, Fun; expandable by User)
- **Custom_Category**: A user-defined category created by the User
- **Theme**: The visual appearance mode of the Application (Light or Dark)
- **Theme_Toggle**: A UI control that switches between Light and Dark themes
- **Sort_Order**: The arrangement of transactions by a specific criterion (amount or category)
- **Local_Storage**: The browser's Local Storage API for client-side data persistence

## Requirements

### Requirement 1: Dark/Light Mode Toggle

**User Story:** As a User, I want to switch between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Application SHALL provide a Theme_Toggle control visible on all screens
2. WHEN a User clicks the Theme_Toggle, THE Application SHALL switch between Light and Dark themes
3. THE Application SHALL apply the Dark theme with dark background colors and light text
4. THE Application SHALL apply the Light theme with light background colors and dark text
5. WHEN the theme changes, THE Application SHALL persist the User's theme preference to Local_Storage
6. WHEN the Application loads, THE Application SHALL apply the User's saved theme preference
7. IF no theme preference exists in Local_Storage, THEN THE Application SHALL default to Light theme

### Requirement 2: Custom Category Management

**User Story:** As a User, I want to create my own expense categories, so that I can track spending in areas relevant to my life.

#### Acceptance Criteria

1. THE Application SHALL provide a UI control for adding Custom_Categories
2. WHEN a User creates a Custom_Category, THE Application SHALL add it to the available category options
3. THE Application SHALL validate that Custom_Category names are non-empty and contain only alphanumeric characters and spaces
4. THE Application SHALL prevent duplicate category names (case-insensitive)
5. THE Application SHALL persist all Custom_Categories to Local_Storage
6. WHEN the Application loads, THE Application SHALL load all Custom_Categories from Local_Storage
7. THE Application SHALL maintain the three default categories (Food, Transport, Fun) at all times
8. THE Application SHALL provide a delete control for each Custom_Category
9. WHEN a User deletes a Custom_Category, THE Application SHALL remove it from the category options
10. IF a Custom_Category has associated transactions, THEN THE Application SHALL prevent deletion and display a warning message

### Requirement 3: Transaction Sorting

**User Story:** As a User, I want to sort my transactions by amount or category, so that I can analyze my spending patterns.

#### Acceptance Criteria

1. THE Application SHALL provide sort controls for Amount and Category
2. WHEN a User selects sort by Amount, THE Application SHALL arrange transactions in descending order by amount (highest first)
3. WHEN a User selects sort by Category, THE Application SHALL arrange transactions alphabetically by category name
4. THE Application SHALL provide a toggle to reverse the sort order (ascending/descending)
5. WHEN the sort order changes, THE Application SHALL re-render the transaction list immediately
6. THE Application SHALL persist the User's sort preference to Local_Storage
7. WHEN the Application loads, THE Application SHALL apply the User's saved sort preference
8. IF no sort preference exists in Local_Storage, THEN THE Application SHALL display transactions in the order they were added (newest first)

### Requirement 4: Theme Visual Consistency

**User Story:** As a User, I want the dark theme to be visually consistent, so that the app is comfortable to use at night.

#### Acceptance Criteria

1. WHILE the Dark theme is active, THE Application SHALL use background colors with luminance below 20%
2. WHILE the Dark theme is active, THE Application SHALL use text colors with luminance above 80%
3. WHILE the Dark theme is active, THE Application SHALL maintain color contrast ratios of at least 4.5:1 for normal text
4. WHILE the Dark theme is active, THE Application SHALL adjust the Chart colors to be visible against the dark background
5. WHEN the theme changes, THE Application SHALL update all UI elements including the Chart within 300 milliseconds

### Requirement 5: Custom Category Data Integrity

**User Story:** As a Developer, I want custom categories to integrate seamlessly with existing data, so that the application remains reliable.

#### Acceptance Criteria

1. THE Application SHALL store Custom_Categories as a separate array in Local_Storage
2. THE Application SHALL validate that all transaction category values match either a default or Custom_Category
3. WHEN loading transactions from Local_Storage, THE Application SHALL handle transactions with categories that no longer exist
4. IF a transaction references a deleted Custom_Category, THEN THE Application SHALL display the category name but mark it as inactive
5. THE Application SHALL limit Custom_Category names to 20 characters maximum

### Requirement 6: Sort Performance

**User Story:** As a User, I want sorting to be fast, so that I can quickly analyze my transactions.

#### Acceptance Criteria

1. WHEN a User changes the sort order, THE Application SHALL complete the sort and re-render within 200 milliseconds for up to 1000 transactions
2. THE Application SHALL use efficient sorting algorithms (O(n log n) time complexity)
3. THE Application SHALL not block the UI thread during sorting operations

### Requirement 7: Theme Toggle Accessibility

**User Story:** As a User with accessibility needs, I want the theme toggle to be keyboard accessible, so that I can use it without a mouse.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be keyboard accessible via Tab key navigation
2. WHEN the Theme_Toggle has focus, THE Application SHALL display a visible focus indicator
3. WHEN a User presses Enter or Space on the focused Theme_Toggle, THE Application SHALL toggle the theme
4. THE Theme_Toggle SHALL have an appropriate ARIA label describing its current state

### Requirement 8: Custom Category Limits

**User Story:** As a Developer, I want to limit the number of custom categories, so that the UI remains usable.

#### Acceptance Criteria

1. THE Application SHALL allow a maximum of 10 Custom_Categories
2. WHEN the User has 10 Custom_Categories, THE Application SHALL disable the add category control
3. WHEN the User has 10 Custom_Categories, THE Application SHALL display a message: "Maximum of 10 custom categories reached"

