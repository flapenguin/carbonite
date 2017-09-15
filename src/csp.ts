/**
 * Holds information about Content Security Policy on page.
 */
export interface Csp {
    /** Whether CSP is enabled. */
    enabled: boolean;

    /** Nonce value for styles from 'style-src'. */
    styleNonce?: string | null;

    /** Whether blob: images are allowed (i.e. 'img-src' has 'blob:'). */
    imageBlob?: boolean;
}
