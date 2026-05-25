# Unit Testing Guide for Log Management Project

This document provides comprehensive guidance on writing and running unit tests for the log management project using Vitest and React Testing Library.

## Setup

### Testing Stack
- **Test Runner**: [Vitest](https://vitest.dev/) - Fast unit test framework optimized for Vite
- **UI Testing**: [React Testing Library](https://testing-library.com/react) - Low-level component testing
- **DOM Environment**: [happy-dom](https://github.com/capricorn86/happy-dom) - Lightweight DOM implementation
- **Coverage Reporter**: Built-in with v8

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Global test setup
- `src/test/utils.tsx` - Custom render function with providers

## Running Tests

### Available Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

### Basic Test File Organization

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature/Component Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange - Set up test data
      const input = 'test';
      
      // Act - Perform the action
      const result = processInput(input);
      
      // Assert - Verify the result
      expect(result).toBe('expected output');
    });
  });
});
```

### AAA Pattern (Arrange-Act-Assert)
Tests should follow the AAA pattern:
1. **Arrange** - Set up test data and conditions
2. **Act** - Perform the action being tested
3. **Assert** - Verify the results

## Example Tests

### 1. Utility Function Tests

**File**: `src/utils/coordinates.test.ts`

```typescript
describe('Coordinates Utilities', () => {
  it('should return true for valid latitude', () => {
    expect(isValidLatitude(45)).toBe(true);
  });

  it('should return false for invalid latitude', () => {
    expect(isValidLatitude(91)).toBe(false);
  });
});
```

**Testing Patterns for Utilities**:
- Test boundary conditions
- Test edge cases (0, negative, extreme values)
- Test invalid inputs
- Test return types

### 2. Hook Tests

**File**: `src/hooks/useStatusOptions.test.tsx`

```typescript
import { useStatusOptions } from '@/hooks/useStatusOptions';

describe('useStatusOptions Hook', () => {
  it('should return an array of status options', () => {
    const options = useStatusOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options).toHaveLength(4);
  });

  it('should have correct status structure', () => {
    const options = useStatusOptions();
    options.forEach((option) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('key');
      expect(option).toHaveProperty('name');
      expect(option).toHaveProperty('color');
    });
  });
});
```

**Testing Patterns for Hooks**:
- Mock dependencies (like `useTranslation`)
- Verify hook returns expected structure
- Test with different inputs/props
- Test hook behavior under different states

### 3. Component Tests

**File**: `src/__tests__/components.example.test.tsx`

```typescript
import { render, screen, fireEvent } from '@/test/utils';

describe('Button Component', () => {
  it('should render with children text', () => {
    render(<Button onClick={() => {}}>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Testing Patterns for Components**:
- Use `testing-library/react` for DOM queries
- Test user interactions with `fireEvent` or `userEvent`
- Mock event handlers with `vi.fn()`
- Query by accessible roles/labels
- Test conditional rendering
- Test form input changes

### 4. API Tests

**File**: `src/__tests__/api.example.test.ts`

```typescript
describe('Fetch Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make a GET request', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });
    global.fetch = mockFetch as any;

    const response = await fetch('http://api.example.com/data');
    expect(mockFetch).toHaveBeenCalledWith('http://api.example.com/data');
  });
});
```

**Testing Patterns for API**:
- Mock global `fetch`
- Test successful responses
- Test error responses
- Test request headers and body
- Test query parameters
- Verify API endpoints are called correctly

## Mocking

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
```

### Mocking Functions

```typescript
const handleClick = vi.fn();
const handleClickReturnValue = vi.fn().mockReturnValue(42);
const handleClickRejectValue = vi.fn().mockRejectedValue(new Error('error'));
```

### Verifying Mock Calls

```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

## Common Assertions

### Value Assertions
```typescript
expect(value).toBe(expected);              // Strict equality
expect(value).toEqual(expected);           // Deep equality
expect(value).toMatch(/regex/);            // String regex match
expect(value).toContain(element);          // Array/string contains
```

### Type Assertions
```typescript
expect(value).toBeTruthy();                // Truthy value
expect(value).toBeFalsy();                 // Falsy value
expect(value).toBeNull();                  // Null check
expect(value).toBeUndefined();             // Undefined check
expect(value).toBeDefined();               // Defined check
```

### Number Assertions
```typescript
expect(value).toBeGreaterThan(5);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(5.1);            // For floats
```

### DOM Assertions (React Testing Library)
```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('attr', 'value');
expect(input).toHaveValue('text');
```

## Best Practices

### 1. Test Naming
- Use descriptive `it()` descriptions starting with "should"
- Describe what the test verifies, not how
- ✅ `it('should throw error when email is invalid')`
- ❌ `it('tests email validation')`

### 2. Test Isolation
- Each test should be independent
- Use `beforeEach()` for common setup
- Avoid test interdependencies
- Always clean up mocks

### 3. Focus on Behavior
- Test what users see and do
- Don't test implementation details
- Test observable outcomes
- Avoid testing private methods

### 4. Keep Tests Simple
- One assertion per test is ideal
- Multiple assertions acceptable if related
- Avoid complex test setups
- Use helper functions for repetitive code

### 5. Mock Sparingly
- Mock external dependencies only
- Don't mock the code you're testing
- Mock API calls, but test logic
- Keep mocks simple and clear

### 6. Async Testing
```typescript
// Using async/await
it('should load data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// Using return Promise
it('should load data', () => {
  return fetchData().then((result) => {
    expect(result).toBeDefined();
  });
});
```

## Coverage Goals

Generate coverage reports to understand test coverage:

```bash
npm run test:coverage
```

Coverage reports are saved in a coverage folder. Aim for:
- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 75%+
- **Statements**: 80%+

## Custom Render Function

The custom `render` function in `src/test/utils.tsx` automatically wraps components with necessary providers:

```typescript
import { render } from '@/test/utils';

// Automatically includes BrowserRouter and other providers
render(<MyComponent />);
```

Equivalent to:
```typescript
render(
  <BrowserRouter>
    <MyComponent />
  </BrowserRouter>
);
```

## Debugging Tests

### VS Code Integration
1. Add breakpoints in test files
2. Use Debug: JavaScript Debug Terminal
3. Run tests with `npm run test:watch`
4. Browser DevTools opens automatically

### Console Logging
```typescript
import { screen, debug } from '@/test/utils';

it('should debug', () => {
  const { debug } = render(<Component />);
  debug(); // Prints DOM structure
  console.log(screen.logTestingPlaygroundURL());
});
```

### Vitest UI
```bash
npm run test:ui
```
Opens browser dashboard showing:
- Test status
- Coverage metrics
- Failed tests details
- Execution times

## File Structure

```
src/
├── test/
│   ├── setup.ts           # Global test setup
│   └── utils.tsx          # Custom render function
├── __tests__/
│   ├── components.example.test.tsx
│   ├── api.example.test.ts
│   └── testing-patterns.example.test.ts
├── utils/
│   ├── coordinates.test.ts
│   └── commonFunctions.test.ts
├── hooks/
│   └── useStatusOptions.test.tsx
└── components/
    └── [component]/
        └── [component].test.tsx
```

## Next Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run initial tests**:
   ```bash
   npm run test
   ```

3. **Check the UI dashboard**:
   ```bash
   npm run test:ui
   ```

4. **Start writing tests for your components**:
   - Create `.test.ts` or `.test.tsx` files
   - Follow patterns from example tests
   - Run `npm run test:watch` while developing

5. **Monitor coverage**:
   ```bash
   npm run test:coverage
   ```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Troubleshooting

### Tests fail with module not found errors
- Ensure path aliases in `tsconfig.json` match Vitest config
- Restart test runner after configuration changes

### Mocks not working
- Place mock declarations before imports
- Call `vi.clearAllMocks()` in `beforeEach()`
- Check mock implementation matches usage

### DOM queries not finding elements
- Use `screen.debug()` to see current DOM
- Use accessible role queries instead of test IDs
- Check that elements are rendered and visible
