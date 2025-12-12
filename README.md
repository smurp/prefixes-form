# prefixes-form

A Web Component for managing RDF namespace prefixes with checkbox-based engagement, suitable for semantic web applications.

## Installation

```bash
npm install @mmmlib/prefixes-form
```

Or from GitHub:

```bash
npm install github:smurp/prefixes-form
```

## Basic Usage

```html
<script type="module" src="prefixes-form.js"></script>

<prefixes-form></prefixes-form>
```

## Initialization Modes

### 1. Default Mode (Standard RDF Prefixes)

Empty tag loads common RDF prefixes automatically:

```html
<prefixes-form></prefixes-form>
```

Includes: `dc`, `foaf`, `rdf`, `rdfs`, `schema`, `skos`, `wp`, `owl2`

### 2. Empty Mode (User Builds From Scratch)

Start completely blank for domain-specific applications:

```html
<prefixes-form empty></prefixes-form>
```

No prefixes are pre-loaded. Users add all prefixes manually or programmatically.

### 3. Declarative Mode (Custom Prefix Set)

Pre-configure with specific prefixes using `<prefix-entry>` elements:

```html
<prefixes-form>
    <prefix-entry prefix="ex" expansion="http://example.com/" />
    <prefix-entry prefix="myapp" expansion="http://myapp.org/ns#" selected />
    <prefix-entry prefix="data" expansion="http://myapp.org/data#" 
                  tooltip="Application data namespace" selected />
</prefixes-form>
```

**`<prefix-entry>` attributes:**
- `prefix` (required) - The prefix name
- `expansion` (required) - The full IRI
- `selected` (optional) - Pre-check this prefix
- `tooltip` or `title` (optional) - Helpful description shown on hover

## With Knowledge Base Integration

```javascript
const prefixesForm = document.querySelector('prefixes-form');

// Set up a knowledge base object
prefixesForm.kb = {
    prefixes: {
        "ex": "http://example.com/",
        "myapp": "http://myapp.org/ontology#"
    },
    addPrefix: (prefix, expansion) => {
        console.log(`Added prefix: ${prefix} -> ${expansion}`);
    },
    addGraphEventListener: (event, handler) => {
        // Handle graph events
    }
};
```

## Event Handling

```javascript
const form = document.querySelector('prefixes-form');

// Listen for prefix additions
form.addEventListener('prefix-added', (e) => {
    console.log('New prefix:', e.detail.prefix, e.detail.expansion);
});

// Listen for prefix enabling/disabling
form.addEventListener('prefix-enabled', (e) => {
    console.log('Enabled:', e.detail.prefix);
});

form.addEventListener('prefix-disabled', (e) => {
    console.log('Disabled:', e.detail.prefix);
});

// Listen for prefix removal
form.addEventListener('prefix-removed', (e) => {
    console.log('Removed:', e.detail.prefix, 'wasEngaged:', e.detail.wasEngaged);
});
```

## Programmatic Access

```javascript
const form = document.querySelector('prefixes-form');

// Get all selected prefixes
const selected = form.getSelectedPrefixes();
// Returns: { "dc": "http://purl.org/dc/elements/1.1/", ... }

// Get all available prefixes (selected or not)
const all = form.getAllPrefixes();

// Add prefixes programmatically (engaged/selected)
form.addPrefix('custom', 'http://example.com/custom#');
form.addPrefixes({
    'app': 'http://myapp.com/ns#',
    'data': 'http://myapp.com/data#'
});

// Add prefixes without engaging (available but unchecked)
form.fillAll({
    'extra': 'http://example.com/extra#'
});

// Check state
form.hasPrefix('dc');      // true if in list
form.isEngaged('dc');      // true if checked
```

## Engagement Control

Control which prefixes are selected (checked) without removing them from the list:

```javascript
const form = document.querySelector('prefixes-form');

// Engage (check) a specific prefix
form.engagePrefix('foaf');        // Returns true if state changed

// Disengage (uncheck) a specific prefix  
form.disengagePrefix('foaf');     // Returns true if state changed

// Toggle a prefix (flip current state)
form.togglePrefix('foaf');        // Returns true if state changed

// Force to a specific state
form.togglePrefix('foaf', true);  // Force engaged
form.togglePrefix('foaf', false); // Force disengaged

// Disengage all prefixes (uncheck all but keep in list)
const count = form.disengageAll();
console.log(`Disengaged ${count} prefixes`);

// Engage all prefixes (check all)
const count = form.engageAll();
console.log(`Engaged ${count} prefixes`);
```

## Removal

Remove prefixes from the list entirely:

```javascript
const form = document.querySelector('prefixes-form');

// Remove a single prefix
form.rmPrefix('custom');  // Returns true if removed

// Remove all prefixes
const count = form.clearAll();
console.log(`Removed ${count} prefixes`);
```

## API Reference

### Properties

- **`kb`** - Knowledge base object for integration (optional)
- **`all`** - Object containing all prefix:IRI pairs (read-only recommended)
- **`chosen`** - Object containing selected prefix:IRI pairs (read-only recommended)

### Query Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getSelectedPrefixes()` | `Object` | Currently selected (checked) prefixes |
| `getAllPrefixes()` | `Object` | All available prefixes |
| `hasPrefix(prefix)` | `boolean` | Whether prefix exists in list |
| `isEngaged(prefix)` | `boolean` | Whether prefix is currently checked |

### Add Methods

| Method | Description |
|--------|-------------|
| `addPrefix(prefix, iri)` | Add a single prefix (engaged) |
| `addPrefixes(prefixesObj)` | Add multiple prefixes (engaged) |
| `fillChosen(prefixesObj)` | Add prefixes as selected (idempotent) |
| `fillAll(prefixesObj)` | Add prefixes as available but unchecked (idempotent) |

### Engagement Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `engagePrefix(prefix)` | `boolean` | Check a prefix, returns true if state changed |
| `disengagePrefix(prefix)` | `boolean` | Uncheck a prefix, returns true if state changed |
| `togglePrefix(prefix, [state])` | `boolean` | Toggle or force state, returns true if changed |
| `engageAll()` | `number` | Check all prefixes, returns count changed |
| `disengageAll()` | `number` | Uncheck all prefixes, returns count changed |

### Removal Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `rmPrefix(prefix)` | `boolean` | Remove prefix from list entirely |
| `clearAll()` | `number` | Remove all prefixes, returns count removed |

### Events

All events bubble and are composed (cross shadow DOM boundaries).

| Event | Detail | Description |
|-------|--------|-------------|
| `prefix-added` | `{prefix, expansion}` | New prefix added via UI |
| `prefix-enabled` | `{prefix, expansion}` | Prefix checked |
| `prefix-disabled` | `{prefix, expansion}` | Prefix unchecked |
| `prefix-removed` | `{prefix, expansion, wasEngaged}` | Prefix removed from list |

## TypeScript Support

Type definitions are included in `index.d.ts`.

```typescript
import { PrefixesForm } from '@mmmlib/prefixes-form';

const form = document.querySelector('prefixes-form') as PrefixesForm;
const selected: Record<string, string> = form.getSelectedPrefixes();
```

## Development

```bash
# Clone the repository
git clone https://github.com/smurp/prefixes-form.git
cd prefixes-form

# Open examples in browser
open example/test-modes.html
open example/test-api.html
```

## License

MIT