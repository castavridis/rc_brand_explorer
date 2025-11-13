# Quickstart Guide: Brand Logo Browser

**Feature**: 001-logo-browser
**Date**: 2025-11-13
**For**: Developers implementing the Brand Logo Browser

## Overview

This guide provides step-by-step instructions for setting up the development environment and implementing the Brand Logo Browser feature. Follow these steps sequentially to build the application according to the specification and design artifacts.

---

## Prerequisites

### Required Software

- **Node.js**: 20.x or later (LTS recommended)
  ```bash
  node --version  # Should output v20.x.x or higher
  ```

- **Package Manager**: npm 10+ or pnpm 8+
  ```bash
  npm --version   # Should output 10.x.x or higher
  # OR
  pnpm --version  # Should output 8.x.x or higher
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Error Lens
- **Browser**: Chrome/Firefox/Safari (latest version)
- **React DevTools** browser extension

---

## Step 1: Initialize Project

### 1.1 Create React + TypeScript + Vite Project

```bash
# Navigate to project root
cd rc_brand_explorer

# Create Vite project with React + TypeScript template
npm create vite@latest . -- --template react-ts

# Follow prompts to confirm overwriting (if directory exists)
```

### 1.2 Install Dependencies

```bash
# Install project dependencies
npm install

# Install development dependencies
npm install -D \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  jsdom \
  @axe-core/react \
  eslint \
  prettier
```

### 1.3 Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.4 Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

---

## Step 2: Create Data Structure

### 2.1 Create Directory Structure

```bash
# Create required directories
mkdir -p assets/logos
mkdir -p data/brands
mkdir -p src/components/{LogoGrid,LogoCard,SearchBar,FilterPanel,SortControls,LogoModal}
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/types
mkdir -p tests/{components,services,integration}
```

### 2.2 Create Brand Data Schema

Copy the JSON Schema from `specs/001-logo-browser/contracts/brand-schema.json` to `data/brands/schema.json`.

### 2.3 Create Sample Brand Data

Create `data/brands/brands.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-13T00:00:00Z",
  "brands": [
    {
      "id": "nike-inc",
      "name": "Nike",
      "slug": "nike",
      "category": "Apparel & Fashion",
      "logoPath": "assets/logos/nike.svg",
      "websiteUrl": "https://www.nike.com",
      "description": "Athletic footwear and apparel company",
      "tags": ["sports", "footwear", "apparel"],
      "dateAdded": "2025-11-13T00:00:00Z",
      "featured": false
    },
    {
      "id": "apple-inc",
      "name": "Apple",
      "slug": "apple",
      "category": "Technology",
      "logoPath": "assets/logos/apple.svg",
      "websiteUrl": "https://www.apple.com",
      "description": "Consumer electronics and software company",
      "tags": ["technology", "electronics", "software"],
      "dateAdded": "2025-11-13T00:00:00Z",
      "featured": true
    }
  ]
}
```

### 2.4 Add Sample Logo Files

Place 2-3 sample logo files in `assets/logos/`:
- `nike.svg`
- `apple.svg`

(Use placeholder SVGs or real logos if licensed)

---

## Step 3: Define TypeScript Types

### 3.1 Create Type Definitions

Create `src/types/brand.ts`:

```typescript
export type BrandCategory =
  | 'Technology'
  | 'Apparel & Fashion'
  | 'Food & Beverage'
  | 'Automotive'
  | 'Finance & Banking'
  | 'Healthcare'
  | 'Media & Entertainment'
  | 'Retail'
  | 'Sports & Fitness'
  | 'Other';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category: BrandCategory;
  logoPath: string;
  websiteUrl?: string | null;
  description?: string;
  tags?: string[];
  dateAdded: string;
  featured?: boolean;
}

export type SortOption = 'alphabetical-asc' | 'alphabetical-desc' | 'newest' | 'oldest' | 'random';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

---

## Step 4: Implement Services

### 4.1 Brand Loader Service

Create `src/services/brandLoader.ts`:

```typescript
import type { Brand } from '@/types/brand';

export async function loadBrands(): Promise<Brand[]> {
  try {
    const response = await fetch('/data/brands/brands.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.brands;
  } catch (error) {
    console.error('Failed to load brands:', error);
    throw new Error('Failed to load brand data. Please try again later.');
  }
}
```

### 4.2 Search/Filter Service

Create `src/services/searchFilter.ts`:

```typescript
import type { Brand, BrandCategory, SortOption } from '@/types/brand';

export function searchBrands(brands: Brand[], query: string): Brand[] {
  if (!query.trim()) return brands;

  const lowerQuery = query.toLowerCase();
  return brands.filter(brand => {
    const searchableText = [
      brand.name,
      brand.description || '',
      ...(brand.tags || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery);
  });
}

export function filterByCategory(brands: Brand[], categories: BrandCategory[]): Brand[] {
  if (categories.length === 0) return brands;
  return brands.filter(brand => categories.includes(brand.category));
}

export function sortBrands(brands: Brand[], option: SortOption): Brand[] {
  const sorted = [...brands];

  switch (option) {
    case 'alphabetical-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'alphabetical-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    default:
      return sorted;
  }
}
```

---

## Step 5: Implement Components

### 5.1 LogoCard Component

Create `src/components/LogoCard/LogoCard.tsx`:

```typescript
import React from 'react';
import type { Brand } from '@/types/brand';
import './LogoCard.module.css';

interface LogoCardProps {
  brand: Brand;
  onClick: () => void;
}

export const LogoCard: React.FC<LogoCardProps> = React.memo(({ brand, onClick }) => {
  return (
    <article
      className="logo-card"
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`View ${brand.name} logo details`}
    >
      <div className="logo-card__image-container">
        <img
          src={`/${brand.logoPath}`}
          alt={`${brand.name} logo`}
          loading="lazy"
          decoding="async"
          className="logo-card__image"
        />
      </div>
      <div className="logo-card__content">
        <h3 className="logo-card__title">{brand.name}</h3>
        <p className="logo-card__category">{brand.category}</p>
      </div>
    </article>
  );
});

LogoCard.displayName = 'LogoCard';
```

Create `src/components/LogoCard/LogoCard.module.css`:

```css
.logo-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logo-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.logo-card:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.logo-card__image-container {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.logo-card__image {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.logo-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.logo-card__category {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}
```

### 5.2 LogoGrid Component

Create `src/components/LogoGrid/LogoGrid.tsx`:

```typescript
import React from 'react';
import type { Brand } from '@/types/brand';
import { LogoCard } from '../LogoCard/LogoCard';
import './LogoGrid.module.css';

interface LogoGridProps {
  brands: Brand[];
  onBrandClick: (brand: Brand) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const LogoGrid: React.FC<LogoGridProps> = ({
  brands,
  onBrandClick,
  loading = false,
  emptyMessage = 'No logos found',
}) => {
  if (loading) {
    return <div className="logo-grid__loading">Loading logos...</div>;
  }

  if (brands.length === 0) {
    return <div className="logo-grid__empty">{emptyMessage}</div>;
  }

  return (
    <div className="logo-grid" role="list">
      {brands.map((brand) => (
        <LogoCard
          key={brand.id}
          brand={brand}
          onClick={() => onBrandClick(brand)}
        />
      ))}
    </div>
  );
};
```

Create `src/components/LogoGrid/LogoGrid.module.css`:

```css
.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.logo-grid__loading,
.logo-grid__empty {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .logo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
```

### 5.3 SearchBar Component

Create `src/components/SearchBar/SearchBar.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  debounce?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search brands...',
  debounce = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange]);

  return (
    <div className="search-bar">
      <label htmlFor="brand-search" className="search-bar__label">
        Search brands
      </label>
      <input
        id="brand-search"
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        aria-describedby="search-instructions"
      />
      <p id="search-instructions" className="visually-hidden">
        Search by brand name, description, or tags
      </p>
    </div>
  );
};
```

---

## Step 6: Implement Main App

Create `src/App.tsx`:

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import type { Brand, BrandCategory, SortOption } from './types/brand';
import { loadBrands } from './services/brandLoader';
import { searchBrands, filterByCategory, sortBrands } from './services/searchFilter';
import { LogoGrid } from './components/LogoGrid/LogoGrid';
import { SearchBar } from './components/SearchBar/SearchBar';
import './App.css';

function App() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<BrandCategory[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical-asc');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadBrands()
      .then(setBrands)
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands = useMemo(() => {
    let result = brands;
    result = searchBrands(result, searchQuery);
    result = filterByCategory(result, selectedCategories);
    result = sortBrands(result, sortOption);
    return result;
  }, [brands, searchQuery, selectedCategories, sortOption]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Brand Logo Browser</h1>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>
      <main className="app__main">
        <LogoGrid
          brands={filteredBrands}
          onBrandClick={setSelectedBrand}
          loading={loading}
          emptyMessage="No brands match your search"
        />
      </main>
    </div>
  );
}

export default App;
```

---

## Step 7: Run Development Server

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

---

## Step 8: Testing

### 8.1 Configure Vitest

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

### 8.2 Write Component Tests

Create `tests/components/LogoCard.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoCard } from '../../src/components/LogoCard/LogoCard';
import type { Brand } from '../../src/types/brand';

const mockBrand: Brand = {
  id: 'test-brand',
  name: 'Test Brand',
  slug: 'test-brand',
  category: 'Technology',
  logoPath: 'assets/logos/test.svg',
  dateAdded: '2025-11-13T00:00:00Z',
};

describe('LogoCard', () => {
  it('renders brand name and category', () => {
    render(<LogoCard brand={mockBrand} onClick={() => {}} />);

    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<LogoCard brand={mockBrand} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 8.3 Run Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Step 9: Accessibility Validation

### 9.1 Add Axe-Core

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 9.2 Run Lighthouse Audit

1. Open browser DevTools
2. Navigate to Lighthouse tab
3. Run audit with "Accessibility" category
4. Target: Score 90+

---

## Step 10: Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate between logos |
| Enter | Open logo detail modal |
| Escape | Close modal |
| Arrow Keys | Navigate grid (future enhancement) |

---

## Troubleshooting

### Issue: Images not loading

**Solution**: Ensure logo files are in `public/assets/logos/` or adjust Vite public directory config.

### Issue: Type errors in VS Code

**Solution**: Restart TypeScript server (Cmd+Shift+P → "TypeScript: Restart TS Server")

### Issue: Tests failing

**Solution**: Ensure `@testing-library/jest-dom` is imported in test setup file.

---

## Next Steps

After completing this quickstart:

1. Run `/speckit.tasks` to generate implementation task list
2. Implement remaining components (FilterPanel, SortControls, LogoModal)
3. Add more sample brand data
4. Conduct usability testing (Constitution Principle III requirement)
5. Optimize performance for 500+ logos if needed

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Testing Library](https://testing-library.com/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)

---

**Document Status**: Ready for implementation
**Last Updated**: 2025-11-13
