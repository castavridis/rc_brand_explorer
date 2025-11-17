# Quickstart: Brand Logos Dataset Import

**Feature**: 003-logo-dataset-import
**Date**: 2025-11-14

## Overview

This guide explains how to use the brand logos dataset import feature to populate your application with brand data from CSV files and logo images.

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Brand data in CSV format with `logoName` and `fileName` columns
- Logo image files (PNG, JPEG, or GIF) in a directory

## Quick Start

### 1. Prepare Your Data

Organize your data into two components:

**CSV File** (`brands.csv`):
```csv
logoName,fileName
Acme Corporation,acme.png
TechStart Inc,techstart.jpg
Global Foods,global-foods.gif
```

**Logos Directory** (`Logos/`):
```
Logos/
├── acme.png
├── techstart.jpg
├── global-foods.gif
└── (other logo files)
```

### 2. Run the Import

```bash
npm run import-brands path/to/brands.csv path/to/Logos
```

Example:
```bash
npm run import-brands ./data-sources/brands.csv ./data-sources/Logos
```

### 3. Review the Results

The import process will generate:

1. **brands.json** - Updated brand database at `public/data/brands/brands.json`
2. **logos/** - Copied logo files at `public/data/brands/logos/`
3. **import-report.json** - Detailed import report with validation results

Check the console output for a summary:
```
✓ Successfully imported 85 brands
✗ Failed to import 15 entries
  - 8 file not found
  - 5 unsupported file type
  - 2 duplicate brand names
⚠ 3 warnings

Report saved to: import-report.json
```

## Usage Examples

### Basic Import

Import from CSV and logos directory:
```bash
npm run import-brands ./brands.csv ./Logos
```

### Custom Output Directory

Specify a different output location:
```bash
npm run import-brands ./brands.csv ./Logos --output ./custom-output
```

### Verbose Mode

See detailed processing information:
```bash
npm run import-brands ./brands.csv ./Logos --verbose
```

### Dry Run

Validate data without writing files:
```bash
npm run import-brands ./brands.csv ./Logos --dry-run
```

## Data Format

### CSV Structure

Your CSV file must have exactly two columns:

| Column Name | Description | Example |
|-------------|-------------|---------|
| logoName | Brand name (displayed in app) | `"Acme Corporation"` |
| fileName | Logo file name (in Logos directory) | `"acme.png"` |

**Requirements**:
- Header row is optional but recommended
- Column order must be: `logoName`, `fileName`
- Brand names preserved exactly as written (including case, spacing)
- File names must match actual files in logos directory

**Example CSV**:
```csv
logoName,fileName
Nike,nike.png
"Apple, Inc.",apple.jpg
Coca-Cola Company,coca-cola.gif
```

### Supported File Formats

| Format | Extensions | Notes |
|--------|-----------|-------|
| PNG | `.png` | Recommended for logos with transparency |
| JPEG | `.jpg`, `.jpeg` | Good for photographic logos |
| GIF | `.gif` | Supports animation and transparency |

**Unsupported formats** (will be skipped):
- EPS (`.eps`) - PostScript vector format
- AI (`.ai`) - Adobe Illustrator files
- PDF (`.pdf`) - Document format

## Understanding the Output

### brands.json

Generated at `public/data/brands/brands.json`:

```json
{
  "brands": [
    {
      "id": "acme-corporation-abc123",
      "name": "Acme Corporation",
      "slug": "acme-corporation",
      "category": "Other",
      "logoPath": "/data/brands/logos/acme.png",
      "dateAdded": "2025-11-14T12:34:56.789Z",
      "featured": false
    }
  ]
}
```

**Generated fields**:
- `id` - Unique identifier (generated from name)
- `slug` - URL-safe version of name
- `category` - Inferred or defaults to "Other"
- `logoPath` - Relative path to logo file
- `dateAdded` - Import timestamp

### import-report.json

Detailed validation and processing results:

```json
{
  "timestamp": "2025-11-14T12:34:56.789Z",
  "summary": {
    "totalProcessed": 100,
    "successful": 85,
    "failed": 15,
    "errorBreakdown": {
      "file_not_found": 8,
      "file_type_error": 5,
      "duplicate_brand": 2
    },
    "warnings": 3,
    "processingTimeMs": 1523
  },
  "results": [
    {
      "rowNumber": 1,
      "status": "success",
      "brand": { /* Brand object */ }
    },
    {
      "rowNumber": 2,
      "status": "file_not_found",
      "error": {
        "code": "file_not_found",
        "message": "Logo file not found: missing.png",
        "field": "fileName"
      }
    }
  ]
}
```

## Error Handling

### Common Errors and Solutions

#### File Not Found
```
Error: Logo file not found: logo.png
```
**Solution**: Verify the file name in CSV matches exactly (including case) with the file in Logos directory.

#### Unsupported File Type
```
Error: Unsupported file type: eps
```
**Solution**: Convert EPS/AI/PDF files to PNG, JPEG, or GIF using image editing software.

#### Duplicate Brand Name
```
Error: Duplicate brand name: Acme Corporation
```
**Solution**: Remove duplicate entries from CSV. The first occurrence is kept, duplicates are rejected.

#### CSV Validation Error
```
Error: Invalid CSV row at line 5: missing fileName
```
**Solution**: Ensure each row has both logoName and fileName values.

### Warnings

Warnings don't prevent import but indicate potential issues:

**Large File Size**:
```
Warning: Logo file is large (15MB): big-logo.png
```
**Recommendation**: Consider optimizing image file (compress or resize) for better web performance.

## Best Practices

### 1. Prepare Data Before Import

- **Validate CSV**: Check for duplicate brand names before importing
- **Optimize Images**: Resize logos to reasonable dimensions (e.g., 500×500px max)
- **Compress Files**: Use image optimization tools to reduce file sizes
- **Consistent Naming**: Use lowercase, hyphenated file names (e.g., `acme-corp.png`)

### 2. Test with Small Dataset

Before importing 1,000+ brands, test with a small subset:

```bash
# Create test CSV with 10 brands
head -n 11 brands.csv > test-brands.csv

# Run import
npm run import-brands test-brands.csv Logos --dry-run
```

### 3. Review Import Report

Always check `import-report.json` after import:

```bash
# View summary
cat import-report.json | grep -A 10 '"summary"'

# Check for errors
cat import-report.json | grep '"status": "file_not_found"'
```

### 4. Backup Existing Data

Before importing, backup current brands.json:

```bash
cp public/data/brands/brands.json public/data/brands/brands.json.backup
```

## Advanced Usage

### Merging Imports

To add new brands to existing data:

1. **Backup current brands.json**
2. **Run import** (generates new brands.json)
3. **Merge manually** or use merge script (future enhancement)

**Note**: Current implementation replaces brands.json completely. Merging must be done manually.

### Batch Processing

Import multiple datasets sequentially:

```bash
#!/bin/bash
for dataset in dataset1 dataset2 dataset3; do
  npm run import-brands "./data/${dataset}.csv" "./data/${dataset}/Logos" \
    --output "./output/${dataset}"
done
```

### CI/CD Integration

Add import to build pipeline:

```yaml
# .github/workflows/import-brands.yml
name: Import Brand Data
on:
  workflow_dispatch:
    inputs:
      csv_path:
        description: 'Path to CSV file'
        required: true
      logos_path:
        description: 'Path to logos directory'
        required: true

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run import-brands ${{ github.event.inputs.csv_path }} ${{ github.event.inputs.logos_path }}
      - uses: actions/upload-artifact@v3
        with:
          name: import-report
          path: import-report.json
```

## Performance

### Expected Processing Times

| Dataset Size | Estimated Time |
|-------------|----------------|
| 100 brands | ~2-3 seconds |
| 500 brands | ~8-12 seconds |
| 1,000 brands | ~15-25 seconds |
| 5,000 brands | ~1-2 minutes |

**Note**: Times vary based on file sizes and disk performance.

### Performance Tips

1. **Use SSD storage** for faster file I/O
2. **Optimize images beforehand** to reduce processing time
3. **Run on local machine** instead of network drives
4. **Close other applications** to free up system resources

## Troubleshooting

### Import Hangs or Crashes

**Problem**: Import process stops responding

**Solutions**:
- Check available disk space (need 2x dataset size)
- Verify file permissions (read CSV/logos, write output dir)
- Reduce dataset size and import in batches
- Check for corrupted image files

### Incorrect Brand Names

**Problem**: Brand names appear differently than expected

**Explanation**: Brand names are preserved exactly as written in CSV (per FR-015)

**Solution**: Update CSV file and re-import

### Missing Logos in Application

**Problem**: Brands appear but logos don't load

**Solutions**:
- Verify `public/data/brands/logos/` contains the files
- Check browser console for 404 errors
- Confirm `logoPath` in brands.json matches actual file location
- Restart dev server to refresh static assets

## Next Steps

After successful import:

1. **Verify in Application**: Run `npm run dev` and browse brands
2. **Test Search**: Ensure imported brands are searchable
3. **Review Categories**: Update brand categories if needed (manual edit of brands.json)
4. **Deploy**: Commit brands.json and logos/ to repository for deployment

## Support

For issues or questions:

- Check `import-report.json` for detailed error information
- Review error messages in console output
- Consult data-model.md for entity structure details
- Refer to spec.md for functional requirements

## Future Enhancements

Planned improvements for future versions:

- **Merge mode**: Add brands to existing data without replacing
- **Category inference**: Auto-detect brand category from name or logo
- **Bulk updates**: Re-import to update existing brand data
- **Browser UI**: Drag-and-drop import interface
- **Image optimization**: Auto-resize and compress during import
