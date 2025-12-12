/**
 * PrefixesForm Web Component
 * A component for managing RDF namespace prefixes
 * @customElement prefixes-form
 */
class PrefixesForm extends HTMLElement {
    static get observedAttributes() {
        return ['empty'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Internal state
        this.all = {};
        this.chosen = {};
        this._kb = null;
        
        // Initialize with converted prefix collections
        this.initializePrefixCollections();
        
        // Create and attach the form
        this.render();
        this.make_handles();
        this.attach_handlers();
    }
    
    // Converted prefix collections from TTL to POJOs
    initializePrefixCollections() {
        this.COMMON_PREFIXES = {
            "acl": "http://www.w3.org/ns/auth/acl#",
            "as": "http://www.w3.org/ns/activitystreams#",
            "bibo": "http://purl.org/ontology/bibo/",
            "cc": "http://creativecommons.org/ns#",
            "cnt": "http://www.w3.org/2011/content#",
            "dbpedia": "http://dbpedia.org/resource/",
            "dc": "http://purl.org/dc/elements/1.1/",
            "dcterms": "http://purl.org/dc/terms/",
            "dctypes": "http://purl.org/dc/dcmitype/",
            "ebuccdm": "http://www.ebu.ch/metadata/ontologies/ebuccdm#",
            "exif": "http://www.w3.org/2003/12/exif/ns#",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
            "gr": "http://purl.org/goodrelations/v1#",
            "iana": "http://www.iana.org/assignments/relation/",
            "iiif": "http://iiif.io/api/image/2#",
            "ldp": "http://www.w3.org/ns/ldp#",
            "movie": "http://data.linkedmdb.org/resource/movie/",
            "mpeg-7": "http://mpeg7.org/",
            "mpeg7": "http://purl.org/ontology/mpeg7/",
            "ntsg": "http://example.com/ntsg/",
            "oa": "http://www.w3.org/ns/oa#",
            "ore": "http://www.openarchives.org/ore/terms/",
            "owl2": "http://www.w3.org/2006/12/owl2#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "pcdm": "http://pcdm.org/models#",
            "po": "http://purl.org/ontology/po/",
            "prov": "http://www.w3.org/ns/prov#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "sc": "http://iiif.io/api/presentation/2#",
            "schema": "http://schema.org/",
            "sg": "http://example.com/sg/",
            "sioc": "http://rdfs.org/sioc/ns#",
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "snomedct": "http://purl.bioontology.org/ontology/SNOMEDCT/",
            "svcs": "http://rdfs.org/sioc/services#",
            "temporal": "http://swrl.stanford.edu/ontologies/built-ins/3.3/temporal.owl",
            "time": "http://www.w3.org/2006/time#",
            "trig": "http://www.w3.org/2004/03/trix/rdfg-1/",
            "video": "http://purl.org/ontology/video/",
            "wp": "https://en.wikipedia.org/wiki/",
            "xml": "http://www.w3.org/XML/1998/namespace",
            "xsd": "http://www.w3.org/2001/XMLSchema#"
        };
        
        this.DEFAULT_CHOSEN = {
            "wp": "https://en.wikipedia.org/wiki/",
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "dc": "http://purl.org/dc/elements/1.1/",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "owl2": "http://www.w3.org/2006/12/owl2#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "schema": "http://schema.org/"
        };
        
        this.DEFAULT_ALL = {
            "dc": "http://purl.org/dc/elements/1.1/",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "owl2": "http://www.w3.org/2006/12/owl2#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "schema": "http://schema.org/",
            "void": "http://rdfs.org/ns/void#"
        };
    }
    
    // DOM utility functions
    setAttrs(elem, attrs = {}) {
        for (const k in attrs) {
            elem.setAttribute(k, attrs[k]);
        }
        return elem;
    }
    
    insertKids(elem, contents) {
        for (const item of contents) {
            if (item instanceof Element) {
                elem.insertAdjacentElement('beforeend', item);
            } else if (item != null) {
                elem.textContent = item;
            }
        }
        return elem;
    }
    
    crElem(typ = 'div', attrs = {}, contents = []) {
        return this.insertKids(
            this.setAttrs(document.createElement(typ), attrs),
            contents
        );
    }
    
    // Property getter/setter for kb
    get kb() {
        return this._kb;
    }
    
    set kb(value) {
        if (this._kb && this._kb.removeGraphEventListener) {
            this._kb.removeGraphEventListener('addprefixes', this._boundAddPrefixes);
        }
        
        this._kb = value;
        
        if (value) {
            this._boundAddPrefixes = this.addPrefixes.bind(this);
            if (value.addGraphEventListener) {
                value.addGraphEventListener('addprefixes', this._boundAddPrefixes);
            }
            this.loadPrefixes();
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    user-select: none;
                }
                form {
                    width: fit-content;
                    max-width: 25em;
                    padding: .5em 1em;
                }
                h3 {
                    text-align: left;
                    margin: 0;
                }
                input, button {
                    width: inherit;
                }
                li, details {
                    font-size: small;
                }
                .prefList {
                    display: flex;
                    flex-direction: column;
                    font-size: small;
                }
                .prefList label {
                    display: flex;
                    flex-direction: row;
                    margin-bottom: 0;
                    font-weight: normal;
                    align-items: center;
                }
                .prefList label span:first-child {
                    width: 5em;
                }
                .prefList label span:first-child::after {
                    content: ":";
                    margin-left: 1px;
                }
                .prefList label .rm-btn {
                    margin-left: 4px;
                    padding: 0 4px;
                    font-size: 10px;
                    cursor: pointer;
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    color: #666;
                    line-height: 1;
                }
                .prefList label .rm-btn:hover {
                    background: #ffcccc;
                    border-color: #cc0000;
                    color: #cc0000;
                }
                .adder {
                    display: flex;
                    flex-direction: row;
                }
                .adder [name='new_prefix'] {
                    width: 4em;
                }
                .adder input, .adder button {
                    display: inline-block;
                    vertical-align: middle;
                    padding: 0;
                }
                button {
                    width: fit-content;
                }
                button.addable {
                    background-color: #4CAF50;
                }
            </style>
            <form>
                <h3>Prefixes</h3>
                <fieldset class="adder">
                    <legend>add</legend>
                    <input type="text" name="new_prefix" pattern="[a-zA-Z][a-zA-Z0-9_-]*" required/>:
                    <button disabled>+</button>
                    <input type="url" name="new_expansion" required/>
                </fieldset>
                <fieldset class="enabler">
                    <legend>enabled</legend>
                    <div class="prefList">
                        <label><span>PREFIX</span><input type="checkbox" disabled><span>EXPANSION</span></label>
                    </div>
                </fieldset>
            </form>
        `;
    }
    
    make_handles() {
        const root = this.shadowRoot;
        this.adder_button = root.querySelector('.adder button');
        this.new_prefix = root.querySelector("[name='new_prefix']");
        this.new_expansion = root.querySelector("[name='new_expansion']");
        this.prefList = root.querySelector('.prefList');
    }
    
    attach_handlers() {
        this.adder_button.addEventListener('click', this.handle_add.bind(this));
        this.new_prefix.oninput = this.validate_adder.bind(this);
        this.new_expansion.oninput = this.validate_adder.bind(this);
    }
    
    validate_adder(event) {
        const { adder_button, new_prefix, new_expansion } = this;
        const isValid = (new_prefix.checkValidity() && new_expansion.checkValidity());
        const collision = this.all[new_prefix.value];
        const isUnique = !collision;
        const isClickable = (isUnique && isValid);
        adder_button.disabled = !isClickable;
        
        if (isClickable) {
            adder_button.classList.add('addable');
        } else {
            adder_button.classList.remove('addable');
        }
        return isClickable;
    }
    
    handle_checkbox_change(event) {
        const checkbox = event.target;
        const prefix = checkbox.name;
        const expansion = this.all[prefix];
        
        if (checkbox.checked) {
            this.chosen[prefix] = expansion;
            this.addPrefix_upstream(prefix, expansion);
            
            this.dispatchEvent(new CustomEvent('prefix-enabled', {
                detail: { prefix, expansion },
                bubbles: true,
                composed: true
            }));
        } else {
            delete this.chosen[prefix];
            
            this.dispatchEvent(new CustomEvent('prefix-disabled', {
                detail: { prefix, expansion },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    addPrefix_upstream(prefix, expansion) {
        if (this.kb && this.kb.addPrefix) {
            this.kb.addPrefix(prefix, expansion);
        }
    }
    
    handle_add(event) {
        event.preventDefault();
        const { new_prefix, new_expansion } = this;
        if (new_prefix.checkValidity() && new_expansion.checkValidity()) {
            this.add_prefix_manually(new_prefix.value, new_expansion.value);
            
            // Clear inputs after successful add
            new_prefix.value = '';
            new_expansion.value = '';
            this.validate_adder();
        }
    }
    
    add_prefix_manually(prefix, expansion) {
        const checkboxAttrs = { type: 'checkbox', checked: 'checked' };
        if (this.validate_adder()) {
            this.add_prefix_to_list(prefix, expansion, checkboxAttrs);
            
            this.dispatchEvent(new CustomEvent('prefix-added', {
                detail: { prefix, expansion },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    /**
     * Find the label element for a given prefix
     * @param {string} prefix - The prefix to find
     * @returns {HTMLElement|null} The label element or null
     */
    _findLabelForPrefix(prefix) {
        for (const label of this.prefList.children) {
            const span = label.querySelector('span:first-child');
            if (span && span.innerText === prefix) {
                return label;
            }
        }
        return null;
    }
    
    /**
     * Find the checkbox for a given prefix
     * @param {string} prefix - The prefix to find
     * @returns {HTMLInputElement|null} The checkbox element or null
     */
    _findCheckboxForPrefix(prefix) {
        const label = this._findLabelForPrefix(prefix);
        return label ? label.querySelector('input[type="checkbox"]') : null;
    }
    
    /**
     * Check if a prefix is currently engaged (selected/checked)
     * @param {string} prefix - The prefix to check
     * @returns {boolean} True if engaged
     */
    isEngaged(prefix) {
        return prefix in this.chosen;
    }
    
    /**
     * Check if a prefix exists in the list (engaged or not)
     * @param {string} prefix - The prefix to check
     * @returns {boolean} True if in list
     */
    hasPrefix(prefix) {
        return prefix in this.all;
    }
    
    add_prefix_to_list(prefix, expansion, checkboxAttrs) {
        this.all[prefix] = expansion;
        checkboxAttrs.name = prefix;
        if (checkboxAttrs.checked) {
            this.chosen[prefix] = expansion;
        }
        
        const input = this.crElem('input', checkboxAttrs);
        input.onchange = this.handle_checkbox_change.bind(this);
        
        // Create remove button
        const rmBtn = this.crElem('button', { 
            class: 'rm-btn', 
            type: 'button',
            title: `Remove ${prefix}`
        }, ['×']);
        rmBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.rmPrefix(prefix);
        };
        
        const label = this.crElem('label', {}, [
            this.crElem('span', {}, [prefix]),
            input,
            this.crElem('a', { href: expansion, target: '_blank' }, [expansion]),
            rmBtn
        ]);
        
        this.insert_sortedly(label, prefix, !checkboxAttrs.checked);
    }
    
    insert_sortedly(labelElem, prefix, isChecked) {
        const kids = this.prefList.children;
        let idx = 0;
        
        for (const childLabel of kids) {
            const childLabelStr = childLabel.outerHTML;
            if (childLabelStr.indexOf('disabled') > -1) {
                idx++;
                continue;
            }
            
            const span1 = childLabel.querySelector('span:first-child');
            const childPrefix = span1.innerText;
            
            if (prefix < childPrefix) {
                childLabel.insertAdjacentElement('beforebegin', labelElem);
                return;
            }
            
            if (prefix === childPrefix) {
                // Replace existing entry
                childLabel.insertAdjacentElement('beforebegin', labelElem);
                childLabel.remove();
                return;
            }
            idx++;
        }
        
        this.prefList.insertAdjacentElement('beforeend', labelElem);
    }
    
    /**
     * Load prefixes from the kb object
     */
    loadPrefixes() {
        if (this.kb && this.kb.prefixes) {
            this.addPrefixes(this.kb.prefixes);
        }
    }
    
    /**
     * Add multiple prefixes at once (engaged/selected)
     * @param {Object} prefixes - Object with prefix:IRI pairs
     */
    addPrefixes(prefixes) {
        for (const [prefix, iri] of Object.entries(prefixes)) {
            this.addPrefix(prefix, iri);
        }
    }
    
    /**
     * Add a single prefix (engaged/selected)
     * @param {string} prefix - The prefix to add
     * @param {string} iri - The IRI expansion
     */
    addPrefix(prefix, iri) {
        this.fillChosen({ [prefix]: iri });
    }
    
    /**
     * Fill chosen prefixes (idempotent - won't duplicate)
     * @param {Object} prefixesObj - Object with prefix:IRI pairs
     */
    fillChosen(prefixesObj) {
        if (!prefixesObj) return;
        
        for (const [prefix, expansion] of Object.entries(prefixesObj)) {
            // Skip if already in chosen with same expansion
            if (this.chosen[prefix] === expansion) {
                continue;
            }
            this.chosen[prefix] = expansion;
            this.all[prefix] = expansion;
            this.add_prefix_to_list(prefix, expansion, { type: 'checkbox', checked: 'checked' });
        }
    }
    
    /**
     * Fill all available prefixes (idempotent - won't duplicate)
     * @param {Object} prefixesObj - Object with prefix:IRI pairs
     */
    fillAll(prefixesObj) {
        if (!prefixesObj) return;
        
        for (const [prefix, expansion] of Object.entries(prefixesObj)) {
            // Skip if already in all with same expansion
            if (this.all[prefix] === expansion) {
                continue;
            }
            this.all[prefix] = expansion;
            this.add_prefix_to_list(prefix, expansion, { type: 'checkbox' });
        }
    }
    
    /**
     * Get all selected prefixes
     * @returns {Object} Object with selected prefix:IRI pairs
     */
    getSelectedPrefixes() {
        return { ...this.chosen };
    }
    
    /**
     * Get all available prefixes
     * @returns {Object} Object with all prefix:IRI pairs
     */
    getAllPrefixes() {
        return { ...this.all };
    }
    
    // =========================================================================
    // NEW API METHODS
    // =========================================================================
    
    /**
     * Engage (select/check) a prefix that's already in the list
     * @param {string} prefix - The prefix to engage
     * @returns {boolean} True if state changed, false if already engaged or not found
     */
    engagePrefix(prefix) {
        if (!this.hasPrefix(prefix)) {
            console.warn(`engagePrefix: prefix '${prefix}' not in list`);
            return false;
        }
        if (this.isEngaged(prefix)) {
            return false; // Already engaged, idempotent
        }
        
        const checkbox = this._findCheckboxForPrefix(prefix);
        if (checkbox) {
            checkbox.checked = true;
            // Trigger the change handler to update state and emit event
            checkbox.dispatchEvent(new Event('change'));
            return true;
        }
        return false;
    }
    
    /**
     * Disengage (deselect/uncheck) a prefix
     * @param {string} prefix - The prefix to disengage
     * @returns {boolean} True if state changed, false if already disengaged or not found
     */
    disengagePrefix(prefix) {
        if (!this.hasPrefix(prefix)) {
            return false; // Not in list, nothing to do
        }
        if (!this.isEngaged(prefix)) {
            return false; // Already disengaged, idempotent
        }
        
        const checkbox = this._findCheckboxForPrefix(prefix);
        if (checkbox) {
            checkbox.checked = false;
            // Trigger the change handler to update state and emit event
            checkbox.dispatchEvent(new Event('change'));
            return true;
        }
        return false;
    }
    
    /**
     * Toggle a prefix on/off, or force to a specific state
     * @param {string} prefix - The prefix to toggle
     * @param {boolean} [state] - Optional: true to engage, false to disengage
     * @returns {boolean} True if state changed
     */
    togglePrefix(prefix, state) {
        if (!this.hasPrefix(prefix)) {
            console.warn(`togglePrefix: prefix '${prefix}' not in list`);
            return false;
        }
        
        // Determine target state
        const currentlyEngaged = this.isEngaged(prefix);
        const targetState = (state === undefined) ? !currentlyEngaged : state;
        
        if (targetState === currentlyEngaged) {
            return false; // No change needed
        }
        
        return targetState ? this.engagePrefix(prefix) : this.disengagePrefix(prefix);
    }
    
    /**
     * Disengage all prefixes (turn them all off but keep in list)
     * @returns {number} Number of prefixes that were disengaged
     */
    disengageAll() {
        const prefixesToDisengage = Object.keys(this.chosen);
        let count = 0;
        
        for (const prefix of prefixesToDisengage) {
            if (this.disengagePrefix(prefix)) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * Engage all prefixes (turn them all on)
     * @returns {number} Number of prefixes that were engaged
     */
    engageAll() {
        const prefixesToEngage = Object.keys(this.all);
        let count = 0;
        
        for (const prefix of prefixesToEngage) {
            if (this.engagePrefix(prefix)) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * Remove a prefix from the list entirely
     * @param {string} prefix - The prefix to remove
     * @returns {boolean} True if removed, false if not found
     */
    rmPrefix(prefix) {
        if (!this.hasPrefix(prefix)) {
            return false;
        }
        
        const expansion = this.all[prefix];
        const wasEngaged = this.isEngaged(prefix);
        
        // Remove from DOM
        const label = this._findLabelForPrefix(prefix);
        if (label) {
            label.remove();
        }
        
        // Remove from state
        delete this.all[prefix];
        delete this.chosen[prefix];
        
        // Emit event
        this.dispatchEvent(new CustomEvent('prefix-removed', {
            detail: { prefix, expansion, wasEngaged },
            bubbles: true,
            composed: true
        }));
        
        return true;
    }
    
    /**
     * Remove all prefixes from the list
     * @returns {number} Number of prefixes removed
     */
    clearAll() {
        const prefixesToRemove = Object.keys(this.all);
        let count = 0;
        
        for (const prefix of prefixesToRemove) {
            if (this.rmPrefix(prefix)) {
                count++;
            }
        }
        
        return count;
    }
    
    // Lifecycle callbacks
    connectedCallback() {
        // Check for declarative prefix-entry children
        const entries = this.querySelectorAll('prefix-entry');
        const isEmpty = this.hasAttribute('empty');
        
        if (entries.length > 0) {
            // DECLARATIVE MODE: Use only declared prefixes
            console.log('DECLARATIVE MODE: Found', entries.length, 'prefix entries');
            
            entries.forEach(entry => {
                const prefix = entry.getAttribute('prefix');
                const expansion = entry.getAttribute('expansion');
                const selected = entry.hasAttribute('selected');
                const tooltip = entry.getAttribute('tooltip') || entry.getAttribute('title');
                
                if (prefix && expansion) {
                    this.all[prefix] = expansion;
                    
                    if (tooltip) {
                        if (!this._tooltips) this._tooltips = {};
                        this._tooltips[prefix] = tooltip;
                    }
                    
                    this.add_prefix_to_list(prefix, expansion, {
                        type: 'checkbox',
                        checked: selected ? 'checked' : undefined,
                        title: tooltip
                    });
                    
                    if (selected) {
                        this.chosen[prefix] = expansion;
                    }
                }
            });
            
            // Remove declarative entries from DOM
            entries.forEach(e => e.remove());
            
        } else if (isEmpty) {
            // EMPTY MODE: Start completely blank
            console.log('EMPTY MODE: No prefixes loaded');
            // Don't call fillAll or fillChosen - stay empty
            
        } else {
            // DEFAULT MODE: Load standard prefixes
            console.log('DEFAULT MODE: Loading standard prefixes');
            this.fillAll(this.DEFAULT_ALL);
            this.fillChosen(this._kb ? this._kb.prefixes : this.DEFAULT_CHOSEN);
        }
    }
    
    disconnectedCallback() {
        // Clean up when component is removed
        if (this.kb && this._boundAddPrefixes) {
            this.kb.removeGraphEventListener?.('addprefixes', this._boundAddPrefixes);
        }
    }
}

// Register the custom element
customElements.define('prefixes-form', PrefixesForm);

// Export for ES modules
export { PrefixesForm };