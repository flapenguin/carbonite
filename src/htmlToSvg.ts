import {Csp} from './csp';
import {StyleSheet} from './StyleSheet';

/**
 * Wraps html into svg image.
 */
export function htmlToSvg(
    node: HTMLElement,
    stylesheet: StyleSheet,
    size: { width: number; height: number; },
    csp: Csp
): string {
    const html = new XMLSerializer().serializeToString(node);
    const rootStyle = stylesheet.createClass({
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        overflow: 'hidden'
    });

    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">
            <style ${csp.enabled ? `nonce="${csp.styleNonce}"` : ''}>
                ${stylesheet.combine()}
            </style>
            <foreignObject width="100%" height="100%">
                <body xmlns="http://www.w3.org/1999/xhtml" class="${rootStyle}">
                    ${html}
                </body>
            </foreignObject>
        </svg>
    `;
}
