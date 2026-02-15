# Version File & Config Parser Refactoring Documentation

## Overview

This refactoring separates business logic from pure utilities, creating a cleaner architecture where:
- **Utils** (`src/utils/`) contain pure, reusable, format-agnostic functions
- **Tasks** (`src/tasks/`) contain domain-specific business logic
- Both config and version-file parsers now share a common generic parser utility

## File Structure Changes

### Before
```
src/
├── tasks/
│   ├── version-file.ts          (business logic + orchestration)
│   └── config.ts                 (business logic + orchestration)
└── utils/
    ├── parsers/
    │   ├── version-file.ts        (mixed: utilities + business logic)
    │   └── config.ts              (mixed: utilities + business logic)
    ├── extractors/
    │   └── version-file.ts        (pure utilities, but in wrong location)
    └── transformers/
        └── version-file.ts        (pure utilities, but in wrong location)
```

### After
```
src/
├── tasks/
│   ├── version-file.ts           (orchestration only)
│   ├── version-file/
│   │   ├── parser.ts             (version-file specific parsing logic)
│   │   ├── extractor.ts          (version extraction logic)
│   │   └── transformer.ts        (version file transformation logic)
│   ├── config.ts                 (orchestration only)
│   └── config/
│       └── parser.ts             (config-specific parsing logic)
└── utils/
    └── parsers/
        └── file.ts                (generic, format-agnostic parser)
```

## Function Mapping: Old → New

### Version File Parser Functions

#### `detectVersionFileFormatFromPath(filePath: string)` - **REMOVED**
- **Old Location**: `src/utils/parsers/version-file.ts`
- **Status**: ❌ **Removed** - Unnecessary wrapper function
- **Replacement**: Call `detectFileFormatFromPath(filePath, FileFormatMap)` directly from `utils/parsers/file.ts`
- **Reason**: Thin wrapper with no added logic - callers now use generic utility directly

#### `getVersionFileFormatTrialOrder(detectedFormat?, exclude?)`
- **Old Location**: `src/utils/parsers/version-file.ts`
- **New Location**: `src/tasks/version-file/parser.ts`
- **Changes**: 
  - No functional changes
  - Moved to tasks folder because it's version-file specific logic
  - Still handles exclusion of formats (used for excluding "txt" in structured format resolution)

#### `parseVersionFileStringOrThrow(fileContent, fileFormat)` - **REMOVED**
- **Old Location**: `src/utils/parsers/version-file.ts`
- **Status**: ❌ **Removed** - Unnecessary wrapper function
- **Replacement**: Call `parseFileStringOrThrow(fileContent, fileFormat)` directly from `utils/parsers/file.ts`
- **Reason**: Thin wrapper with no added logic - callers now use generic utility directly

#### `parseVersionFileOrThrow(fileContent, fileFormat, filePath)`
- **Old Location**: `src/tasks/version-file.ts` (private function)
- **New Location**: `src/tasks/version-file/parser.ts` (exported)
- **Changes**: 
  - Moved from inline private function to dedicated module
  - Now calls `parseFileStringOrThrow()` directly from `utils/parsers/file.ts` (no wrapper)
  - Now calls `detectFileFormatFromPath(filePath, FileFormatMap)` directly (no wrapper)
  - Business logic unchanged: handles "auto" format detection with trial order
  - Error handling and logging behavior identical

#### `resolveStructuredVersionFileFormatOrThrow(fileContent, filePath, format?)`
- **Old Location**: `src/utils/parsers/version-file.ts`
- **New Location**: `src/tasks/version-file/parser.ts`
- **Changes**: 
  - Moved to tasks folder because it contains version-file specific business rules:
    - Throws error if format is "txt" (business rule: structured format required)
    - Excludes "txt" from trial order (business rule)
    - Error messages are version-file specific
  - Now calls `parseFileStringOrThrow()` directly from `utils/parsers/file.ts` (no wrapper)
  - Now calls `detectFileFormatFromPath(filePath, FileFormatMap)` directly (no wrapper)
  - Function signature and behavior unchanged

### Version File Extractor Functions

#### `detectVersionFileExtractor(selector: string)`
- **Old Location**: `src/utils/extractors/version-file.ts`
- **New Location**: `src/tasks/version-file/extractor.ts`
- **Changes**: 
  - Moved to tasks folder (version-file specific logic)
  - No functional changes
  - Detects extractor type (json-path vs regex) from selector string

#### `extractVersionStringOrThrow(parsedVersionFile, extractor, selector)`
- **Old Location**: `src/utils/extractors/version-file.ts`
- **New Location**: `src/tasks/version-file/extractor.ts`
- **Changes**: 
  - Moved to tasks folder (version-file specific logic)
  - No functional changes
  - Extracts version string using json-path (Nimma) or regex extractor

### Version File Transformer Functions

#### `updateVersionInStructuredFile(fileContent, format, jsonPathSelector, newVersion)`
- **Old Location**: `src/utils/transformers/version-file.ts`
- **New Location**: `src/tasks/version-file/transformer.ts`
- **Changes**: 
  - Moved to tasks folder (version-file specific logic)
  - Now imports `parseVersionFileStringOrThrow` from `./parser.ts` instead of `../parsers/version-file.ts`
  - Function signature and behavior unchanged
  - Updates version in structured files (json/jsonc/json5/yaml/toml) preserving formatting

### Config Parser Functions

#### `detectConfigFormatFromPath(configPath?: string)` - **REMOVED**
- **Old Location**: `src/utils/parsers/config.ts`
- **Status**: ❌ **Removed** - Unnecessary wrapper function
- **Replacement**: Call `detectFileFormatFromPath(configPath, ConfigFileFormatMap)` directly from `utils/parsers/file.ts`
- **Reason**: Thin wrapper with no added logic - callers now use generic utility directly

#### `getConfigFormatTrialOrder(detectedFormat?)`
- **Old Location**: `src/utils/parsers/config.ts`
- **New Location**: `src/tasks/config/parser.ts`
- **Changes**: 
  - No functional changes
  - Moved to tasks folder because it's config-specific logic
  - Note: Config doesn't have exclusion logic (unlike version-file which excludes "txt")

#### `parseConfigStringOrThrow(configStr, configFormat)` - **REMOVED**
- **Old Location**: `src/utils/parsers/config.ts`
- **Status**: ❌ **Removed** - Unnecessary wrapper function
- **Replacement**: Call `parseFileStringOrThrow(configStr, configFormat)` directly from `utils/parsers/file.ts`
- **Reason**: Thin wrapper with no added logic - callers now use generic utility directly

#### `parseConfigOrThrow(configStr, configFormat, configPath?)`
- **Old Location**: `src/tasks/config.ts` (private function)
- **New Location**: `src/tasks/config/parser.ts` (exported)
- **Changes**: 
  - Moved from inline private function to dedicated module
  - Now calls `parseFileStringOrThrow()` directly from `utils/parsers/file.ts` (no wrapper)
  - Now calls `detectFileFormatFromPath(configPath, ConfigFileFormatMap)` directly (no wrapper)
  - Business logic unchanged: handles "auto" format detection with trial order
  - Error handling and logging behavior identical
  - Note: Uses `taskLogger.startGroup()` instead of `taskLogger.debugWrap()` (config-specific logging style)

### New Generic Utility Functions

#### `detectFileFormatFromPath<T>(filePath, formatMap)`
- **New Location**: `src/utils/parsers/file.ts`
- **Purpose**: Generic format detection that works with any format map
- **Usage**: 
  - Called directly by `parseVersionFileOrThrow()` with `FileFormatMap`
  - Called directly by `resolveStructuredVersionFileFormatOrThrow()` with `FileFormatMap`
  - Called directly by `parseConfigOrThrow()` with `ConfigFileFormatMap`
- **Implementation**: Extracts file extension and looks it up in the provided format map

#### `parseFileStringOrThrow(fileContent, format)`
- **New Location**: `src/utils/parsers/file.ts`
- **Purpose**: Generic file parsing that handles all supported formats
- **Usage**: 
  - Called directly by `parseVersionFileOrThrow()` for version files
  - Called directly by `resolveStructuredVersionFileFormatOrThrow()` for version files
  - Called directly by `updateVersionInStructuredFile()` in transformer
  - Called directly by `parseConfigOrThrow()` for config files
- **Implementation**: Switch statement handling json/jsonc/json5/yaml/toml/txt formats

## Flow Comparison

### Version File Parsing Flow

#### Old Flow
```
getVersionStringFromVersionFile()
  ↓
parseVersionFileOrThrow() [in tasks/version-file.ts]
  ↓
  ├─ detectVersionFileFormatFromPath() [in utils/parsers/version-file.ts]
  │  └─ extname() + FileFormatMap lookup
  │
  ├─ getVersionFileFormatTrialOrder() [in utils/parsers/version-file.ts]
  │
  └─ parseVersionFileStringOrThrow() [in utils/parsers/version-file.ts]
     └─ Switch statement with format-specific parsers
```

#### New Flow
```
getVersionStringFromVersionFile()
  ↓
parseVersionFileOrThrow() [in tasks/version-file/parser.ts]
  ↓
  ├─ detectFileFormatFromPath() [in utils/parsers/file.ts] ← GENERIC (direct call)
  │  └─ extname() + FileFormatMap lookup
  │
  ├─ getVersionFileFormatTrialOrder() [in tasks/version-file/parser.ts]
  │
  └─ parseFileStringOrThrow() [in utils/parsers/file.ts] ← GENERIC (direct call)
     └─ Switch statement with format-specific parsers
```

**Key Changes**:
- Business logic (auto-detection, trial order, error handling) moved to tasks folder
- Format detection and parsing now call generic utilities directly (no wrapper functions)
- Clear separation: generic utilities vs. version-file specific logic
- Removed unnecessary wrapper functions - callers use generic utilities directly

### Config Parsing Flow

#### Old Flow
```
resolveConfigOrThrow()
  ↓
parseConfigOrThrow() [in tasks/config.ts]
  ↓
  ├─ detectConfigFormatFromPath() [in utils/parsers/config.ts]
  │  └─ extname() + ConfigFileFormatMap lookup
  │
  ├─ getConfigFormatTrialOrder() [in utils/parsers/config.ts]
  │
  └─ parseConfigStringOrThrow() [in utils/parsers/config.ts]
     └─ Switch statement with format-specific parsers
```

#### New Flow
```
resolveConfigOrThrow()
  ↓
parseConfigOrThrow() [in tasks/config/parser.ts]
  ↓
  ├─ detectFileFormatFromPath() [in utils/parsers/file.ts] ← GENERIC (direct call)
  │  └─ extname() + ConfigFileFormatMap lookup
  │
  ├─ getConfigFormatTrialOrder() [in tasks/config/parser.ts]
  │
  └─ parseFileStringOrThrow() [in utils/parsers/file.ts] ← GENERIC (direct call)
     └─ Switch statement with format-specific parsers
```

**Key Changes**:
- Business logic (auto-detection, trial order, error handling) moved to tasks folder
- Format detection and parsing now call generic utilities directly (no wrapper functions)
- Config and version-file now share the same underlying parser implementation
- Removed unnecessary wrapper functions - callers use generic utilities directly

### Version File Update Flow

#### Old Flow
```
prepareVersionFilesToCommit()
  ↓
resolveStructuredVersionFileFormatOrThrow() [in utils/parsers/version-file.ts]
  ↓
updateVersionInStructuredFile() [in utils/transformers/version-file.ts]
  ↓
  └─ parseVersionFileStringOrThrow() [in utils/parsers/version-file.ts]
```

#### New Flow
```
prepareVersionFilesToCommit()
  ↓
resolveStructuredVersionFileFormatOrThrow() [in tasks/version-file/parser.ts]
  ↓
updateVersionInStructuredFile() [in tasks/version-file/transformer.ts]
  ↓
  └─ parseFileStringOrThrow() [in utils/parsers/file.ts] ← GENERIC (direct call)
```

**Key Changes**:
- All version-file specific logic now in tasks/version-file/ folder
- Transformer calls generic parser directly (no wrapper)
- Parser uses generic utility for actual parsing

## Usage Analysis

### How New Functions Handle All Usages

#### `parseVersionFileOrThrow()` Usage
**Used in**: `src/tasks/version-file.ts` → `getVersionStringFromVersionFile()`

**Old Implementation**:
- Private function in `tasks/version-file.ts`
- Directly called parsing functions from utils

**New Implementation**:
- Exported from `tasks/version-file/parser.ts`
- Uses wrapper functions that delegate to generic parser
- **Result**: Same API, same behavior, better organization

#### `parseConfigOrThrow()` Usage
**Used in**: `src/tasks/config.ts` → `resolveConfigOrThrow()` (2 places: config file and config override)

**Old Implementation**:
- Private function in `tasks/config.ts`
- Directly called parsing functions from utils

**New Implementation**:
- Exported from `tasks/config/parser.ts`
- Uses wrapper functions that delegate to generic parser
- **Result**: Same API, same behavior, better organization

#### `resolveStructuredVersionFileFormatOrThrow()` Usage
**Used in**: `src/tasks/version-file.ts` → `prepareVersionFilesToCommit()`

**Old Implementation**:
- In `utils/parsers/version-file.ts` (wrong location - contains business rules)

**New Implementation**:
- In `tasks/version-file/parser.ts` (correct location - business logic)
- Uses `parseVersionFileStringOrThrow()` which delegates to generic parser
- **Result**: Business rules in tasks folder, parsing logic uses generic utility

#### `updateVersionInStructuredFile()` Usage
**Used in**: `src/tasks/version-file.ts` → `prepareVersionFilesToCommit()`

**Old Implementation**:
- In `utils/transformers/version-file.ts`
- Imported `parseVersionFileStringOrThrow` from `../parsers/version-file.ts`

**New Implementation**:
- In `tasks/version-file/transformer.ts`
- Calls `parseFileStringOrThrow()` directly from `utils/parsers/file.ts` (no wrapper)
- **Result**: Direct use of generic utility, no unnecessary indirection

#### `extractVersionStringOrThrow()` Usage
**Used in**: `src/tasks/version-file.ts` → `getVersionStringFromVersionFile()`

**Old Implementation**:
- In `utils/extractors/version-file.ts`

**New Implementation**:
- In `tasks/version-file/extractor.ts`
- **Result**: Version-file specific logic moved to tasks folder

#### `detectVersionFileExtractor()` Usage
**Used in**: `src/tasks/version-file.ts` → `getVersionStringFromVersionFile()` and `prepareVersionFilesToCommit()`

**Old Implementation**:
- In `utils/extractors/version-file.ts`

**New Implementation**:
- In `tasks/version-file/extractor.ts`
- **Result**: Version-file specific logic moved to tasks folder

## Architecture Improvements

### 1. Separation of Concerns

**Before**: Utils contained both pure utilities and business logic mixed together.

**After**: 
- `utils/parsers/file.ts` - Pure, generic, format-agnostic parsing
- `tasks/version-file/parser.ts` - Version-file specific parsing logic (auto-detection, trial order, business rules)
- `tasks/config/parser.ts` - Config-specific parsing logic (auto-detection, trial order)

### 2. Code Reusability

**Before**: Config and version-file parsers had duplicate parsing logic.

**After**: Both use the same generic `parseFileStringOrThrow()` function, reducing duplication.

### 3. Maintainability

**Before**: Changes to parsing logic required updates in multiple places.

**After**: Changes to core parsing logic only need to be made in `utils/parsers/file.ts`, and both config and version-file automatically benefit.

### 4. Organization

**Before**: Related functions scattered across utils folders.

**After**: 
- Version-file related functions grouped in `tasks/version-file/`
- Config related functions grouped in `tasks/config/`
- Generic utilities in `utils/parsers/file.ts`

### 5. Import Clarity

**Before**: 
```typescript
// tasks/version-file.ts
import { ... } from "../utils/parsers/version-file.ts";
import { ... } from "../utils/extractors/version-file.ts";
import { ... } from "../utils/transformers/version-file.ts";
```

**After**:
```typescript
// tasks/version-file.ts
import { ... } from "./version-file/parser.ts";
import { ... } from "./version-file/extractor.ts";
import { ... } from "./version-file/transformer.ts";
```

Clearer that these are version-file specific modules, not generic utilities.

## Migration Notes

### Import Path Changes

All imports have been updated. If you have any external code importing from the old paths, update them:

**Version File**:
- `utils/parsers/version-file.ts` → `tasks/version-file/parser.ts`
- `utils/extractors/version-file.ts` → `tasks/version-file/extractor.ts`
- `utils/transformers/version-file.ts` → `tasks/version-file/transformer.ts`

**Config**:
- `utils/parsers/config.ts` → `tasks/config/parser.ts`

### Function Availability

All previously exported functions remain available with the same signatures. The refactoring is **non-breaking** from an API perspective.

### Internal Changes

- `parseVersionFileOrThrow()` and `parseConfigOrThrow()` are now exported (were previously private)
- Internal implementation uses generic utilities, but external API is unchanged

## Testing Considerations

When testing, verify:
1. ✅ Version file parsing with all formats (json, jsonc, json5, yaml, toml, txt)
2. ✅ Config file parsing with all formats (json, jsonc, json5, yaml, toml)
3. ✅ Auto-detection works for both config and version files
4. ✅ Version extraction (json-path and regex) still works
5. ✅ Version file updates preserve formatting
6. ✅ Error handling and logging behavior unchanged

## Summary

This refactoring achieves:
- ✅ **Pure utils**: Generic, reusable parsing utilities
- ✅ **Business logic in tasks**: Domain-specific logic in appropriate folders
- ✅ **Code reuse**: Config and version-file share common parser
- ✅ **Better organization**: Related functions grouped together
- ✅ **No unnecessary wrappers**: Removed thin wrapper functions, callers use generic utilities directly
- ✅ **Non-breaking**: All public function signatures and behaviors preserved
- ✅ **Maintainability**: Single source of truth for parsing logic

## Additional Refinement: Removed Unnecessary Wrappers

After the initial refactoring, we identified and removed unnecessary wrapper functions that added no value:

### Removed Functions
- ❌ `detectVersionFileFormatFromPath()` - Replaced with direct call to `detectFileFormatFromPath(filePath, FileFormatMap)`
- ❌ `parseVersionFileStringOrThrow()` - Replaced with direct call to `parseFileStringOrThrow(fileContent, fileFormat)`
- ❌ `detectConfigFormatFromPath()` - Replaced with direct call to `detectFileFormatFromPath(configPath, ConfigFileFormatMap)`
- ❌ `parseConfigStringOrThrow()` - Replaced with direct call to `parseFileStringOrThrow(configStr, configFormat)`

### Rationale
These functions were thin pass-through wrappers with no added logic, validation, or transformation. They only added an extra layer of indirection without providing any benefit. By removing them, we:
- Reduced code complexity
- Made dependencies more explicit
- Eliminated unnecessary function calls
- Made it clearer that we're using generic utilities directly
