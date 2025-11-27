# D&D Spellbook Manager

A Progressive Web App for managing D&D 5e spellbooks. Built with React, TypeScript, and Vite, featuring offline-first architecture with IndexedDB storage.

## Features

### ✅ Implemented
- **Spell Browser**: Search and filter through 1400+ D&D 5e spells from the SRD
- **Advanced Filtering**: Filter by spell level, school, class, concentration, and ritual
- **Real-time Search**: Instant client-side search across spell names and descriptions
- **Spellbook Management**: Create, view, and delete custom spellbooks
- **Spell Management**: Add/remove spells, mark as prepared, add notes
- **Data Export/Import**: Backup and restore spellbooks via JSON files
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Offline-First**: All spell data bundled with the app for instant access
- **PWA Support**: Installable as a progressive web app
- **Comprehensive Testing**: 316 tests (100% pass rate) with E2E and unit coverage

## Quick Start

```bash
# Install dependencies (will automatically setup git hooks)
npm install


# Fetch spell data from Open5e API
npm run build:spells

# Start development server
npm run dev

# Build for production
npm run build
```

## Documentation

Comprehensive documentation is available throughout the codebase:

- **[Source Code Overview](src/README.md)** - Architecture, patterns, and design decisions
  - **[Components](src/components/README.md)** - UI component architecture and composition
  - **[Hooks](src/hooks/README.md)** - Custom React hooks and state management
  - **[Services](src/services/README.md)** - Data access layer and business logic
  - **[Types](src/types/README.md)** - TypeScript type definitions
  - **[Utils](src/utils/README.md)** - Utility functions and formatters

## Development

### Prerequisites
- Node.js 18+ (currently using v20.11.0)
- npm 10+

### Project Structure
```
src/
├── components/       # React components
│   ├── SpellList.tsx
│   └── SpellFilters.tsx
├── hooks/           # Custom React hooks
│   ├── useSpells.ts
│   └── useSpellbooks.ts
├── services/        # Business logic
│   ├── spell.service.ts
│   ├── storage.service.ts
│   └── db.ts
├── types/           # TypeScript definitions
│   ├── spell.ts
│   └── spellbook.ts
└── App.tsx

scripts/
└── build-spells.js  # Spell data pipeline

public/
└── data/
    └── spells.json  # Generated spell data
```

### Available Scripts

- `npm run dev` - Start Vite dev server at http://localhost:5173
- `npm run build` - Build for production
- `npm run build:spells` - Fetch and transform spell data from Open5e API
- `npm run preview` - Preview production build locally
- `npm test` - Run test suite (unit + E2E tests)
- `npm run test:e2e` - Run E2E tests only

### Testing

This project has comprehensive test coverage with **100% pass rate** across all tests:

- **212 E2E tests** using Puppeteer for end-to-end workflows
- **104 unit tests** for services, hooks, and utilities
- **Git pre-commit hooks** enforce passing tests before commits
- **Automated code review** via Claude Code integration

See [E2E_REFACTORING_SUMMARY.md](E2E_REFACTORING_SUMMARY.md) for detailed test architecture and best practices.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Storage**: IndexedDB via Dexie.js
- **PWA**: Vite PWA Plugin + Workbox
- **Styling**: CSS3 with CSS Variables
- **Data Source**: Open5e API (SRD content)

## Architecture

### Local-First Design
- All spell data bundled at build time
- User spellbooks stored in IndexedDB
- No backend required for MVP
- Fully functional offline

### Performance
- Client-side search < 50ms
- Virtual scrolling for large spell lists
- Optimized bundle size
- Lazy loading where appropriate

## Roadmap

### Phase 1: MVP ✅ Complete!
- [x] Spell browser with filters
- [x] Spellbook CRUD operations
- [x] Spell management in spellbooks
- [x] Data export/import
- [x] PWA configuration
- [x] E2E test suite (100% pass rate)

### Phase 2: Enhancement
- [ ] Spell detail modal
- [ ] Character class spell lists
- [ ] Spell slots tracking
- [ ] Print-friendly views
- [ ] Share spellbooks

### Phase 3: Advanced
- [ ] Cloud sync (optional)
- [ ] Multi-device support
- [ ] Custom spells
- [ ] Campaign management

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Acknowledgments

- Spell data from [Open5e](https://open5e.com/) (OGL/SRD content)
- Built with [Claude Code](https://claude.com/claude-code)
