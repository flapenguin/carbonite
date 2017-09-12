import { ICsp } from './csp';
import { URL, areBlobsSupported } from './support';
import * as base64 from './base64';
import * as browser from './browser';

export const defaultType = 'blob';
export type Type = 'data-url' | 'blob';

export interface IResource {
    readonly type: Type;
    readonly mime: string;
    readonly url: string;

    destroy(): void;
}

export function fromDataUrl(url: string): IResource {
    return {
        type: 'data-url',
        mime: (url.match(/^data:(.*?);/) || ['', ''])[1],
        url: url,
        destroy() { /* nop */ }
    };
}

export function fromBlob(blob: Blob): IResource {
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

export function fromString(str: string, mime: string, type?: Type): IResource {
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

export function fromCanvas(canvas: HTMLCanvasElement, mime: string, type?: Type): Promise<IResource> {
    type = type || defaultType;
    try {
        if (type === 'data-url') {
            return Promise.resolve(fromDataUrl(canvas.toDataURL()));
        }

        if (type === 'blob') {
            return new Promise((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(fromBlob(blob));
                    } else {
                        reject(new Error('carbonite: cannot render canvas'));
                    }
                });
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }

    return Promise.reject(null);
}

export function getResourceTypeForForeignObjectSvg(csp: ICsp): Type {
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
