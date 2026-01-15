# Changelog

All notable changes to this project will be documented in this file.

## [1.1.3] - 2026-01-15

### Added
- **Parameter validation for `get` command**: Now asks for issue identifier when not provided
- **Session context memory**: Remembers the most recently worked issue within a session
  - Enables commands like "이 이슈에 코멘트 추가해" without re-specifying the identifier

## [1.1.2] - 2026-01-14

### Fixed
- Made project config check mandatory with AskUserQuestion

## [1.1.1] - 2026-01-14

### Changed
- Version bump

## [1.0.0] - 2026-01-14

### Added
- Initial release
- Direct Linear GraphQL API calls without MCP
- Issue CRUD operations (create, read, update, delete)
- Comment support
- Status update support
- PR update workflow (create PR + add comment + update status)
- Hierarchical config (user-level API key + project-level team/project settings)
