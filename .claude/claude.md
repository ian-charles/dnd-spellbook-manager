# Claude Development Guidelines

## Core Philosophy

Every line of code and every dependency is a liability. Write for clarity, maintainability, and performance. Fast is a feature.

## Technical Design Documents

Create a design doc for any work > 1 week or that affects architecture, performance, or APIs.

**Template**: Problem Statement → Goals/Non-Goals → Solution (architecture, API, data model) → Performance considerations → Alternatives → Testing/Rollout → Timeline

## TDD Workflow

### Red-Green-Refactor
1. **Red**: Write failing test → `git commit -m "test: add test for [feature]"`
2. **Green**: Minimal code to pass → `git commit -m "feat: implement [feature]"`  
3. **Refactor**: Improve quality → `git commit -m "refactor: [improvement]"`

**Principles**: One assertion per test • Test behavior, not implementation • AAA pattern • Fast tests first (unit > integration > e2e)

## Git Commits

`<type>(<scope>): <subject>` - Types: `feat`, `fix`, `test`, `refactor`, `docs`, `perf`, `chore`

## Code Style

### Self-Documenting Code
- **Names reveal intent**: `getUserByEmail()` not `getUser()` or `gube()`
- **Functions do one obvious thing**: No surprises, no side effects
- **Variables explain themselves**: `daysUntilExpiration` not `d` or `days`
- **Code structure tells the story**: Logical flow that reads top-to-bottom

### Naming: Scope Matters

Names inherit context from their enclosing scopes. The tighter the scope, the shorter the name can be.

**Naming by scope:**
- **Single letter** (`i`, `j`, `n`): Loop indices, very short functions
- **Short** (`user`, `err`, `ctx`): Function parameters, local variables
- **Descriptive** (`activeUsers`, `retryCount`): Function/method level
- **Fully qualified** (`MaxRetryAttempts`, `DefaultTimeoutSeconds`): Package/global level

```go
// Bad: Overly verbose in tight scope
for customerIndex := 0; customerIndex < len(customers); customerIndex++ {
    processCustomer(customers[customerIndex])
}

// Good: Short name in tight scope
for i, c := range customers {
    processCustomer(c)
}
```

```python
# Good: Progressive naming based on scope
def calculate_total(orders):
    t = 0  # 't' is fine - function name provides context
    for o in orders:
        t += o.amount
    return t
```

**Function constraints**: < 20 lines, < 3 parameters, single responsibility  
**Structure**: Early returns, UPPER_SNAKE_CASE constants, DRY, YAGNI

## Comments: Self-Documenting Code First

**Primary goal**: Write code so clear that comments become unnecessary. If you need to explain WHAT the code does, rewrite the code.

### When Comments ARE Needed
- **Public APIs**: Document contracts and usage
- **Non-obvious business rules**: Include ticket/requirement references  
- **Critical warnings**: Consequences that aren't apparent
- **Performance trade-offs**: Why you chose this approach
- **Workarounds**: Temporary fixes with removal timeline

### ❌ Never Write
```python
i += 1  # increment i (obvious)
# old_function() (commented-out code)
#--------- GETTERS --------- (noise)
```

### ✅ Good Comments (When Necessary)
```python
# Public API documentation
def calculate_tax(amount: float, region: str) -> float:
    """Calculate tax for a given amount and region.
    
    Args:
        amount: Pre-tax amount in USD
        region: ISO 3166-2 code (e.g., 'US-CA')
    Returns:
        Tax amount in USD
    """

# Critical business logic
# Users qualify for free shipping if premium OR order > $100
# UNLESS promo code 'SHIPIT' (Finance JIRA-4567)
eligible = (user.is_premium or order.final_total > 100) and promo != 'SHIPIT'

# Warning about non-obvious behavior
# CRITICAL: Payment gateway sends duplicate webhooks
if payment_already_processed(id):
    return {"status": "already_processed"}
```

**Remember**: The best comment is the one you didn't have to write because the code was clear.

## Language Guidelines

### Prefer Strong Typing

Always prefer strongly typed languages. Even in dynamically typed languages, use type checking tools.

**Type checking hierarchy:**
1. **Statically typed languages** (Go, Rust, Java, C#): Compile-time safety
2. **Type-annotated dynamic languages** (TypeScript, Python with mypy): Runtime language with static analysis
3. **Dynamic with type hints** (Python 3.5+, Ruby 3+): Documentation and tooling support

**Never ship without type checking:**
- TypeScript over JavaScript
- Python with type hints + mypy
- Flow or TypeScript for React
- Use strict mode where available

### Python
```python
# ALWAYS use type hints
def process(items: List[str]) -> Optional[List[str]]:
    """Process items with documentation."""
    return [item.strip() for item in items if item]

# Run mypy for static type checking
# mypy --strict src/
```

### TypeScript
```typescript
// Prefer TypeScript over JavaScript
// Use strict mode in tsconfig.json
const getData = async (id: string): Promise<Data> => {
    return (await api.get<Data>(`/data/${id}`)).data;
};

// Never use 'any' without justification
```

### Go
```go
// Go is statically typed by default ✓
func ProcessFile(path string) error {
    file, err := os.Open(path)
    if err != nil {
        return fmt.Errorf("opening: %w", err)
    }
    defer file.Close()
    return process(file)
}
```

**Configuration for type safety:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

```ini
# mypy.ini
[mypy]
python_version = 3.11
strict = True
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
```

## Testing

```python
def test_user_purchase():
    # Arrange
    user = User(balance=100)
    # Act  
    result = user.purchase(Item(price=50))
    # Assert
    assert result.success and user.balance == 50
```

**Coverage**: Unit 80%+ • Integration for critical paths • E2E for happy paths

### UI Testing with Puppeteer

Use Puppeteer for UI understanding and iteration where possible. It provides real browser testing and enables rapid UI development.

```javascript
// Puppeteer for UI testing and iteration
const puppeteer = require('puppeteer');

describe('User Flow', () => {
  let browser, page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: 'new',  // Use new headless mode
      slowMo: 0,         // Set to 250 for debugging
    });
    page = await browser.newPage();
  });

  test('critical user journey', async () => {
    await page.goto('http://localhost:3000');
    
    // Test actual user interactions
    await page.waitForSelector('[data-testid="login-button"]');
    await page.click('[data-testid="login-button"]');
    
    // Verify UI state
    await page.waitForSelector('.dashboard');
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Dashboard');
    
    // Screenshot for visual regression
    await page.screenshot({ path: 'dashboard.png' });
  });
  
  afterAll(async () => {
    await browser.close();
  });
});
```

**Why Puppeteer:**
- **Real browser testing**: Catches issues unit tests miss
- **Visual regression**: Screenshot comparisons
- **Performance metrics**: Measure actual load times
- **Debugging**: Run headed mode to see what's happening
- **User journey validation**: Test complete workflows

Use `data-testid` attributes for reliable element selection.

## Performance: Fast is my Favorite Feature

### Database
- Always index frequently queried columns
- Prevent N+1 queries with eager loading
- Paginate large datasets
- Use EXPLAIN for query analysis

### Data Transfer
- Send only needed fields
- Implement pagination
- Compress responses > 1KB

### Caching
L1: Memory → L2: Redis → L3: Database

### Budgets
- API p95: < 200ms
- DB query p95: < 50ms
- Time to Interactive: < 3s
- Bundle size: < 500KB

## Dependencies

1. **Standard library first**
2. **Popular, maintained libraries** (active, documented, semantic versioning)
3. **Local implementation** for simple needs

**Binary services** (Redis, PostgreSQL): Use official images, set resource limits, health checks, security best practices

## Documentation Requirements

Every project MUST have executable setup/test/deploy instructions.

### README.md Structure
```markdown
# Project Name
What it does and why

## Prerequisites
- Node.js 18+ / Python 3.11+ / Go 1.21+
- Docker 24+ & Docker Compose 2.20+

## Quick Start
# Clone and setup
git clone <repo> && cd project
npm install
cp .env.example .env

# Run locally
npm run db:migrate
npm run dev  # http://localhost:3000

# Or use Docker
docker-compose up

## Testing
npm test              # unit
npm run test:integration
npm run test:e2e
npm run test:coverage # all

## Production
docker build -t app:latest -f Dockerfile.prod .
docker-compose -f docker-compose.prod.yml up -d

## API Docs
Swagger: http://localhost:3000/api-docs
```

### Required Files
- `Dockerfile` (dev with hot reload)
- `Dockerfile.prod` (optimized production)
- `docker-compose.yml` (local dev)
- `docker-compose.prod.yml` (production)
- `.env.example` (all config options)

## Project Structure

```
src/
├── core/           # Business logic
├── infrastructure/ # External services  
├── api/           # HTTP layer
└── shared/        # Utilities

tests/
├── unit/
├── integration/
└── e2e/
```

## Refactoring Patterns

- **Extract Method**: Break large functions into smaller ones
- **Early Return**: Guard clauses instead of nested ifs
- **Replace Magic Numbers**: Use named constants
- **Introduce Parameter Object**: Group related parameters

## Code Review Checklist

- [ ] Tests pass
- [ ] No N+1 queries
- [ ] Comments explain why, not what
- [ ] README updated
- [ ] Performance acceptable
- [ ] No commented code

## Technical Debt Tracking

**ALWAYS track technical debt as you accumulate it.** When you identify code duplication, type safety issues, unclear code, or refactoring opportunities:

1. **Document immediately** in `TECH_DEBT.md` with:
   - **Location**: File paths and line numbers
   - **Issue**: What's wrong and why it matters
   - **Impact**: Lines of code, maintenance risk, performance impact
   - **Proposed Solution**: How to fix it
   - **Effort**: Time estimate (Low/Medium/High)
   - **Priority**: High/Medium/Low

2. **When completing refactoring**: Move the item to "Completed Refactoring" section with completion date

3. **Reference in code** for major debt: Add a comment with link to TECH_DEBT.md entry

**Example tech debt entry:**
```markdown
### Sorting Logic Duplication (~90 lines)
**Location**: SpellTable.tsx:105-150, SpellbookDetail.tsx:70-115
**Issue**: Identical sorting logic in two components
**Impact**: 90 lines duplicated, consistency risk
**Solution**: Extract to useSpellSorting hook
**Effort**: Medium (2-3 hours)
**Priority**: High
```

This ensures tech debt is visible, prioritized, and addressed systematically rather than forgotten.

## Directory Documentation

**ALWAYS maintain documentation in each directory explaining the code, abstractions, interfaces, and design decisions.**

### Requirements

1. **Every directory MUST have a README.md** that explains:
   - Purpose of the directory
   - Key files and their responsibilities
   - Important abstractions and interfaces
   - Design decisions and tradeoffs
   - How files interact with each other
   - Examples of common use cases

2. **Link documentation together**: Create an index at the root linking all directory READMEs

3. **Update documentation when code changes**: Keep docs in sync with code

### Documentation Structure

```
project-root/
├── README.md                    # Project overview + index of all docs
├── src/
│   ├── README.md               # Source code overview
│   ├── components/
│   │   └── README.md           # Component architecture
│   ├── hooks/
│   │   └── README.md           # Custom hooks explained
│   ├── services/
│   │   └── README.md           # Service layer design
│   ├── types/
│   │   └── README.md           # Type definitions explained
│   └── utils/
│       └── README.md           # Utility functions
└── tests/
    └── README.md               # Testing strategy
```

### What to Document

**In each directory README.md:**

```markdown
# [Directory Name]

## Purpose
One paragraph explaining why this directory exists.

## Key Files
- `filename.ts`: Brief description
- `another.ts`: Brief description

## Abstractions & Interfaces
Explain core abstractions:
- What is a [Key Concept]?
- How does [Interface] work?
- Why did we choose [Pattern]?

## Design Decisions
- **Decision**: Use custom hooks for state
- **Rationale**: Reusability and testability
- **Tradeoff**: Slight complexity increase

## Usage Examples
```typescript
// Common pattern
import { useExample } from './hooks/useExample';

const result = useExample(data);
```
```

### Example: hooks/README.md

```markdown
# Custom Hooks

## Purpose
Reusable React hooks for state management and side effects in the spellbook manager.

## Key Files
- `useSpells.ts`: Loads and manages spell data from the service layer
- `useSpellbooks.ts`: CRUD operations for spellbooks with IndexedDB
- `useSpellSorting.ts`: Generic sorting logic for spell arrays

## Abstractions

### useSpellSorting
Generic hook that accepts any array and extracts spell data for sorting.
Supports both `Spell[]` and enriched objects like `{spell: Spell, prepared: boolean}`.

**Why generic?** Avoids duplication between SpellTable and SpellbookDetail.

## Design Decisions

**Decision**: Use `useMemo` for sorting
**Rationale**: Prevent unnecessary re-sorts on every render
**Tradeoff**: Small memory overhead for memoized array

## Usage

```typescript
// For simple Spell arrays
const { sortedData, handleSort } = useSpellSorting(spells);

// For enriched objects
const { sortedData } = useSpellSorting(enrichedSpells, {
  getSpell: (item) => item.spell
});
```
```

**Benefits:**
- New developers quickly understand the codebase
- Design decisions are preserved
- Easier code reviews
- Reduces "why was it done this way?" questions

## Core Principles

**Code is a Liability**: Every line must justify itself. Delete whenever possible.

**Ship Iteratively**: Make it work → Make it right → Make it fast (when measured)

**Team Over Individual**: Consistency > preference. Reviews are learning opportunities.

**Performance Matters**: Users don't care about elegance if it's slow.

**Track Technical Debt**: Document it immediately in TECH_DEBT.md so it's never forgotten.

---

*"Programs must be written for people to read, and only incidentally for machines to execute."* - Harold Abelson
