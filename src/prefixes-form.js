/**
 * PrefixesForm Web Component
 * A component for managing RDF namespace prefixes
 * @customElement prefixes-form
 */
class PrefixesForm extends HTMLElement {
    static get observedAttributes() {
        return [];
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
        
        // Load initial prefixes
        this.fillAll(this.DEFAULT_ALL);
        this.fillChosen(this._kb ? {} : this.DEFAULT_CHOSEN);
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
                }
                .prefList label span:first-child {
                    width: 5em;
                }
                .prefList label span:first-child::after {
                    content: ":";
                    margin-left: 1px;
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
                    padding: 0px;
                }
                .adder new_prefix {
                    display: inline-block;
                    width: 5em;
                }
                .adder input {
                    width: inherit;
                    margin: 0;
                    font-size: normal;
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
                    <input type="text" name="new_prefix" pattern="[a-zA-Z]*" required/>:
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
            
            // Emit custom event
            this.dispatchEvent(new CustomEvent('prefix-enabled', {
                detail: { prefix, expansion },
                bubbles: true,
                composed: true
            }));
        } else {
            delete this.chosen[prefix];
            
            // Emit custom event
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
            
            // Emit custom event
            this.dispatchEvent(new CustomEvent('prefix-added', {
                detail: { prefix, expansion },
                bubbles: true,
                composed: true
            }));
        }
    }
    
    add_prefix_to_list(prefix, expansion, checkboxAttrs) {
        this.all[prefix] = expansion;
        checkboxAttrs.name = prefix;
        if (checkboxAttrs.checked) {
            this.chosen[prefix] = expansion;
        }
        
        const input = this.crElem('input', checkboxAttrs);
        input.onchange = this.handle_checkbox_change.bind(this);
        
        const label = this.crElem('label', {}, [
            this.crElem('span', {}, [prefix]),
            input,
            this.crElem('a', { href: expansion, target: '_blank' }, [expansion])
        ]);
        
        this.insert_sortedly(label, prefix, !!checkboxAttrs.checked);
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
     * Add multiple prefixes at once
     * @param {Object} prefixes - Object with prefix:IRI pairs
     */
    addPrefixes(prefixes) {
        for (const [prefix, iri] of Object.entries(prefixes)) {
            this.addPrefix(prefix, iri);
        }
    }
    
    /**
     * Add a single prefix
     * @param {string} prefix - The prefix to add
     * @param {string} iri - The IRI expansion
     */
    addPrefix(prefix, iri) {
        this.fillChosen({ [prefix]: iri });
    }
    
    /**
     * Fill chosen prefixes
     * @param {Object} prefixesObj - Object with prefix:IRI pairs
     */
    fillChosen(prefixesObj) {
        if (!prefixesObj) return;
        
        for (const [prefix, expansion] of Object.entries(prefixesObj)) {
            this.chosen[prefix] = expansion;
            this.add_prefix_to_list(prefix, expansion, { type: 'checkbox', checked: 'checked' });
        }
    }
    
    /**
     * Fill all available prefixes
     * @param {Object} prefixesObj - Object with prefix:IRI pairs
     */
    fillAll(prefixesObj) {
        if (!prefixesObj) return;
        
        for (const [prefix, expansion] of Object.entries(prefixesObj)) {
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
    
    // Lifecycle callbacks
    connectedCallback() {
        // Component is connected to the DOM
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
