import {Csp} from './csp';
import {URL, areBlobsSupported} from './support';
import * as base64 from './base64';
import * as browser from './browser';

/**
 * Type of the resource.
 */
export type ResourceType = 'data-url' | 'blob';

export function getDefaultType(csp: Csp): ResourceType {
    return areBlobsSupported(csp) ? 'blob' : 'data-url';
}

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
export function createResourceFromDataUrl(url: string): Resource {
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
export function createResourceFromBlob(blob: Blob): Resource {
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
export function createResourceFromString(str: string, mime: string, type: ResourceType): Resource {
    switch (type) {
        case 'blob':
            return createResourceFromBlob(new Blob([str], { type: `${mime};charset=utf-8` }));

        case 'data-url':
            const dataUrl = `data:${mime};base64,${base64.encode(str)}`;

            return createResourceFromDataUrl(dataUrl);
    }
}

/**
 * Create resource from canvas with specified mime type.
 */
export function createResourceFromCanvas(
    canvas: HTMLCanvasElement,
    mime: string,
    type: ResourceType
): Promise<Resource> {
    // HACK: integrating with old vow Promises in debug mode for easier integration with Maps API
    try {
        switch (type) {
            case 'blob':
                return new Promise((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(createResourceFromBlob(blob));
                        } else {
                            reject(new Error('carbonite: cannot render canvas'));
                        }
                    }, mime);
                });

            case 'data-url':
                return Promise.resolve(createResourceFromDataUrl(canvas.toDataURL(mime)));
        }
    } catch (e) {
        return Promise.reject(e);
    }

    // TypeScript's return type analyzer doesn't fully understand construction above.
    return <never> null;
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

/**
 * Checks whether passed string is a valid resource type.
 */
export function isValidResourceType(type: string) {
    return type === 'blob' || type === 'data-url';
}
