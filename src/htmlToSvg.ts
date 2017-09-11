import { ICsp } from './csp';
import { StyleSheet } from './StyleSheet';

export function htmlToSvg(
    node: HTMLElement,
    stylesheet: StyleSheet,
    size: { width: number; height: number; },
    csp: ICsp
): string {
    const html = new XMLSerializer().serializeToString(node);
    const rootStyle = stylesheet.createClass('position: relative;');
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">
        <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
                <style ${csp.enabled ? `nonce="${csp.styleNonce}"` : ''}>
                    ${stylesheet.combine()}
                </style>
                <div class="${rootStyle}">
                    ${html}
                </div>
            </div>
        </foreignObject>
        </svg>
    `;
}
