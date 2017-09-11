import { ICsp } from './csp';
import { fromCanvas, fromString, getResourceTypeForForeignObjectSvg, IResource, Type } from './Resource';
import { inlineStyles } from './inlineStyles';
import { withLoadedImage } from './withLoadedImage';
import { StyleSheet } from './StyleSheet';
import { htmlToSvg } from './htmlToSvg';

export interface IRenderOptions {
    type: Type;
    mime: string;
    size: { width: number; height: number; };
    csp?: ICsp;
}

export function render(node: HTMLElement, options: IRenderOptions): Promise<IResource> {
    const csp = options.csp || { enabled: false };

    const stylesheet = new StyleSheet();

    node = inlineStyles(node, stylesheet);
    const svg = htmlToSvg(node, stylesheet, options.size, csp);

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
            return fromCanvas(canvas, options.mime, options.type);
        });
}
