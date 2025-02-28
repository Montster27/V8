#!/bin/bash
# fix-env.sh - Fix environment issues for testing

# Exit on error
set -e

echo "=== Fixing environment issues ==="

# Create required directories
mkdir -p src/domain/valueObjects
mkdir -p src/domain/types
mkdir -p src/infrastructure/state
mkdir -p src/interface/components/resources
mkdir -p e2e-results

# Make sure Playwright browsers are installed
echo "Installing Playwright browsers..."
npx playwright install

# Create a proper tsconfig to include all directories
echo "Updating TypeScript configuration..."
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "e2e", "Mock_project"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Ensure the Vitest configuration includes all directories
echo "Updating Vitest configuration..."
cat > vitest.config.ts << EOL
// /Users/montysharma/Documents/v8/MMV08/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'Mock_project/**/*.{test,spec}.{ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOL

# Make script files executable
echo "Making scripts executable..."
chmod +x ./Mock_project/setup-test.sh
chmod +x ./Mock_project/run-tests.sh
chmod +x ./Mock_project/test-end-to-end.sh

echo "=== Environment fixes complete ==="
echo "You can now run: cd Mock_project && ./test-end-to-end.sh"
