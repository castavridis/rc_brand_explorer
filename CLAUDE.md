# rc_brand_explorer Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-13

## Active Technologies
- TypeScript 5.3+ (existing application stack) + Vite 5+ (build tool), React 18+ (UI framework), Vercel CLI (deployment tool) (002-vercel-deployment)
- Static assets (JSON, SVG) served from deployment CDN (002-vercel-deployment)
- TypeScript 5.3+ (existing project standard) (003-logo-dataset-import)
- File system (CSV and image files; output to /data/brands/ directory structure) (003-logo-dataset-import)
- TypeScript 5.3+ (existing project standard) + React 18.2, Vite 5.0, csv-parser 3.0 (existing), Commander 11.1 (existing) (004-quarterly-data-association)
- Static JSON files served from /public/assets/data/ (matching existing brands.json pattern), CSV files in /public/test-data/ (or production location) (004-quarterly-data-association)

- (001-logo-browser)

## Project Structure

```text
src/
tests/
```

## Commands

### Brand Import
```bash
# Import brand logos dataset from CSV file
npm run import-brands <csv-path> <logos-dir> [output-dir]

# Examples:
npm run import-brands ./data/brands.csv ./data/Logos
npm run import-brands ./data/brands.csv ./data/Logos ./custom-output

# Options:
#   -v, --verbose    Enable detailed logging
#   -d, --dry-run    Validate data without writing files
#   --version        Show version number
#   --help           Show help

# With flags:
npm run import-brands ./data/brands.csv ./data/Logos -- --verbose
npm run import-brands ./data/brands.csv ./data/Logos -- --dry-run
``` 

## Code Style

: Follow standard conventions

## Recent Changes
- 004-quarterly-data-association: Added TypeScript 5.3+ (existing project standard) + React 18.2, Vite 5.0, csv-parser 3.0 (existing), Commander 11.1 (existing)
- 003-logo-dataset-import: Added TypeScript 5.3+ (existing project standard)
- 002-vercel-deployment: Added TypeScript 5.3+ (existing application stack) + Vite 5+ (build tool), React 18+ (UI framework), Vercel CLI (deployment tool)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
