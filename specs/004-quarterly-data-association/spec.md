# Feature Specification: Quarterly Brand Data Association

**Feature Branch**: `004-quarterly-data-association`
**Created**: 2025-11-17
**Status**: Draft
**Input**: User description: "Based on the columns in the first line of '2010Q1-Table1.csv', create a way to associate brands in /public/assets/data/brands.json with data from CSVs like the one referenced. There are about 10 CSVs from 10 different quarters that should be associated with brands in brands.json. Not all brands will have data, and brands that do have data will not have them every quarter."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Brand Metrics from Quarterly Data (Priority: P1)

Users need to see brand perception metrics (awareness, preference, quality ratings, etc.) from quarterly research data when browsing brands in the explorer. This enriches the brand browsing experience with quantitative insights about brand performance.

**Why this priority**: This is the core value proposition - connecting existing brand logos/names with rich quarterly metric data. Without this, the quarterly CSV data remains disconnected and unusable.

**Independent Test**: Can be fully tested by loading a brand that has quarterly data and verifying that metrics like "Total Users %", "Brand Stature", and perception attributes are displayed for at least one quarter.

**Acceptance Scenarios**:

1. **Given** a brand exists in brands.json with name "7UP", **When** user views the brand details, **Then** quarterly data from 2010Q1 is displayed showing Total_Users_pct: 61.18%, Total_Prefer_pct: 56.95%, and category "Beverages"
2. **Given** a brand exists in brands.json but has no matching quarterly data, **When** user views the brand details, **Then** the system indicates no quarterly metrics are available
3. **Given** a brand has data for multiple quarters (e.g., 2010Q1, 2010Q2, 2010Q3), **When** user views the brand, **Then** all available quarters are displayed with their respective metrics

---

### User Story 2 - Compare Brand Performance Across Quarters (Priority: P2)

Users want to track how brand metrics change over time by comparing data across different quarters. This helps identify trends in brand perception, awareness, and preference.

**Why this priority**: Once brands are associated with quarterly data, temporal analysis becomes the natural next step for deriving insights.

**Independent Test**: Can be tested by selecting a brand with data in multiple quarters and verifying that metrics from different quarters can be viewed side-by-side or in sequence.

**Acceptance Scenarios**:

1. **Given** a brand has data in 2010Q1, 2010Q2, and 2010Q4 (but not Q3), **When** user views quarterly progression, **Then** metrics are shown for Q1, Q2, and Q4 with Q3 marked as unavailable
2. **Given** a brand has Total_Users_pct of 50% in Q1 and 60% in Q2, **When** user compares quarters, **Then** the system shows the 10 percentage point increase
3. **Given** multiple perception attributes (e.g., Innovative_pct, Trustworthy_pct) exist across quarters, **When** user selects specific attributes to track, **Then** values for those attributes are displayed across all available quarters

---

### User Story 3 - Filter Brands by Quarterly Data Availability (Priority: P3)

Users browsing the brand catalog want to filter or identify which brands have quarterly research data available versus those that only have logo/basic information.

**Why this priority**: This improves discoverability and helps users focus on brands with rich data when needed, but is less critical than actually viewing the data itself.

**Independent Test**: Can be tested by applying a filter showing "only brands with quarterly data" and verifying the list contains only brands matched to at least one CSV file.

**Acceptance Scenarios**:

1. **Given** the brand catalog contains 100 brands total, with 25 having quarterly data, **When** user applies "has quarterly data" filter, **Then** only 25 brands are displayed
2. **Given** a brand has data for some quarters but not others, **When** user filters by specific quarter (e.g., "2010Q1"), **Then** only brands with data in that quarter are shown
3. **Given** user is browsing all brands, **When** viewing the list, **Then** each brand clearly indicates whether quarterly data is available (e.g., with an indicator badge)

---

### Edge Cases

- What happens when a brand name in the CSV doesn't exactly match the brand name in brands.json (e.g., case differences, punctuation, extra whitespace)?
- How does the system handle CSVs with missing or empty cells for specific metrics?
- What happens when the CSV structure changes (e.g., new columns added in later quarters)?
- How are brands with identical names but different categories distinguished?
- What happens when a brand appears multiple times in the same quarterly CSV file?
- How does the system handle CSV files that are corrupted or have invalid data formats?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST associate brands in brands.json with quarterly data CSV files by matching brand names
- **FR-002**: System MUST support approximately 10 CSV files representing different quarters
- **FR-003**: System MUST handle brands that have no quarterly data (not all brands will have matching CSV entries)
- **FR-004**: System MUST handle brands that have partial quarterly coverage (brands may have data for some quarters but not others)
- **FR-005**: System MUST preserve all CSV column data including: Brand id, Brand name, Category, Total_Users_pct, Total_Prefer_pct, Energized_Differentiation_C, Relevance_C, Esteem_C, Knowledge_C, Brand_Stature_C, Brand_Strength_C, Brand_Asset_C, and approximately 70+ perception attributes (Different_pct, Distinctive_pct, Unique_pct, Dynamic_pct, etc.)
- **FR-006**: System MUST identify which quarter each CSV file represents based on filename format (e.g., "2010Q1-Table 1.csv")
- **FR-007**: System MUST handle CSV entries where many metric columns contain empty values (as shown in the sample data where brands like "24 Hour Fitness" have empty metrics)
- **FR-008**: System MUST maintain the original brand.json structure (id, name, slug, category, logoPath, dateAdded, featured) while adding quarterly data associations
- **FR-009**: System MUST support querying brands by quarter to retrieve metrics for a specific time period
- **FR-010**: System MUST support querying all available quarters for a specific brand
- **FR-011**: System MUST perform case-insensitive exact matching when associating brands between brands.json and quarterly CSV files (e.g., "YouTube" matches "youtube", but "YouTube Inc." does not match "YouTube")

### Key Entities *(include if feature involves data)*

- **Brand**: Core entity from brands.json with attributes: id, name, slug, category, logoPath, dateAdded, featured. Associated with zero or more QuarterlyDataRecords
- **QuarterlyDataRecord**: Represents brand metrics from a specific quarter CSV. Contains: brandId (reference to Brand), quarter identifier (e.g., "2010Q1"), category, 85+ metric columns (awareness metrics, brand equity scores, perception attributes, relationship metrics)
- **Quarter**: Time period identifier (format: YYYYQ#) representing when data was collected. Used to organize and compare QuarterlyDataRecords

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view quarterly metrics for any brand that has data in at least one quarter within 2 seconds of selecting the brand
- **SC-002**: System successfully associates 100% of brands that have matching entries in quarterly CSV files
- **SC-003**: Users can identify which quarters have available data for a given brand without navigating away from the brand view
- **SC-004**: System handles all 10 quarterly CSV files without data loss or corruption of any metric values
- **SC-005**: Users can successfully complete a brand comparison across multiple quarters in under 30 seconds
- **SC-006**: System correctly displays "no data available" for brands without quarterly metrics rather than showing empty or misleading values
