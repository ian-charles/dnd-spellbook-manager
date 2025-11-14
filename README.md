# D&D Spellbook Manager

A Progressive Web App for managing D&D 5e spellbooks. Built with React, TypeScript, and Vite, featuring offline-first architecture with IndexedDB storage.

## Features

### ✅ Implemented
- **Spell Browser**: Search and filter through 1400+ D&D 5e spells from the SRD
- **Advanced Filtering**: Filter by spell level, school, class, concentration, and ritual
- **Real-time Search**: Instant client-side search across spell names and descriptions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Offline-First**: All spell data bundled with the app for instant access

### 🚧 In Progress
- Spellbook management (create, edit, delete spellbooks)
- Spell detail view
- Add spells to spellbooks
- Mark spells as prepared
- Data export/import for backups
- PWA installation support

## Quick Start

```bash
# Install dependencies
npm install

# Fetch spell data from Open5e API
npm run build:spells

# Start development server
npm run dev

# Build for production
npm run build
```

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

### Phase 1: MVP (Current)
- [x] Spell browser with filters
- [ ] Spellbook CRUD operations
- [ ] Spell management in spellbooks
- [ ] Data export/import
- [ ] PWA configuration

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
