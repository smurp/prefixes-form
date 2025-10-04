declare module '@mmmlib/prefixes-form' {
    export interface PrefixDetail {
        prefix: string;
        expansion: string;
    }

    export interface PrefixEvent extends CustomEvent {
        detail: PrefixDetail;
    }

    export interface KnowledgeBase {
        prefixes?: Record<string, string>;
        addPrefix?: (prefix: string, expansion: string) => void;
        addGraphEventListener?: (event: string, handler: Function) => void;
        removeGraphEventListener?: (event: string, handler: Function) => void;
    }

    export class PrefixesForm extends HTMLElement {
        /**
         * Knowledge base integration object
         */
        kb: KnowledgeBase | null;

        /**
         * Common RDF/Linked Data prefixes
         */
        readonly COMMON_PREFIXES: Record<string, string>;

        /**
         * Default selected prefixes
         */
        readonly DEFAULT_CHOSEN: Record<string, string>;

        /**
         * Default available prefixes
         */
        readonly DEFAULT_ALL: Record<string, string>;

        /**
         * Add a single prefix programmatically
         * @param prefix - The prefix to add
         * @param iri - The IRI expansion for the prefix
         */
        addPrefix(prefix: string, iri: string): void;

        /**
         * Add multiple prefixes programmatically
         * @param prefixes - Object containing prefix:IRI pairs
         */
        addPrefixes(prefixes: Record<string, string>): void;

        /**
         * Get all currently selected prefixes
         * @returns Object containing selected prefix:IRI pairs
         */
        getSelectedPrefixes(): Record<string, string>;

        /**
         * Get all available prefixes
         * @returns Object containing all prefix:IRI pairs
         */
        getAllPrefixes(): Record<string, string>;

        /**
         * Fill chosen prefixes
         * @param prefixesObj - Object containing prefix:IRI pairs to mark as chosen
         */
        fillChosen(prefixesObj: Record<string, string>): void;

        /**
         * Fill all available prefixes
         * @param prefixesObj - Object containing prefix:IRI pairs to make available
         */
        fillAll(prefixesObj: Record<string, string>): void;
    }

    global {
        interface HTMLElementEventMap {
            'prefix-added': PrefixEvent;
            'prefix-enabled': PrefixEvent;
            'prefix-disabled': PrefixEvent;
        }

        interface HTMLElementTagNameMap {
            'prefixes-form': PrefixesForm;
        }
    }
}
