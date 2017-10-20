import {Csp} from './csp';
import {StyleSheet} from './StyleSheet';

const xmlSerializer = new XMLSerializer();

export interface Size {
    width: number;
    height: number;
}

/**
 * Wraps html into svg image.
 */
export function wrapHtmlInSvg(
    node: HTMLElement,
    stylesheet: StyleSheet,
    size: Size,
    csp: Csp
): string {
    const rootStyle = stylesheet.createClass({
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        overflow: 'hidden'
    });

    const style = document.createElement('style');
    if (csp.enabled && csp.styleNonce) {
        style.setAttribute('none', csp.styleNonce);
    }
    style.innerHTML = stylesheet.combine();

    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">
            ${xmlSerializer.serializeToString(style)}
            <foreignObject width="100%" height="100%">
                <body xmlns="http://www.w3.org/1999/xhtml" class="${rootStyle}">
                    ${xmlSerializer.serializeToString(node)}
                </body>
            </foreignObject>
        </svg>
    `;
}
