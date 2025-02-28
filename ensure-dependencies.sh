#!/bin/bash
# ensure-dependencies.sh - Install and configure all dependencies for testing

echo "=== Installing and configuring all dependencies ==="

# Install node dependencies
echo "Installing npm dependencies..."
npm install

# Make sure Vitest is installed
echo "Ensuring Vitest is installed..."
npm install --save-dev vitest jsdom @vitest/coverage-v8 @testing-library/jest-dom @testing-library/react @testing-library/user-event

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install

# Ensure TypeScript settings are correct
echo "Checking TypeScript configuration..."
if ! grep -q "\"Mock_project\"" tsconfig.json; then
  echo "Warning: Mock_project is not included in tsconfig.json"
  echo "Please ensure your tsconfig.json includes: \"include\": [\"src\", \"e2e\", \"Mock_project\"]"
fi

# Ensure Vitest configuration is correct
echo "Checking Vitest configuration..."
if ! grep -q "Mock_project" vitest.config.ts; then
  echo "Warning: Mock_project is not included in vitest.config.ts"
  echo "Please ensure your vitest.config.ts includes: \"include\": [\"src/**/*.{test,spec}.{ts,tsx}\", \"Mock_project/**/*.{test,spec}.{ts,tsx}\"]"
fi

echo "=== Dependency setup complete! ==="
echo "You can now run tests with:"
echo "npm test            - Run all tests"
echo "npm run test:e2e    - Run E2E tests"
echo "./Mock_project/test-end-to-end.sh  - Run end-to-end tests for the mock project"
