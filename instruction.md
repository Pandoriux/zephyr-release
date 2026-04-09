You are an expert refactoring assistant. Your task is to standardize the versioning terminology across the files I provide to align with industry CI/CD standards.

## Objective

Normalize the naming of version-related data to eliminate ambiguity. We are moving away from "previous" and "generic" names toward explicit "current" and "next" identifiers.

## 1. Input Scope

You are to scan and modify ONLY the files I have provided/uploaded in this session. Do not attempt to scan or modify other parts of the workspace unless specifically instructed later.

## 2. The Mapping Rules

Apply these changes across code (variables/logic) and documentation (text/env vars):

- **The Baseline:** Change `previousVersion` to `currentVersion` (and its variants).
- **The Target:** Change `version` to `nextVersion` ONLY when it refers to the newly calculated or forced version for the upcoming release.

### Multi-Format Application

Ensure you apply these changes across all discovered formats:

- **camelCase:** `previousVersion` -> `currentVersion`
- **UPPER_SNAKE_CASE:** `ZR_PREVIOUS_VERSION` -> `ZR_CURRENT_VERSION`
- **kebab-case:** `zr-previous-version` -> `zr-current-version`
- **Title Case (Docs):** "Previous Version" -> "Current Version"

## 3. The "Generic Version" Exception [CRITICAL]

Do NOT refactor the word `version` when it is used in reusable utility functions or generic validation logic that accepts an arbitrary version string.

- **Example to KEEP:** `function parse(version: string)` or `const version = "1.0.0"`.
- **Example to CHANGE:** `const version = getCalculatedBump()` -> `const nextVersion = getCalculatedBump()`.

## 4. Output: report.md

After performing the refactor, generate a `report.md` file in the root directory. Do not list every change in our chat; use this file instead.

### Structure for report.md

# Terminology Refactor Report

## Changes Applied

- List the files modified.
- Summarize key renames (e.g., "Updated export-variables.md environment variables to use ZR_NEXT_VERSION").

## Not Sure (Manual Review Required)

- List any instances where the context was too ambiguous to decide between `version` and `nextVersion`.
- Provide the file path, line number, and a snippet of the code/text for my manual review.
