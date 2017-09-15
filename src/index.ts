import {Csp} from './csp';
import {
    createResourceFromCanvas,
    createResourceFromString,
    getResourceTypeForForeignObjectSvg,
    Resource,
    ResourceType,
    getDefaultType,
    isValidResourceType
} from './Resource';
import {inlineStyles} from './inlineStyles';
import {withLoadedImage} from './withLoadedImage';
import {StyleSheet} from './StyleSheet';
import {wrapHtmlInSvg} from './htmlToSvg';
import {isSupported, isNonSvgSupported, areBlobsSupported} from './support';

export interface RenderOptions {
    /** Desired type of rendered image. */
    type?: ResourceType;

    /** Desired mime type of rendered image. */
    mime?: string;

    /** Size of element. */
    size?: { width: number; height: number; };

    /** Content Security Policy options. */
    csp?: Csp;
}

/**
 * Renders element from document into image.
 */
export function render(node: HTMLElement, options?: RenderOptions): Promise<Resource> {
    options = options || {};

    const csp = options.csp || { enabled: false };

    if (!isSupported(csp)) {
        return Promise.reject(new Error('carbonite: render is not supported'));
    }

    const nonSvgSupported = isNonSvgSupported(csp);

    const size = options.size || node.getBoundingClientRect();
    const type = options.type || getDefaultType(csp);
    const mime = options.mime || (nonSvgSupported ? 'image/png' : 'image/svg+xml');

    if (!isValidResourceType(type)) {
        return Promise.reject(new Error("carbonite: only 'blob' and 'data-url' types are supported"));
    }

    if (type === 'blob' && !areBlobsSupported(csp)) {
        return Promise.reject(new Error('carbonite: blobs are not supported'));
    }

    if (mime !== 'image/svg+xml' && !nonSvgSupported) {
        return Promise.reject(new Error("carbonite: only 'image/svg+xml' mime is supported"));
    }

    if (!size || !size.width || !size.height) {
        return Promise.reject(new Error('carbonite: both width and height must be non-zero'));
    }

    if (!document.body.contains(node)) {
        return Promise.reject(new Error('carbonite: node must be in document'));
    }

    const stylesheet = new StyleSheet();

    return inlineStyles(node, stylesheet)
        .then((inlined) => {
            const svg = wrapHtmlInSvg(<HTMLElement> inlined, stylesheet, size, csp);

            return mime === 'image/svg+xml' ?
                createResourceFromString(svg, mime, type) :
                rasterizeSvg(svg, { mime, type, size, csp });
        });
}

function rasterizeSvg(svg: string, options: RenderOptions): Promise<Resource> {
    const svgType = getResourceTypeForForeignObjectSvg(options.csp!);
    const svgResource = createResourceFromString(svg, 'image/svg+xml', svgType);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = options.size!.width;
    canvas.height = options.size!.height;

    return withLoadedImage(svgResource.url, (img) => ctx.drawImage(img, 0, 0))
        .then(() => {
            svgResource.destroy();
            return createResourceFromCanvas(canvas, options.mime!, options.type!);
        });
}
