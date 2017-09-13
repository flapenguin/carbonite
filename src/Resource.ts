import {Csp} from './csp';
import {URL, areBlobsSupported} from './support';
import * as base64 from './base64';
import * as browser from './browser';

export const defaultType = 'blob';

/**
 * Type of the resource.
 */
export type ResourceType = 'data-url' | 'blob';

/**
 * Resource with url that can be destroyed.
 */
export interface Resource {
    /** Type of the resource. */
    readonly type: ResourceType;

    /** Mime type of the resource. */
    readonly mime: string;

    /** Url of the resource. */
    readonly url: string;

    /** Destroys resource. */
    destroy(): void;
}

/**
 * Create resource from data url.
 */
export function fromDataUrl(url: string): Resource {
    return {
        type: 'data-url',
        mime: (url.match(/^data:(.*?);/) || ['', ''])[1],
        url: url,
        destroy() { /* nop */ }
    };
}

/**
 * Create resource from Blob.
 */
export function fromBlob(blob: Blob): Resource {
    const url = URL.createObjectURL(blob);
    return {
        type: 'blob',
        mime: (blob.type.match(/^([^/]*\/[^;]*)/) || ['', ''])[1],
        url: url,
        destroy() {
            URL.revokeObjectURL(url);
        }
    };
}

/**
 * Create resource from string with specified mime type.
 */
export function fromString(str: string, mime: string, type?: ResourceType): Resource {
    type = type || defaultType;

    if (type === 'blob') {
        return fromBlob(new Blob([str], { type: `${mime};charset=utf-8` }));
    }

    if (type === 'data-url') {
        const dataUrl = `data:${mime};base64,${base64.encode(str)}`;

        return fromDataUrl(dataUrl);
    }

    throw new Error(`carbonite: bad resource type, expected 'blob' or 'data-uri', got ${type}`);
}

/**
 * Create resource from canvas with specified mime type.
 */
export function fromCanvas(canvas: HTMLCanvasElement, mime: string, type?: ResourceType): Promise<Resource> {
    type = type || defaultType;
    try {
        if (type === 'data-url') {
            return Promise.resolve(fromDataUrl(canvas.toDataURL(mime)));
        }

        if (type === 'blob') {
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(fromBlob(blob));
                    } else {
                        reject(new Error('carbonite: cannot render canvas'));
                    }
                }, mime);
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }

    return Promise.reject(null);
}

/**
 * Get resource type for rendering svg on canvas.
 */
export function getResourceTypeForForeignObjectSvg(csp: Csp): ResourceType {
    // We require data: in image-src, but not blob:.
    if (csp.enabled && !csp.imageBlob) {
        return 'data-url';
    }

    // Chromiums taint canvas after rendering blobs with <foreignObject>. Data URI is fine though.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=294129
    if (browser.isChromium) {
        return 'data-url';
    }

    return areBlobsSupported(csp) ? 'blob' : 'data-url';
}
