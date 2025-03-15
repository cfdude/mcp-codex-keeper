# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-03-15

### Added
- Pagination support for `list_documentation` and `search_documentation` functions
  - Added `limit` parameter (default: 10) to control the number of results returned
  - Added `offset` parameter for pagination
  - Added pagination metadata in response (total, limit, offset, hasMore)

### Fixed
- Improved cache update mechanism for newly added or updated documents
  - Cache is now forcefully updated when adding or updating documentation
  - Enhanced placeholder content for better search matching when content can't be fetched
  - Increased timeout for content fetching from 10s to 15s
  - Added better error handling for network requests

## [2.0.0] - 2025-03-15

### Changed

- **BREAKING**: Refactored the entire codebase architecture for better maintainability and extensibility
- Reorganized project structure into modular components:
  - Moved configuration to dedicated `config/` directory
  - Separated request handlers into `handlers/` directory
  - Extracted business logic into `services/` directory
  - Split file system utilities into smaller components in `utils/fs/`

### Added

- New modular architecture with clear separation of concerns
- Dedicated service classes for documentation and search functionality
- Improved error handling with specialized handlers
- Better code organization with index files for each module
- Enhanced documentation with comprehensive JSDoc comments

### Fixed

- Fixed ES Module import/export consistency
- Improved type safety throughout the codebase
- Enhanced error handling and reporting

## [1.1.10] - Previous Release

- Last version before the major refactoring