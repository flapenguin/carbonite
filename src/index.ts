import { ICsp } from './csp';
import {
    fromCanvas,
    fromString,
    getResourceTypeForForeignObjectSvg,
    IResource,
    Type,
    defaultType
} from './Resource';
import { inlineStyles } from './inlineStyles';
import { withLoadedImage } from './withLoadedImage';
import { StyleSheet } from './StyleSheet';
import { htmlToSvg } from './htmlToSvg';
import { isSupported, isNonSvgSupported, areBlobsSupported } from './support';

export interface IRenderOptions {
    type?: Type;
    mime?: string;
    size: { width: number; height: number; };
    csp?: ICsp;
}

export function render(node: HTMLElement, options: IRenderOptions): Promise<IResource> {
    const csp = options.csp || { enabled: false };
    const nonSvgSupported = isNonSvgSupported(csp);

    const type = options.type || defaultType;
    const mime = options.mime || (nonSvgSupported ? 'image/png' : 'image/svg+xml');

    if (!isSupported(csp)) {
        return Promise.reject(new Error(`carbonite: render is not supported`));
    }

    if (type === 'blob' && !areBlobsSupported(csp)) {
        return Promise.reject(new Error(`carbonite: blobs are not supported`));
    }

    if (mime !== 'image/svg+xml' && !nonSvgSupported) {
        return Promise.reject(new Error(`carbonite: only 'image/svg+xml' mime is supported`));
    }

    if (!document.body.contains(node)) {
        return Promise.reject(new Error(`carbonite: node must be in document`));
    }

    try {
        const stylesheet = new StyleSheet();

        const inlined = inlineStyles(node, stylesheet) as HTMLElement;
        const svg = htmlToSvg(inlined, stylesheet, options.size, csp);

        if (options.mime === 'image/svg+xml') {
            return Promise.resolve(fromString(svg, options.mime, options.type));
        }

        const svgResource = fromString(svg, 'image/svg+xml', getResourceTypeForForeignObjectSvg(csp));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        canvas.width = options.size.width;
        canvas.height = options.size.height;

        return withLoadedImage(svgResource.url, img => ctx.drawImage(img, 0, 0) as never)
            .then(() => {
                svgResource.destroy();
                return fromCanvas(canvas, mime, type);
            });
    } catch (e) {
        return Promise.reject(e);
    }
}
