# prefixes-form

A standalone web component for managing RDF namespace prefixes with built-in common vocabularies. Part of the MMM (Multi-perspectival Mutable Mapping) ecosystem.

![npm version](https://img.shields.io/npm/v/@mmmlib/prefixes-form.svg)
![license](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)

## Features

- 🎯 **Zero dependencies** - Pure web component, no framework required
- 📦 **Pre-loaded vocabularies** - Includes common RDF prefixes (FOAF, DC, Schema.org, etc.)
- 🔄 **Dual integration** - Works standalone or integrates with knowledge base systems
- 📢 **Event-driven** - Emits custom events for all prefix operations
- 🎨 **Shadow DOM** - Fully encapsulated styling
- ✨ **Dynamic management** - Add, enable/disable prefixes on the fly

## Installation

```bash
npm install @mmmlib/prefixes-form
```

Or use directly from CDN:

```html
<script type="module" src="https://unpkg.com/@mmmlib/prefixes-form/dist/prefixes-form.min.js"></script>
```

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="path/to/prefixes-form.js"></script>
</head>
<body>
    <prefixes-form></prefixes-form>
</body>
</html>
```

### With Knowledge Base Integration

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

### Event Handling

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
```

### Programmatic Access

```javascript
const form = document.querySelector('prefixes-form');

// Get all selected prefixes
const selected = form.getSelectedPrefixes();
// Returns: { "dc": "http://purl.org/dc/elements/1.1/", ... }

// Get all available prefixes
const all = form.getAllPrefixes();

// Add prefixes programmatically
form.addPrefix('custom', 'http://example.com/custom#');
form.addPrefixes({
    'app': 'http://myapp.com/ns#',
    'data': 'http://myapp.com/data#'
});
```

## API Reference

### Properties

- **`kb`** - Knowledge base object for integration (optional)

### Methods

- **`addPrefix(prefix, iri)`** - Add a single prefix
- **`addPrefixes(prefixesObject)`** - Add multiple prefixes from an object
- **`getSelectedPrefixes()`** - Returns object of currently selected prefixes
- **`getAllPrefixes()`** - Returns object of all available prefixes

### Events

All events bubble and are composed (cross shadow DOM boundaries).

- **`prefix-added`** - Fired when a new prefix is manually added
  - `detail: { prefix: string, expansion: string }`
- **`prefix-enabled`** - Fired when a prefix checkbox is checked
  - `detail: { prefix: string, expansion: string }`
- **`prefix-disabled`** - Fired when a prefix checkbox is unchecked
  - `detail: { prefix: string, expansion: string }`

## Built-in Prefix Collections

The component includes three prefix collections:

### DEFAULT_CHOSEN
A curated set of commonly used prefixes that are pre-selected:
- `dc` - Dublin Core
- `foaf` - Friend of a Friend
- `rdf` - RDF Schema
- `rdfs` - RDF Schema
- `schema` - Schema.org
- `skos` - Simple Knowledge Organization System
- `wp` - Wikipedia
- `owl2` - Web Ontology Language 2

### DEFAULT_ALL
Additional prefixes available by default:
- `owl` - Web Ontology Language
- `void` - Vocabulary of Interlinked Datasets

### COMMON_PREFIXES
An extensive collection of 40+ common RDF/Linked Data prefixes including:
ActivityStreams, BIBO, Creative Commons, DBpedia, EXIF, GoodRelations, IIIF, LDP, MPEG7, OA, PCDM, PROV, SIOC, SNOMEDCT, and many more.

## Development

```bash
# Clone the repository
git clone https://github.com/smurp/prefixes-form.git
cd prefixes-form

# Install dependencies
npm install

# Run development server
npm run dev

# Build minified version
npm run build
```

## Browser Support

Works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES6 Classes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

AGPL-3.0-or-later © smurp

This component is licensed under the GNU Affero General Public License version 3 or later. This means:
- You can use, modify, and distribute this component
- If you modify and run it on a server, you must provide the source code to users
- Any software that incorporates this component must also be released under AGPL-3.0-or-later

See the LICENSE file for full details.

## Related Projects

- [mmmlib](https://github.com/smurp/mmmlib) - The parent MMM ecosystem library