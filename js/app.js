// Expense & Budget Visualizer - Application Logic

/**
 * Transaction data structure
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier (timestamp + random string)
 * @property {string} itemName - Name of the expense item
 * @property {number} amount - Expense amount (positive number)
 * @property {string} category - One of: "Food", "Transport", "Fun"
 */

/**
 * Generates a unique identifier for a transaction
 * Uses timestamp combined with a random string for uniqueness
 * @returns {string} Unique transaction ID
 */
function generateUniqueId() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomString}`;
}

/**
 * Creates a new Transaction object
 * @param {string} itemName - Name of the expense item
 * @param {number} amount - Expense amount (positive number)
 * @param {string} category - One of: "Food", "Transport", "Fun"
 * @returns {Transaction} New transaction object with unique ID
 */
function createTransaction(itemName, amount, category) {
  return {
    id: generateUniqueId(),
    itemName: itemName,
    amount: amount,
    category: category
  };
}

/**
 * StorageModule - Handles all Local Storage operations with error handling
 * Manages persistence of transaction data to browser's Local Storage
 */
const StorageModule = {
  STORAGE_KEY: 'expense_transactions',
  isAvailable: true, // Track if localStorage is available

  /**
   * Saves transactions to Local Storage
   * @param {Transaction[]} transactions - Array of transaction objects to save
   * @returns {boolean} True if save was successful, false otherwise
   */
  save(transactions) {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined' || !this.isAvailable) {
        console.error('Local Storage unavailable. Data will not persist.');
        return false;
      }

      // Serialize transactions to JSON
      const jsonData = JSON.stringify(transactions);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      // Handle quota exceeded error (Task 11.1)
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('Storage limit reached. Please delete some transactions.');
        UIRenderer.showError('Storage limit reached. Please delete some transactions to save new data.');
        return false;
      }
      
      // Handle unavailable Local Storage
      if (error.message && error.message.includes('not available')) {
        console.error('Local Storage unavailable. Data will not persist.');
        this.isAvailable = false;
        return false;
      }
      
      // Handle other errors
      console.error('Failed to save data to Local Storage:', error);
      return false;
    }
  },

  /**
   * Loads transactions from Local Storage
   * @returns {Transaction[]} Array of transactions, or empty array if none exist or data is corrupted
   */
  load() {
    try {
      // Check if localStorage is available (Task 11.3)
      if (typeof localStorage === 'undefined') {
        console.error('Local Storage unavailable. Starting with empty data.');
        this.isAvailable = false;
        return [];
      }

      // Test localStorage accessibility
      try {
        localStorage.getItem('test');
      } catch (e) {
        console.error('Local Storage unavailable. Starting with empty data.');
        this.isAvailable = false;
        return [];
      }

      // Retrieve from localStorage
      const jsonData = localStorage.getItem(this.STORAGE_KEY);
      
      // Return empty array if no data exists
      if (jsonData === null) {
        return [];
      }

      // Parse JSON
      const transactions = JSON.parse(jsonData);

      // Validate structure
      if (!Array.isArray(transactions)) {
        console.error('Corrupted data detected: expected array, starting fresh');
        return [];
      }

      // Get all valid categories (default + custom) for validation
      const validCategories = ['Food', 'Transport', 'Fun'];
      
      // Load custom categories to check for orphaned categories
      let customCategories = [];
      try {
        const customCategoriesData = localStorage.getItem('custom_categories');
        if (customCategoriesData) {
          customCategories = JSON.parse(customCategoriesData);
          if (Array.isArray(customCategories)) {
            validCategories.push(...customCategories);
          }
        }
      } catch (e) {
        console.warn('Failed to load custom categories for validation');
      }

      // Track orphaned categories for warning
      const orphanedCategories = new Set();

      // Validate each transaction has required properties
      const isValid = transactions.every(transaction => {
        const hasValidStructure = (
          transaction &&
          typeof transaction === 'object' &&
          typeof transaction.id === 'string' &&
          typeof transaction.itemName === 'string' &&
          typeof transaction.amount === 'number' &&
          typeof transaction.category === 'string'
        );

        if (!hasValidStructure) {
          return false;
        }

        // Check if category is orphaned (deleted custom category)
        if (!validCategories.includes(transaction.category)) {
          orphanedCategories.add(transaction.category);
        }

        return true;
      });

      if (!isValid) {
        console.error('Corrupted data detected: invalid transaction structure, starting fresh');
        return [];
      }

      // Log warning if orphaned categories detected (Task 13.4)
      if (orphanedCategories.size > 0) {
        const orphanedList = Array.from(orphanedCategories).join(', ');
        console.warn(`Found transactions with deleted categories: ${orphanedList}`);
      }

      return transactions;
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.error('Corrupted data detected: invalid JSON, starting fresh');
        return [];
      }

      // Handle other errors
      console.error('Failed to load data from Local Storage:', error);
      return [];
    }
  },

  /**
   * Clears all transaction data from Local Storage
   */
  clear() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn('Local Storage unavailable. Nothing to clear.');
        return;
      }

      // Remove data from localStorage
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear Local Storage:', error);
    }
  }
};

/**
 * ThemeManager - Manages theme switching, persistence, and CSS variable updates
 * Handles dark/light theme toggle with Local Storage persistence
 */
const ThemeManager = {
  currentTheme: 'light',
  STORAGE_KEY: 'theme_preference',

  /**
   * Initializes the theme manager
   * Loads saved theme preference, applies it, and sets up event listener
   */
  init() {
    try {
      // Load saved theme preference from Local Storage
      this.currentTheme = this.loadTheme();
      
      // Apply the loaded theme
      this.applyTheme(this.currentTheme);
      
      // Set up theme toggle button event listener
      const toggleButton = document.getElementById('theme-toggle');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          this.toggleTheme();
        });
        
        // Add keyboard accessibility (Enter and Space keys)
        toggleButton.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleTheme();
          }
        });
      } else {
        console.warn('Theme toggle button not found');
      }
    } catch (error) {
      console.error('Failed to initialize ThemeManager:', error);
      // Default to light theme on error
      this.currentTheme = 'light';
      this.applyTheme('light');
    }
  },

  /**
   * Loads theme preference from Local Storage
   * @returns {string} Theme preference ('light' or 'dark'), defaults to 'light'
   */
  loadTheme() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn('Local Storage unavailable. Using default theme.');
        return 'light';
      }

      // Retrieve theme preference from Local Storage
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      
      // Return saved theme if valid, otherwise default to light
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      
      // Default to light theme if no valid preference exists
      return 'light';
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return 'light';
    }
  },

  /**
   * Applies the specified theme to the document
   * Updates CSS variables, body class, and saves to Local Storage
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  applyTheme(theme) {
    // Store previous theme for revert on error
    const previousTheme = this.currentTheme;
    
    try {
      // Validate theme parameter
      if (theme !== 'light' && theme !== 'dark') {
        console.error('Invalid theme:', theme);
        return;
      }

      // Update current theme
      this.currentTheme = theme;

      // Update body class for theme
      const body = document.body;
      if (theme === 'dark') {
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
      }

      // Update theme toggle button
      this.updateToggleButton(theme);

      // Update chart colors if chart exists
      if (ChartManager && ChartManager.chartInstance) {
        ChartManager.updateThemeColors();
      }

      // Save theme preference to Local Storage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, theme);
        }
      } catch (storageError) {
        console.warn('Failed to save theme preference:', storageError);
        // Continue without saving - app still functions
      }
    } catch (error) {
      // Log error to console
      console.error('Failed to apply theme:', error);
      
      // Revert to previous theme
      this.currentTheme = previousTheme;
      const body = document.body;
      if (previousTheme === 'dark') {
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
      }
      this.updateToggleButton(previousTheme);
      
      // Display user-friendly error message
      if (typeof UIRenderer !== 'undefined' && UIRenderer.showError) {
        UIRenderer.showError('Theme change failed. Please try again.');
      }
    }
  },

  /**
   * Toggles between light and dark themes
   */
  toggleTheme() {
    try {
      // Switch to opposite theme
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      
      // Apply the new theme
      this.applyTheme(newTheme);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  },

  /**
   * Updates the theme toggle button icon and ARIA label
   * @param {string} theme - Current theme ('light' or 'dark')
   */
  updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) {
      return;
    }

    const iconElement = toggleButton.querySelector('.theme-icon');
    
    if (theme === 'dark') {
      // Show sun icon for dark theme (clicking will switch to light)
      if (iconElement) {
        iconElement.textContent = '☀️';
      }
      toggleButton.setAttribute('aria-label', 'Switch to light theme');
    } else {
      // Show moon icon for light theme (clicking will switch to dark)
      if (iconElement) {
        iconElement.textContent = '🌙';
      }
      toggleButton.setAttribute('aria-label', 'Switch to dark theme');
    }
  },

  /**
   * Returns theme-appropriate colors for charts and UI elements
   * @returns {Object} Color palette for current theme
   */
  getThemeColors() {
    if (this.currentTheme === 'dark') {
      return {
        food: '#ff7a9a',
        transport: '#4fb8ff',
        fun: '#ffd966',
        text: '#e8e8e8',
        grid: '#404040'
      };
    } else {
      return {
        food: '#FF6384',
        transport: '#36A2EB',
        fun: '#FFCE56',
        text: '#666666',
        grid: '#e0e0e0'
      };
    }
  }
};

/**
 * CategoryManager - Manages custom categories with validation and persistence
 * Handles custom category creation, deletion, validation, and Local Storage operations
 */
const CategoryManager = {
  customCategories: [],
  MAX_CUSTOM_CATEGORIES: 10,
  STORAGE_KEY: 'custom_categories',

  /**
   * Initializes the category manager
   * Loads saved custom categories and renders UI
   */
  init() {
    try {
      // Load custom categories from Local Storage
      this.customCategories = this.loadCategories();
      
      // Render category management UI
      if (typeof UIRenderer !== 'undefined' && UIRenderer.renderCategoryManagement) {
        UIRenderer.renderCategoryManagement();
        UIRenderer.renderCategoryOptions();
      }
      
      // Set up add category button event listener
      const addButton = document.getElementById('add-category-btn');
      const inputField = document.getElementById('new-category-name');
      
      if (addButton && inputField) {
        addButton.addEventListener('click', () => {
          const categoryName = inputField.value;
          const result = this.addCategory(categoryName);
          
          if (result.success) {
            // Clear input field
            inputField.value = '';
            // Update UI
            if (typeof UIRenderer !== 'undefined') {
              UIRenderer.renderCategoryManagement();
              UIRenderer.renderCategoryOptions();
              UIRenderer.hideError();
            }
            // Update chart
            if (typeof ChartManager !== 'undefined' && typeof AppState !== 'undefined') {
              ChartManager.update(AppState.getCategoryTotals());
            }
          } else {
            // Show error message
            if (typeof UIRenderer !== 'undefined') {
              UIRenderer.showError(result.error);
            }
          }
        });
        
        // Add Enter key support for input field
        inputField.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addButton.click();
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize CategoryManager:', error);
      // Default to empty custom categories on error
      this.customCategories = [];
    }
  },

  /**
   * Loads custom categories from Local Storage
   * @returns {string[]} Array of custom category names, or empty array if none exist
   */
  loadCategories() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn('Local Storage unavailable. Custom categories will not persist.');
        return [];
      }

      // Retrieve custom categories from Local Storage
      const jsonData = localStorage.getItem(this.STORAGE_KEY);
      
      // Return empty array if no data exists
      if (jsonData === null) {
        return [];
      }

      // Parse JSON
      const categories = JSON.parse(jsonData);

      // Validate structure
      if (!Array.isArray(categories)) {
        console.error('Corrupted custom categories data: expected array, starting fresh');
        return [];
      }

      // Validate each category is a string
      const isValid = categories.every(category => typeof category === 'string');

      if (!isValid) {
        console.error('Corrupted custom categories data: invalid structure, starting fresh');
        return [];
      }

      return categories;
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.error('Corrupted custom categories data: invalid JSON, starting fresh');
        return [];
      }

      // Handle other errors
      console.error('Failed to load custom categories from Local Storage:', error);
      return [];
    }
  },

  /**
   * Validates a category name
   * @param {string} name - Category name to validate
   * @returns {Object} Validation result with {valid: boolean, error: string}
   */
  validateCategoryName(name) {
    // Check non-empty - specific error message
    if (!name || name.trim() === '') {
      return {
        valid: false,
        error: 'Category name cannot be empty. Please enter a name.'
      };
    }

    const trimmedName = name.trim();

    // Check max length (20 characters) - specific error message
    if (trimmedName.length > 20) {
      return {
        valid: false,
        error: `Category name must be 20 characters or less (currently ${trimmedName.length} characters).`
      };
    }

    // Check alphanumeric + spaces only - specific error message
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    if (!alphanumericRegex.test(trimmedName)) {
      return {
        valid: false,
        error: 'Category name can only contain letters, numbers, and spaces. Special characters are not allowed.'
      };
    }

    // All validations passed
    return {
      valid: true,
      error: ''
    };
  },

  /**
   * Adds a new custom category
   * @param {string} name - Category name to add
   * @returns {Object} Result with {success: boolean, error: string}
   */
  addCategory(name) {
    try {
      // Validate category name
      const validationResult = this.validateCategoryName(name);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      const trimmedName = name.trim();

      // Check for maximum limit - show specific message
      if (this.customCategories.length >= this.MAX_CUSTOM_CATEGORIES) {
        return {
          success: false,
          error: `Maximum of ${this.MAX_CUSTOM_CATEGORIES} custom categories reached. Delete a category to add a new one.`
        };
      }

      // Check for duplicates (case-insensitive) - specific error message
      const allCategories = this.getAllCategories();
      const isDuplicate = allCategories.some(
        category => category.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          error: `Category "${trimmedName}" already exists. Please choose a different name.`
        };
      }

      // Add to customCategories array
      this.customCategories.push(trimmedName);

      // Save to Local Storage - handle storage errors gracefully
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customCategories));
        }
      } catch (storageError) {
        console.error('Failed to save custom categories:', storageError);
        // Show storage-specific error message
        if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
          return {
            success: false,
            error: 'Storage limit reached. Cannot save new category. Please delete some transactions or categories.'
          };
        }
        // For other storage errors, continue but warn user
        if (typeof UIRenderer !== 'undefined' && UIRenderer.showWarning) {
          UIRenderer.showWarning('Category added but may not persist. Storage unavailable.');
        }
      }

      return {
        success: true,
        error: ''
      };
    } catch (error) {
      console.error('Failed to add custom category:', error);
      return {
        success: false,
        error: 'Failed to add category. Please try again.'
      };
    }
  },

  /**
   * Deletes a custom category
   * @param {string} name - Category name to delete
   * @returns {Object} Result with {success: boolean, error: string}
   */
  deleteCategory(name) {
    try {
      // Check if category has associated transactions - show specific warning
      if (this.categoryHasTransactions(name)) {
        const transactionCount = AppState.transactions.filter(
          t => t.category === name
        ).length;
        return {
          success: false,
          error: `Cannot delete category "${name}" because it has ${transactionCount} transaction(s). Please delete those transactions first.`
        };
      }

      // Find category index (case-sensitive)
      const index = this.customCategories.indexOf(name);

      if (index === -1) {
        return {
          success: false,
          error: `Category "${name}" not found.`
        };
      }

      // Remove from customCategories array
      this.customCategories.splice(index, 1);

      // Save to Local Storage - handle storage errors gracefully
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customCategories));
        }
      } catch (storageError) {
        console.error('Failed to save custom categories:', storageError);
        // Show storage-specific error message
        if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
          return {
            success: false,
            error: 'Storage error. Category deletion may not persist.'
          };
        }
        // For other storage errors, continue but warn user
        if (typeof UIRenderer !== 'undefined' && UIRenderer.showWarning) {
          UIRenderer.showWarning('Category deleted but change may not persist. Storage unavailable.');
        }
      }

      return {
        success: true,
        error: ''
      };
    } catch (error) {
      console.error('Failed to delete custom category:', error);
      return {
        success: false,
        error: 'Failed to delete category. Please try again.'
      };
    }
  },

  /**
   * Returns all categories (default + custom)
   * @returns {string[]} Array of all category names
   */
  getAllCategories() {
    const defaultCategories = ['Food', 'Transport', 'Fun'];
    return [...defaultCategories, ...this.customCategories];
  },

  /**
   * Checks if a category has associated transactions
   * @param {string} name - Category name to check
   * @returns {boolean} True if category has transactions, false otherwise
   */
  categoryHasTransactions(name) {
    return AppState.transactions.some(transaction => transaction.category === name);
  }
};

/**
 * SortManager - Manages transaction sorting with multiple criteria and persistence
 * Handles sort preference loading, saving, and transaction sorting operations
 */
const SortManager = {
  currentSort: {
    field: 'date',      // 'date', 'amount', or 'category'
    order: 'desc'       // 'asc' or 'desc'
  },
  STORAGE_KEY: 'sort_preference',

  /**
   * Initializes the sort manager
   * Loads saved sort preference and renders sort controls
   */
  init() {
    try {
      // Load sort preference from Local Storage
      this.currentSort = this.loadSortPreference();
      
      // Render sort controls UI
      UIRenderer.renderSortControls();
      
      // Set up sort control event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize SortManager:', error);
      // Default to date descending on error
      this.currentSort = { field: 'date', order: 'desc' };
    }
  },

  /**
   * Sets up event listeners for sort controls
   */
  setupEventListeners() {
    // Set up sort field dropdown listener
    const sortFieldSelect = document.getElementById('sort-field');
    if (sortFieldSelect) {
      sortFieldSelect.addEventListener('change', (event) => {
        const newField = event.target.value;
        this.setSortPreference(newField, this.currentSort.order);
        // Trigger re-render
        UIRenderer.renderTransactionList(AppState.getSortedTransactions());
      });
    }

    // Set up sort order toggle button listener
    const sortOrderButton = document.getElementById('sort-order-toggle');
    if (sortOrderButton) {
      sortOrderButton.addEventListener('click', () => {
        const newOrder = this.currentSort.order === 'asc' ? 'desc' : 'asc';
        this.setSortPreference(this.currentSort.field, newOrder);
        // Update button display
        UIRenderer.renderSortControls();
        // Trigger re-render
        UIRenderer.renderTransactionList(AppState.getSortedTransactions());
      });
    }
  },

  /**
   * Loads sort preference from Local Storage
   * @returns {Object} Sort preference with field and order, or default if not found
   */
  loadSortPreference() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn('Local Storage unavailable. Using default sort preference.');
        return { field: 'date', order: 'desc' };
      }

      // Retrieve sort preference from Local Storage
      const jsonData = localStorage.getItem(this.STORAGE_KEY);
      
      // Return default if no data exists
      if (jsonData === null) {
        return { field: 'date', order: 'desc' };
      }

      // Parse JSON
      const sortPreference = JSON.parse(jsonData);

      // Validate structure
      if (
        !sortPreference ||
        typeof sortPreference !== 'object' ||
        !sortPreference.field ||
        !sortPreference.order
      ) {
        console.warn('Invalid sort preference structure, using default');
        return { field: 'date', order: 'desc' };
      }

      // Validate field value
      const validFields = ['date', 'amount', 'category'];
      if (!validFields.includes(sortPreference.field)) {
        console.warn('Invalid sort field, using default');
        return { field: 'date', order: 'desc' };
      }

      // Validate order value
      const validOrders = ['asc', 'desc'];
      if (!validOrders.includes(sortPreference.order)) {
        console.warn('Invalid sort order, using default');
        return { field: 'date', order: 'desc' };
      }

      return sortPreference;
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.error('Corrupted sort preference data: invalid JSON, using default');
        return { field: 'date', order: 'desc' };
      }

      // Handle other errors
      console.error('Failed to load sort preference from Local Storage:', error);
      return { field: 'date', order: 'desc' };
    }
  },

  /**
   * Sets the sort preference and persists to Local Storage
   * @param {string} field - Sort field ('date', 'amount', or 'category')
   * @param {string} order - Sort order ('asc' or 'desc')
   */
  setSortPreference(field, order) {
    try {
      // Validate field
      const validFields = ['date', 'amount', 'category'];
      if (!validFields.includes(field)) {
        console.error('Invalid sort field:', field);
        return;
      }

      // Validate order
      const validOrders = ['asc', 'desc'];
      if (!validOrders.includes(order)) {
        console.error('Invalid sort order:', order);
        return;
      }

      // Update current sort preference
      this.currentSort = { field, order };

      // Save to Local Storage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSort));
        }
      } catch (storageError) {
        console.warn('Failed to save sort preference:', storageError);
        // Continue without saving - app still functions
      }
    } catch (error) {
      console.error('Failed to set sort preference:', error);
    }
  },

  /**
   * Sorts transactions based on current sort preference
   * @param {Transaction[]} transactions - Array of transactions to sort
   * @returns {Transaction[]} Sorted array (does not mutate original)
   */
  sortTransactions(transactions) {
    try {
      // Clone transactions array to avoid mutation
      const sortedTransactions = [...transactions];

      // Apply sort based on current field
      switch (this.currentSort.field) {
        case 'amount':
          return this.sortByAmount(sortedTransactions, this.currentSort.order);
        case 'category':
          return this.sortByCategory(sortedTransactions, this.currentSort.order);
        case 'date':
        default:
          return this.sortByDate(sortedTransactions, this.currentSort.order);
      }
    } catch (error) {
      console.error('Failed to sort transactions:', error);
      // Return original array on error
      return transactions;
    }
  },

  /**
   * Sorts transactions by amount
   * @param {Transaction[]} transactions - Array of transactions to sort
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Transaction[]} Sorted array
   */
  sortByAmount(transactions, order) {
    return transactions.sort((a, b) => {
      if (order === 'desc') {
        // Descending: highest first
        return b.amount - a.amount;
      } else {
        // Ascending: lowest first
        return a.amount - b.amount;
      }
    });
  },

  /**
   * Sorts transactions by category name
   * @param {Transaction[]} transactions - Array of transactions to sort
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Transaction[]} Sorted array
   */
  sortByCategory(transactions, order) {
    return transactions.sort((a, b) => {
      const categoryA = a.category.toLowerCase();
      const categoryB = b.category.toLowerCase();

      if (order === 'asc') {
        // Ascending: A-Z
        return categoryA.localeCompare(categoryB);
      } else {
        // Descending: Z-A
        return categoryB.localeCompare(categoryA);
      }
    });
  },

  /**
   * Sorts transactions by date (using transaction ID which contains timestamp)
   * @param {Transaction[]} transactions - Array of transactions to sort
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Transaction[]} Sorted array
   */
  sortByDate(transactions, order) {
    return transactions.sort((a, b) => {
      // Extract timestamp from transaction ID (format: timestamp-randomstring)
      const timestampA = parseInt(a.id.split('-')[0]);
      const timestampB = parseInt(b.id.split('-')[0]);

      if (order === 'desc') {
        // Descending: newest first
        return timestampB - timestampA;
      } else {
        // Ascending: oldest first
        return timestampA - timestampB;
      }
    });
  }
};

/**
 * AppState - Application State Manager
 * Central state management module that coordinates all application operations
 */
const AppState = {
  transactions: [],
  chartInstance: null,
  customCategories: [],
  sortPreference: {},

  /**
   * Adds a new transaction to the application state
   * @param {string} itemName - Name of the expense item
   * @param {number} amount - Expense amount (positive number)
   * @param {string} category - Category name (default or custom)
   * @returns {boolean} True if transaction was added successfully, false otherwise
   */
  addTransaction(itemName, amount, category) {
    // Validate inputs
    if (!itemName || itemName.trim() === '') {
      return false;
    }
    
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
      return false;
    }
    
    // Validate against all categories (default + custom)
    const allCategories = CategoryManager.getAllCategories();
    if (!allCategories.includes(category)) {
      return false;
    }

    // Create new transaction object with unique ID
    const transaction = createTransaction(itemName.trim(), amount, category);
    
    // Add transaction to transactions array
    this.transactions.push(transaction);
    
    // Save to storage (Task 11.1 - handle save failure gracefully)
    const saveSuccess = StorageModule.save(this.transactions);
    if (!saveSuccess) {
      // Don't remove the transaction - allow app to continue functioning
      // The error message is already shown by StorageModule
      console.warn('Transaction added but not persisted to storage');
    }
    
    // Trigger UI updates with sorted transactions
    UIRenderer.renderTransactionList(this.getSortedTransactions());
    UIRenderer.updateTotalBalance(this.calculateTotal());
    
    // Update chart with new category totals
    ChartManager.update(this.getCategoryTotals());
    
    return true;
  },

  /**
   * Deletes a transaction from the application state
   * @param {string} id - Unique identifier of the transaction to delete
   * @returns {boolean} True if transaction was deleted successfully, false otherwise
   */
  deleteTransaction(id) {
    // Find transaction index by ID
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    
    // Return false if transaction not found
    if (index === -1) {
      return false;
    }
    
    // Store the transaction in case we need to restore it
    const deletedTransaction = this.transactions[index];
    
    // Remove transaction from array
    this.transactions.splice(index, 1);
    
    // Save to storage (Task 11.1 - handle save failure gracefully)
    const saveSuccess = StorageModule.save(this.transactions);
    if (!saveSuccess) {
      // Don't restore the transaction - allow app to continue functioning
      // The error message is already shown by StorageModule
      console.warn('Transaction deleted but change not persisted to storage');
    }
    
    // Trigger UI updates with sorted transactions
    UIRenderer.renderTransactionList(this.getSortedTransactions());
    UIRenderer.updateTotalBalance(this.calculateTotal());
    
    // Update chart with new category totals
    ChartManager.update(this.getCategoryTotals());
    
    return true;
  },

  /**
   * Calculates the total of all transaction amounts
   * @returns {number} Sum of all transaction amounts
   */
  calculateTotal() {
    return this.transactions.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
  },

  /**
   * Calculates spending totals for each category
   * @returns {Object} Object with category totals for all categories (default + custom)
   */
  getCategoryTotals() {
    // Initialize totals for all categories (default + custom)
    const allCategories = CategoryManager.getAllCategories();
    const totals = {};
    
    allCategories.forEach(category => {
      totals[category] = 0;
    });
    
    // Sum up transaction amounts by category
    this.transactions.forEach(transaction => {
      if (totals.hasOwnProperty(transaction.category)) {
        totals[transaction.category] += transaction.amount;
      }
    });
    
    return totals;
  },

  /**
   * Gets sorted transactions based on current sort preference
   * @returns {Transaction[]} Sorted array of transactions
   */
  getSortedTransactions() {
    return SortManager.sortTransactions(this.transactions);
  },

  /**
   * Initializes the application
   * Loads data from storage, sets up UI, and wires event listeners
   */
  init() {
    try {
      // Initialize ThemeManager first to apply saved theme
      ThemeManager.init();
      
      // Initialize CategoryManager to load custom categories
      CategoryManager.init();
      
      // Store reference to custom categories in AppState
      this.customCategories = CategoryManager.customCategories;
      
      // Initialize SortManager to load sort preference
      SortManager.init();
      
      // Store reference to sort preference in AppState
      this.sortPreference = SortManager.currentSort;
      
      // Load transactions from StorageModule
      this.transactions = StorageModule.load();
      
      // Display warning if Local Storage is unavailable (Task 11.3)
      if (!StorageModule.isAvailable) {
        UIRenderer.showWarning('Local Storage unavailable. Your data will not be saved between sessions.');
      }
      
      // Initialize ChartManager with canvas element
      const chartInitialized = ChartManager.init();
      
      if (!chartInitialized) {
        console.error('Failed to initialize chart');
        // Display fallback text-based category totals (Task 11.2)
        ChartManager.showFallback();
      }
      
      // Render initial transaction list with sorted transactions
      UIRenderer.renderTransactionList(this.getSortedTransactions());
      
      // Render category options in form dropdown
      UIRenderer.renderCategoryOptions();
      
      // Render category management UI
      UIRenderer.renderCategoryManagement();
      
      // Update total balance display
      UIRenderer.updateTotalBalance(this.calculateTotal());
      
      // Update chart with initial data
      if (chartInitialized) {
        ChartManager.update(this.getCategoryTotals());
      } else {
        // Update fallback display with initial data
        ChartManager.updateFallback(this.getCategoryTotals());
      }
      
      // Set up form submit event listener
      const form = document.getElementById('expense-form');
      if (form) {
        form.addEventListener('submit', (event) => {
          FormHandler.handleSubmit(event);
        });
      } else {
        console.error('Form element not found');
      }
    } catch (error) {
      console.error('Failed to initialize application:', error);
      // Initialize with empty state on error
      this.transactions = [];
      UIRenderer.renderTransactionList(this.transactions);
      UIRenderer.updateTotalBalance(0);
    }
  }
};

/**
 * UIRenderer - Manages DOM manipulation and UI updates
 * Handles all rendering operations for transactions, balance, form, and errors
 */
const UIRenderer = {
  errorTimeout: null,

  /**
   * Renders the transaction list in the DOM
   * @param {Transaction[]} transactions - Array of transaction objects to render
   */
  renderTransactionList(transactions) {
    // Get transaction list container
    const listElement = document.getElementById('transaction-list');
    
    if (!listElement) {
      console.error('Transaction list element not found');
      return;
    }

    // Clear existing transaction list DOM
    listElement.innerHTML = '';

    // Handle empty list case
    if (transactions.length === 0) {
      // CSS handles empty state with ::after pseudo-element
      return;
    }

    // Create DOM elements for each transaction
    transactions.forEach(transaction => {
      // Check if category is orphaned (deleted custom category)
      const validCategories = CategoryManager.getAllCategories();
      const isOrphaned = !validCategories.includes(transaction.category);
      
      // Create list item
      const listItem = document.createElement('li');
      listItem.className = 'transaction-item';
      listItem.setAttribute('data-category', transaction.category);
      listItem.setAttribute('data-id', transaction.id);
      
      // Add visual indicator for orphaned categories
      if (isOrphaned) {
        listItem.style.opacity = '0.7';
        listItem.style.borderLeftColor = '#999';
      }

      // Create transaction info container
      const infoDiv = document.createElement('div');
      infoDiv.className = 'transaction-info';

      // Create transaction name element
      const nameSpan = document.createElement('span');
      nameSpan.className = 'transaction-name';
      nameSpan.textContent = transaction.itemName;

      // Create transaction category element
      const categorySpan = document.createElement('span');
      categorySpan.className = 'transaction-category';
      
      // Display orphaned category with "(inactive)" suffix
      if (isOrphaned) {
        categorySpan.textContent = `${transaction.category} (inactive)`;
        categorySpan.style.fontStyle = 'italic';
        categorySpan.style.color = '#999';
      } else {
        categorySpan.textContent = transaction.category;
      }

      // Append name and category to info container
      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(categorySpan);

      // Create transaction amount element
      const amountSpan = document.createElement('span');
      amountSpan.className = 'transaction-amount';
      amountSpan.textContent = `$${transaction.amount.toFixed(2)}`;

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete ${transaction.itemName}`);
      
      // Add delete button event listener
      deleteButton.addEventListener('click', () => {
        AppState.deleteTransaction(transaction.id);
      });

      // Append all elements to list item
      listItem.appendChild(infoDiv);
      listItem.appendChild(amountSpan);
      listItem.appendChild(deleteButton);

      // Append list item to list
      listElement.appendChild(listItem);
    });
  },

  /**
   * Updates the total balance display
   * @param {number} total - Total balance amount
   */
  updateTotalBalance(total) {
    // Get balance display element
    const balanceElement = document.getElementById('total-balance');
    
    if (!balanceElement) {
      console.error('Total balance element not found');
      return;
    }

    // Format total as currency
    const formattedTotal = `$${total.toFixed(2)}`;
    
    // Update balance display element
    balanceElement.textContent = formattedTotal;
  },

  /**
   * Clears all form fields
   */
  clearForm() {
    // Get form element
    const form = document.getElementById('expense-form');
    
    if (!form) {
      console.error('Form element not found');
      return;
    }

    // Reset all form fields to empty/default values
    form.reset();
  },

  /**
   * Displays a validation error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Get error message element
    const errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
      console.error('Error message element not found');
      return;
    }

    // Set error message text
    errorElement.textContent = message;
    
    // Add visual styling for error state
    errorElement.classList.add('show');

    // Clear any existing timeout
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    // Auto-dismiss error after 3 seconds
    this.errorTimeout = setTimeout(() => {
      this.hideError();
    }, 3000);
  },

  /**
   * Displays a warning message (Task 11.3)
   * @param {string} message - Warning message to display
   */
  showWarning(message) {
    // Get error message element (reuse for warnings)
    const errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
      console.error('Error message element not found');
      return;
    }

    // Set warning message text
    errorElement.textContent = message;
    
    // Add visual styling for warning state
    errorElement.classList.add('show');
    errorElement.style.backgroundColor = '#ff9800'; // Orange for warning
    errorElement.style.color = '#fff';

    // Clear any existing timeout
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    // Auto-dismiss warning after 5 seconds (longer than errors)
    this.errorTimeout = setTimeout(() => {
      this.hideError();
      errorElement.style.backgroundColor = ''; // Reset to default
      errorElement.style.color = '';
    }, 5000);
  },

  /**
   * Hides the error message
   */
  hideError() {
    // Get error message element
    const errorElement = document.getElementById('error-message');
    
    if (!errorElement) {
      return;
    }

    // Remove visual styling for error state
    errorElement.classList.remove('show');
    
    // Clear error message text
    errorElement.textContent = '';

    // Clear timeout if exists
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  },

  /**
   * Renders category options in the form dropdown
   * Updates the dropdown with default + custom categories
   */
  renderCategoryOptions() {
    // Get category select element
    const selectElement = document.getElementById('category');
    
    if (!selectElement) {
      console.error('Category select element not found');
      return;
    }

    // Store current selection
    const currentValue = selectElement.value;

    // Clear existing options except the first placeholder
    selectElement.innerHTML = '<option value="">Select a category</option>';

    // Get all categories from CategoryManager
    const allCategories = CategoryManager.getAllCategories();

    // Add options for each category
    allCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      selectElement.appendChild(option);
    });

    // Restore previous selection if it still exists
    if (currentValue && allCategories.includes(currentValue)) {
      selectElement.value = currentValue;
    }
  },

  /**
   * Renders the custom category management UI
   * Displays custom category list with delete buttons and count
   */
  renderCategoryManagement() {
    // Get custom category list element
    const listElement = document.getElementById('custom-category-list');
    
    if (!listElement) {
      console.error('Custom category list element not found');
      return;
    }

    // Clear existing list
    listElement.innerHTML = '';

    // Get custom categories
    const customCategories = CategoryManager.customCategories;

    // Create list items for each custom category
    customCategories.forEach(category => {
      const listItem = document.createElement('li');
      listItem.className = 'custom-category-item';

      // Create category name span
      const nameSpan = document.createElement('span');
      nameSpan.className = 'custom-category-name';
      nameSpan.textContent = category;

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete-category';
      deleteButton.textContent = 'Delete';
      deleteButton.setAttribute('aria-label', `Delete ${category} category`);
      
      // Add delete button event listener
      deleteButton.addEventListener('click', () => {
        const result = CategoryManager.deleteCategory(category);
        if (result.success) {
          // Update UI after successful deletion
          this.renderCategoryManagement();
          this.renderCategoryOptions();
          this.updateCategoryCount();
          // Update chart to reflect changes
          ChartManager.update(AppState.getCategoryTotals());
        } else {
          // Show error message
          this.showError(result.error);
        }
      });

      // Append elements to list item
      listItem.appendChild(nameSpan);
      listItem.appendChild(deleteButton);

      // Append list item to list
      listElement.appendChild(listItem);
    });

    // Update category count
    this.updateCategoryCount();
  },

  /**
   * Updates the category count display and add button state
   */
  updateCategoryCount() {
    // Get category count element
    const countElement = document.getElementById('category-count');
    
    if (!countElement) {
      console.error('Category count element not found');
      return;
    }

    // Get add category button
    const addButton = document.getElementById('add-category-btn');
    
    if (!addButton) {
      console.error('Add category button not found');
      return;
    }

    // Get current count
    const count = CategoryManager.customCategories.length;
    const max = CategoryManager.MAX_CUSTOM_CATEGORIES;

    // Update count display
    countElement.textContent = `${count}/${max} custom categories`;

    // Disable button if at max, enable otherwise
    if (count >= max) {
      addButton.disabled = true;
      // Show max limit message
      const errorElement = document.getElementById('error-message');
      if (errorElement && !errorElement.classList.contains('show')) {
        this.showError(`Maximum of ${max} custom categories reached`);
      }
    } else {
      addButton.disabled = false;
    }
  },

  /**
   * Renders the sort controls with current sort preference
   * Updates the sort field dropdown and order toggle button
   */
  renderSortControls() {
    // Get sort field select element
    const sortFieldSelect = document.getElementById('sort-field');
    
    if (!sortFieldSelect) {
      console.error('Sort field select element not found');
      return;
    }

    // Get sort order toggle button
    const sortOrderButton = document.getElementById('sort-order-toggle');
    
    if (!sortOrderButton) {
      console.error('Sort order toggle button not found');
      return;
    }

    // Get current sort preference from SortManager
    const currentSort = SortManager.currentSort;

    // Update sort field dropdown to reflect current selection
    sortFieldSelect.value = currentSort.field;

    // Update sort order button
    const iconElement = sortOrderButton.querySelector('.sort-order-icon');
    const textElement = sortOrderButton.querySelector('.sort-order-text');

    if (currentSort.order === 'asc') {
      // Ascending order
      if (iconElement) {
        iconElement.textContent = '↑';
      }
      if (textElement) {
        textElement.textContent = 'Ascending';
      }
      sortOrderButton.setAttribute('aria-label', 'Sort order: Ascending');
    } else {
      // Descending order
      if (iconElement) {
        iconElement.textContent = '↓';
      }
      if (textElement) {
        textElement.textContent = 'Descending';
      }
      sortOrderButton.setAttribute('aria-label', 'Sort order: Descending');
    }
  }
};

/**
 * ChartManager - Manages Chart.js pie chart lifecycle
 * Handles chart initialization, updates, and cleanup
 */
const ChartManager = {
  chartInstance: null,
  fallbackMode: false,

  /**
   * Initializes the Chart.js pie chart
   * @returns {boolean} True if chart was initialized successfully, false otherwise
   */
  init() {
    try {
      // Check if Chart.js is loaded (Task 11.2)
      if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded. Using fallback display.');
        this.fallbackMode = true;
        return false;
      }

      // Get canvas element from DOM
      const canvasElement = document.getElementById('spending-chart');

      if (!canvasElement) {
        console.error('Canvas element not found');
        this.fallbackMode = true;
        return false;
      }

      // Get 2D context
      const ctx = canvasElement.getContext('2d');

      // Get theme-appropriate colors from ThemeManager
      const themeColors = ThemeManager.getThemeColors();

      // Define distinct colors for default categories using theme colors
      this.defaultCategoryColors = {
        Food: themeColors.food,
        Transport: themeColors.transport,
        Fun: themeColors.fun
      };

      // Create Chart.js pie chart instance
      this.chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 14
                },
                color: themeColors.text
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      this.fallbackMode = true;
      return false;
    }
  },

  /**
   * Shows fallback text-based category totals (Task 11.2)
   */
  showFallback() {
    const chartSection = document.querySelector('.chart-section');
    if (!chartSection) {
      console.error('Chart section not found');
      return;
    }

    // Hide the canvas
    const canvas = document.getElementById('spending-chart');
    if (canvas) {
      canvas.style.display = 'none';
    }

    // Create fallback container
    const fallbackDiv = document.createElement('div');
    fallbackDiv.id = 'chart-fallback';
    fallbackDiv.style.padding = '20px';
    fallbackDiv.style.backgroundColor = '#f5f5f5';
    fallbackDiv.style.borderRadius = '8px';
    fallbackDiv.style.textAlign = 'center';

    // Add message
    const message = document.createElement('p');
    message.textContent = 'Chart visualization unavailable. Showing text summary:';
    message.style.marginBottom = '15px';
    message.style.color = '#666';
    fallbackDiv.appendChild(message);

    // Add category totals container
    const totalsDiv = document.createElement('div');
    totalsDiv.id = 'fallback-totals';
    totalsDiv.style.fontSize = '16px';
    totalsDiv.style.lineHeight = '1.8';
    fallbackDiv.appendChild(totalsDiv);

    // Insert fallback after canvas
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.appendChild(fallbackDiv);
    }
  },

  /**
   * Updates fallback display with category totals (Task 11.2)
   * @param {Object} categoryTotals - Object with category totals for all categories
   */
  updateFallback(categoryTotals) {
    const totalsDiv = document.getElementById('fallback-totals');
    if (!totalsDiv) {
      return;
    }

    // Clear existing content
    totalsDiv.innerHTML = '';

    // Filter and display categories with non-zero spending
    let hasData = false;
    Object.keys(categoryTotals).forEach(category => {
      const total = categoryTotals[category];

      if (total > 0) {
        hasData = true;
        const categoryDiv = document.createElement('div');
        categoryDiv.style.marginBottom = '10px';

        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = this.getCategoryColor(category);
        colorBox.style.marginRight = '10px';
        colorBox.style.verticalAlign = 'middle';
        colorBox.style.borderRadius = '3px';

        const text = document.createElement('span');
        text.textContent = `${category}: ${total.toFixed(2)}`;
        text.style.fontWeight = 'bold';

        categoryDiv.appendChild(colorBox);
        categoryDiv.appendChild(text);
        totalsDiv.appendChild(categoryDiv);
      }
    });

    // Show message if no data
    if (!hasData) {
      totalsDiv.textContent = 'No spending data yet';
      totalsDiv.style.color = '#999';
    }
  },

  /**
   * Gets the color for a category based on current theme
   * @param {string} categoryName - Name of the category
   * @returns {string} Color hex code for the category
   */
  getCategoryColor(categoryName) {
    // Get theme-appropriate colors
    const themeColors = ThemeManager.getThemeColors();
    
    // Check if it's a default category
    if (this.defaultCategoryColors && this.defaultCategoryColors[categoryName]) {
      return this.defaultCategoryColors[categoryName];
    }
    
    // For custom categories, generate a distinct color
    // Use a simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with good saturation and lightness
    // Adjust lightness based on theme
    const hue = Math.abs(hash % 360);
    const saturation = 65;
    const lightness = ThemeManager.currentTheme === 'dark' ? 65 : 55;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  },

  /**
   * Updates the chart with new category totals
   * @param {Object} categoryTotals - Object with category totals for all categories
   */
  update(categoryTotals) {
    // Use fallback if in fallback mode (Task 11.2)
    if (this.fallbackMode) {
      this.updateFallback(categoryTotals);
      return;
    }

    // Check if chart instance exists
    if (!this.chartInstance) {
      console.error('Chart instance not initialized');
      return;
    }

    try {
      // Filter out categories with zero spending
      const labels = [];
      const data = [];
      const colors = [];

      Object.keys(categoryTotals).forEach(category => {
        const total = categoryTotals[category];

        // Only include categories with non-zero spending
        if (total > 0) {
          labels.push(category);
          data.push(total);
          colors.push(this.getCategoryColor(category));
        }
      });

      // Update chart data
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].backgroundColor = colors;

      // Trigger chart re-render
      this.chartInstance.update();
    } catch (error) {
      console.error('Failed to update chart:', error);
    }
  },

  /**
   * Updates chart colors based on current theme
   * Called when theme changes to apply theme-appropriate colors
   */
  updateThemeColors() {
    // Skip if in fallback mode or chart not initialized
    if (this.fallbackMode || !this.chartInstance) {
      return;
    }

    try {
      // Get theme-appropriate colors from ThemeManager
      const themeColors = ThemeManager.getThemeColors();

      // Update default category colors mapping
      this.defaultCategoryColors = {
        Food: themeColors.food,
        Transport: themeColors.transport,
        Fun: themeColors.fun
      };

      // Update chart options for text and grid colors
      if (this.chartInstance.options.plugins && this.chartInstance.options.plugins.legend) {
        this.chartInstance.options.plugins.legend.labels.color = themeColors.text;
      }

      // Update background colors for existing data
      if (this.chartInstance.data.labels && this.chartInstance.data.labels.length > 0) {
        const updatedColors = this.chartInstance.data.labels.map(label => {
          return this.getCategoryColor(label);
        });
        this.chartInstance.data.datasets[0].backgroundColor = updatedColors;
      }

      // Trigger chart re-render
      this.chartInstance.update();
    } catch (error) {
      console.error('Failed to update chart theme colors:', error);
    }
  },

  /**
   * Destroys the chart instance and cleans up resources
   */
  destroy() {
    if (this.chartInstance) {
      try {
        this.chartInstance.destroy();
        this.chartInstance = null;
      } catch (error) {
        console.error('Failed to destroy chart:', error);
      }
    }
  }
};

/**
 * FormHandler - Validates and processes form submissions
 * Handles form validation and coordinates with AppState and UIRenderer
 */
const FormHandler = {
  /**
   * Validates form inputs
   * @param {string} itemName - Name of the expense item
   * @param {string} amount - Amount as string from form input
   * @param {string} category - Selected category
   * @returns {Object} Validation result with {valid: boolean, error: string}
   */
  validate(itemName, amount, category) {
    // Check for empty item name
    if (!itemName || itemName.trim() === '') {
      return {
        valid: false,
        error: 'Please enter an item name'
      };
    }

    // Check for empty amount
    if (!amount || amount.trim() === '') {
      return {
        valid: false,
        error: 'Please enter an amount'
      };
    }

    // Check if amount is a valid positive number
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return {
        valid: false,
        error: 'Amount must be a positive number'
      };
    }

    // Check for empty category selection
    if (!category || category.trim() === '') {
      return {
        valid: false,
        error: 'Please select a category'
      };
    }

    // All validations passed
    return {
      valid: true,
      error: ''
    };
  },

  /**
   * Handles form submission
   * @param {Event} event - Form submit event
   */
  handleSubmit(event) {
    // Prevent default form submission
    event.preventDefault();

    // Extract form values
    const form = event.target;
    const itemName = form.elements['itemName'].value;
    const amount = form.elements['amount'].value;
    const category = form.elements['category'].value;

    // Validate inputs
    const validationResult = this.validate(itemName, amount, category);

    if (validationResult.valid) {
      // Convert amount to number
      const amountNumber = parseFloat(amount);

      // Call AppState.addTransaction()
      const success = AppState.addTransaction(itemName, amountNumber, category);

      if (success) {
        // Clear form on successful addition
        UIRenderer.clearForm();
        
        // Hide any existing error messages
        UIRenderer.hideError();
      } else {
        // Show error if transaction couldn't be added
        UIRenderer.showError('Failed to add transaction');
      }
    } else {
      // Show validation error
      UIRenderer.showError(validationResult.error);
    }
  }
};

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    AppState.init();
  } catch (error) {
    console.error('Application initialization failed:', error);
    // Display error message to user
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = 'Failed to initialize application. Please refresh the page.';
      errorElement.classList.add('show');
    }
  }
});
