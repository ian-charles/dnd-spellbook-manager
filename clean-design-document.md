# D&D Spellbook App - Technical Design Document

**Version**: 3.2  
**Stack**: React + Cloud Storage + Cloud CDN (GCP Only)  
**Architecture**: Local-first PWA, single deployment target

## 1. Executive Summary

A Progressive Web App for managing D&D 5e spellbooks. MVP stores data locally in browser (IndexedDB). Deploys as static site to Google Cloud Storage with CDN. No authentication or backend required for MVP - these can be added later if needed.

**Core Principles:**
- Works entirely offline after first load
- Single GCP deployment target  
- No backend infrastructure for MVP
- Add complexity only when needed

**Performance Targets:**
- Initial load: < 2s
- Search response: < 50ms (client-side)
- Monthly cost: ~$20 (static hosting only)

---

## 2. Architecture

### MVP Architecture
```
┌─────────────────────────────────────────────────────────┐
│                 Google Cloud Storage                     │
│                    Static Website                        │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Cloud CDN (Global)                    │
└─────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │    Browser     │
                    ├───────────────┤
                    │  React SPA    │
                    │  IndexedDB    │
                    └───────────────┘

Data Flow:
- Spell data: Bundled JSON (build-time)
- User data: IndexedDB (local only)
- No API calls, no auth
```

### Future Architecture (If Needed)
```
Add when users request:
- Cloud Run API for sync
- Cloud SQL for shared data  
- Google Identity Platform for auth
```

---

## 3. Data Architecture

### Spell Data (Static)
```json
// public/data/spells.json - Generated from Open5e at build time
{
  "version": "1.0.0",
  "spells": [
    {
      "id": "fireball",
      "name": "Fireball",
      "level": 3,
      "school": "evocation",
      "classes": ["sorcerer", "wizard"],
      "castingTime": {
        "value": 1,
        "unit": "action"  // "action", "bonus", "reaction", "minute", "hour"
      },
      "range": {
        "value": 150,
        "unit": "feet"    // "feet", "touch", "self", "sight", "unlimited"
      },
      "components": {
        "verbal": true,
        "somatic": true,
        "material": true
      },
      "materials": "A tiny ball of bat guano and sulfur",
      "duration": "Instantaneous",
      "concentration": false,
      "ritual": false,
      "description": "...",
      "higherLevels": "..."
    }
  ]
}
```

### Local Storage Schema
```javascript
// IndexedDB: "DndSpellbookDB"

// spellbooks store
{
  id: "uuid",
  name: "My Wizard",
  spells: [
    {
      spellId: "fireball",
      prepared: true,
      notes: "Use carefully in dungeons"
    },
    {
      spellId: "magic-missile",
      prepared: true,
      notes: ""
    },
    {
      spellId: "shield",
      prepared: false,
      notes: "Save for emergencies"
    }
  ],
  created: "2024-11-14T10:00:00Z",
  updated: "2024-11-14T10:00:00Z"
}

// settings store (optional)
{
  key: "theme",
  value: "light"
}
```

---

## 4. Application Modules

| Module | Purpose | Implementation |
|--------|---------|----------------|
| **Spell Browser** | Search/filter spells | React + bundled JSON |
| **Spellbook Manager** | CRUD operations | React + IndexedDB |
| **Storage Service** | Data persistence | Dexie.js wrapper |
| **Data Export/Import** | Serialize/deserialize app data for backup/restore | JSON serialization |
| **PWA Shell** | App infrastructure for offline/installable web app | Service Worker + Manifest |

---

## 5. Module Implementation & Abstraction Strategy

### Core Architecture Principle

All modules access data through service interfaces using a Service Provider pattern. This enables swapping between local storage (MVP) and cloud storage (future) without changing any component code. A single configuration point determines whether the app runs in local-only mode or cloud-sync mode.

### Storage Service Module

**Purpose:** Abstract all data persistence behind a unified interface.

**MVP Implementation (Local):**
- Uses IndexedDB via Dexie.js for robust client-side storage
- Stores spellbooks and spell associations with compound keys
- Provides full CRUD operations with async/await interface
- Data persists indefinitely in browser storage
- No network calls, works completely offline

**Future Implementation (Cloud):**
- Implements same interface as local storage
- Performs optimistic updates (save locally, then sync)
- Queues operations made while offline
- Falls back to local storage when network unavailable
- Syncs local and cloud data when connection restored
- Transparent to consuming components

### Spell Browser Module

**Purpose:** Provide instant spell search and filtering with zero network latency.

**Implementation:**
- Loads entire spell dataset into memory at app initialization
- Pre-builds search indexes for instant query performance
- Supports multi-criteria filtering (level, school, class, components)
- Uses virtual scrolling for smooth performance with 300+ results
- Search operations complete in < 50ms
- All spell data bundled with app (300KB gzipped)

**Search Strategy:**
- Text search across name, school, and classes
- Exact match filters for level and school
- Array inclusion check for class requirements
- Component matching for material requirements

### Spellbook Manager Module

**Purpose:** Manage user's spellbook collections and spell selections.

**Implementation:**
- Provides React hooks for spellbook operations
- Uses SWR for data fetching with automatic cache invalidation
- Enriches spellbook data with full spell information
- Handles prepared spell tracking
- Supports multiple spellbooks per user
- Performs optimistic UI updates for instant feedback

**Data Flow:**
1. Component requests spellbook via hook
2. Hook fetches from storage service
3. Storage returns spellbook with spell IDs
4. Hook enriches with spell data from spell service
5. Component receives fully hydrated spellbook

### Data Export/Import Module

**Purpose:** Serialize and deserialize application data for backup, restore, and migration between devices.

**Core Functionality:**
- **Export:** Serialize all user data (spellbooks, spell selections, prepared states) to JSON
- **Import:** Load previously exported data and merge/replace current data
- **Backup:** Download complete app state as a file
- **Restore:** Upload a backup file to restore previous state
- **Migration:** Transfer data between devices or browsers

**Data Format:**
```json
{
  "version": "1.0",
  "exportDate": "2024-11-14T10:00:00Z",
  "spellbooks": [
    {
      "id": "uuid",
      "name": "My Wizard",
      "characterClass": "wizard",
      "level": 5,
      "spells": [
        {
          "spellId": "fireball",
          "prepared": true,
          "notes": "Use carefully"
        }
      ]
    }
  ],
  "settings": {
    "theme": "light",
    "lastModified": "2024-11-14T10:00:00Z"
  }
}
```

**Use Cases:**
- **Regular Backup:** User downloads their data periodically for safety
- **Device Transfer:** Export on phone, import on desktop
- **Browser Switch:** Moving from Chrome to Firefox
- **Share with Friends:** Export spellbook to share with party members
- **Version Migration:** Import data from older app versions
- **Debug/Support:** Users can export data to help diagnose issues

**Implementation Strategy:**
- Serialize IndexedDB contents to JSON
- Include version number for compatibility
- Validate data structure on import
- Handle merge conflicts (duplicate spellbooks)
- Provide options: merge vs. replace
- Compress large exports (future)

**Additional Export Formats (Secondary):**
- **Print View:** CSS print styles for paper output
- **PDF:** Future feature for formatted spellbook printout
- **Markdown:** Future feature for posting online

### PWA Shell Module

**Purpose:** Transform the web app into an installable, offline-capable application that feels native.

**What is the PWA Shell:**
The "shell" is the minimal application infrastructure that loads instantly and works offline - essentially the app's skeleton (navigation, layout, loading states) without the dynamic content. Think of it as the frame of the app that gets cached and loads immediately, then fills in with data.

**Components:**
- **Service Worker:** JavaScript that runs in the background to handle caching, offline functionality, and background sync
- **Web App Manifest:** JSON file defining app name, icons, theme colors, and display mode
- **App Shell HTML/CSS:** Minimal UI that shows immediately while content loads
- **Cache Management:** Strategy for what to cache and when to update

**Caching Strategy:**
- **App Shell:** Precached on first visit (HTML, CSS, JS framework)
- **Spell Data:** Cached forever (immutable, 300KB)
- **User Data:** Stored in IndexedDB (not in service worker cache)
- **Future API Calls:** Stale-while-revalidate strategy

**PWA Features Enabled:**
- **Installable:** Add to home screen on mobile/desktop
- **Offline-first:** Works without internet after first visit
- **App-like:** Fullscreen mode, no browser chrome
- **Background sync:** Queue changes when offline, sync when online
- **Update notifications:** Prompt users when new version available

**User Experience:**
1. First visit: Service worker installs, caches app shell and spell data
2. Second visit: App loads instantly from cache, even offline
3. Install prompt: "Add to Home Screen" for mobile users
4. Offline usage: Full functionality without internet
5. Updates: Automatic in background with user notification

### Service Provider (Dependency Injection)

**Purpose:** Single configuration point for all services.

**Initialization Flow:**
1. Check configuration for cloud/local mode
2. Instantiate appropriate service implementations
3. Initialize all services (load data, open databases)
4. Provide services to React components via context

**Service Registry:**
- `spellData`: Always local (bundled JSON)
- `storage`: Local or cloud based on config
- `export`: Handles all export operations
- `sync`: Future service for cloud synchronization

### Component Integration Pattern

All components access services through React Context and custom hooks:

1. **Service Context:** Provides access to service instances
2. **Custom Hooks:** Wrap service calls with React lifecycle
3. **Components:** Remain pure, testable, and service-agnostic

This architecture ensures components never directly depend on storage implementation, making the transition from local to cloud storage seamless.

### Abstraction Benefits

**Zero Component Changes for Cloud Migration:**
- Components use abstract storage interface
- Service Provider swaps implementations
- All existing code continues working
- Progressive enhancement without refactoring

**Testing Advantages:**
- Mock services for unit tests
- Use local storage for integration tests
- Test cloud sync separately from UI
- AI agents can test via Puppeteer without backend

---

## 6. Feature Implementation

### Feature 1: Spell Data Integration

**Steps:**
1. Build script fetches SRD spells from Open5e API
2. Transform to optimized format (reduce size)
3. Generate static JSON file
4. Bundle with application
5. Load into memory on app start

**Data Pipeline:**
- Fetch from Open5e (legal SRD content)
- Filter to ~360 core spells
- Optimize field names
- Output: public/data/spells.json (300KB gzipped)

---

### Feature 2: Local Storage

**Steps:**
1. Set up Dexie.js for IndexedDB access
2. Create storage service with CRUD operations
3. Implement auto-save on all changes
4. Add data export/import for backup

**Storage Operations:**
- createSpellbook(name, characterClass)
- getSpellbooks()
- updateSpellbook(id, data)
- deleteSpellbook(id)
- addSpell(spellbookId, spellId)
- removeSpell(spellbookId, spellId)
- togglePrepared(spellbookId, spellId)

---

### Feature 3: Spell Browser UI

**Steps:**
1. Search input with instant filtering
2. Filter buttons (level, school, class)
3. Virtual scrolling for performance
4. Expandable spell cards
5. "Add to Spellbook" action

**Performance:**
- Client-side search using pre-indexed data
- Virtual scroll renders only visible items
- Memoized filtering for instant response

---

### Feature 4: Spellbook Management

**Steps:**
1. List view of all spellbooks
2. Create/edit spellbook dialog
3. Spellbook detail page
4. Spell list with prepared toggles
5. Batch operations (prepare all, clear)

---

### Feature 5: Data Export/Import

**Steps:**
1. Implement JSON serialization of all IndexedDB data
2. Create download functionality for backup file
3. Add file upload interface for restore
4. Validate imported data structure
5. Implement merge vs. replace options
6. Handle version compatibility

**Export Flow:**
- User clicks "Backup Data"
- System serializes all spellbooks and settings
- Downloads as `dnd-spellbook-backup-[date].json`
- File contains complete app state

**Import Flow:**
- User clicks "Restore Data"
- Selects backup file
- System validates JSON structure
- User chooses merge or replace
- Data imported into IndexedDB
- UI refreshes with restored data

**Note:** AI coding agents should use Puppeteer for testing data export/import flows during development.

---

### Feature 6: PWA Configuration  

**Steps:**
1. Web app manifest with icons
2. Service worker with Workbox
3. Cache-first strategy for assets
4. Offline fallback page
5. Install prompt

---

## 7. Deployment

### GCP Setup (One-Time)
```bash
# Create bucket
gsutil mb -p $PROJECT_ID gs://dnd-spellbook-app

# Enable public access
gsutil iam ch allUsers:objectViewer gs://dnd-spellbook-app

# Configure as website
gsutil web set -m index.html -e 404.html gs://dnd-spellbook-app

# Set up CDN
gcloud compute backend-buckets create dnd-spellbook-backend \
  --gcs-bucket-name=dnd-spellbook-app \
  --enable-cdn

gcloud compute url-maps create dnd-spellbook-lb \
  --default-backend-bucket=dnd-spellbook-backend
```

### Deploy Script
```bash
#!/bin/bash
# deploy.sh

# Build app
npm run build

# Upload with cache headers
gsutil -h "Cache-Control:no-cache" cp dist/*.html gs://dnd-spellbook-app
gsutil -h "Cache-Control:max-age=31536000" cp -r dist/assets gs://dnd-spellbook-app
gsutil -h "Cache-Control:max-age=86400" cp -r dist/data gs://dnd-spellbook-app
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: |
          npm ci
          npm run build:spells
          npm run build
      - uses: google-github-actions/setup-gcloud@v1
      - run: npm run deploy
```

---

## 8. Development Setup

### Project Structure
```
dnd-spellbook/
├── public/
│   └── data/           # Generated spell data
├── src/
│   ├── components/     # React components
│   ├── services/       # Storage, data access
│   ├── hooks/          # Custom React hooks
│   └── App.jsx
├── scripts/
│   └── build-spells.js # Data pipeline
├── package.json
└── vite.config.js
```

### Commands
```bash
# Development
npm run dev              # Start dev server
npm run build:spells     # Fetch spell data
npm run build           # Build for production

# Testing (for AI agents)
npm run test:puppeteer  # UI validation

# Deployment
npm run deploy          # Deploy to GCP
```

### Environment Variables
```bash
# .env
VITE_APP_VERSION=1.0.0

# .env.production (future)
VITE_API_URL=https://api.dndspellbook.app  # When backend added
```

---

## 9. Database Schema (Future)

When adding cloud sync:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE spellbooks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  spells JSONB,  -- Array of {spellId, prepared, notes}
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_spellbooks_user ON spellbooks(user_id);
CREATE INDEX idx_spellbooks_updated ON spellbooks(updated_at);
```

---

## 10. API Endpoints (Future)

When adding backend:

```
POST /api/auth/google     # Google OAuth
POST /api/sync            # Sync local data
GET  /api/spellbooks      # Get user's spellbooks  
POST /api/share/:id       # Create share link
```

---

## 11. Performance Budget

| Metric | Target | Method |
|--------|--------|--------|
| Initial Load | < 2s | Lighthouse |
| Search Response | < 50ms | Performance API |
| Bundle Size | < 500KB | Build output |
| Memory Usage | < 50MB | Chrome DevTools |

---

## 12. Cost Analysis

### MVP (Static Only)
| Service | Monthly | Annual |
|---------|---------|--------|
| Cloud Storage | $1 | $12 |
| CDN Bandwidth | $2 | $24 |
| Load Balancer | $18 | $216 |
| **Total** | **$21** | **$252** |

### With Backend (Future)
| Service | Additional Monthly |
|---------|-------------------|
| Cloud Run | +$5 |
| Cloud SQL | +$25 |
| **Total** | **~$51** |

---

## 13. Migration Path

### Phase 1: MVP
- Local-only functionality
- No accounts needed
- Deploy to Cloud Storage
- Validate with users

### Phase 2: Optional Cloud Features
Only add if users request:
- Google authentication
- Cloud backup/sync  
- Share spellbooks
- Multi-device access

### Phase 3: Advanced Features
Only if successful:
- Custom spells
- Campaign management
- DM tools
- Mobile apps

---

## Quick Start

```bash
# Clone repo
git clone <repository>
cd dnd-spellbook

# Install and build
npm install
npm run build:spells
npm run dev

# Deploy to GCP
npm run build
npm run deploy

# App available at:
# https://storage.googleapis.com/dnd-spellbook-app/index.html
```

---

This design delivers a working D&D spellbook app with minimal complexity, single deployment target, and room to grow based on actual user needs.
