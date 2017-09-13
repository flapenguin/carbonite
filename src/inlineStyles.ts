import { StyleSheet } from './StyleSheet';
import { cssOmKeyToCssKey } from './cssomKeyToCssKey';
import * as browser from './browser';
import * as temporaryDom from './temporaryDom';
import { withLoadedImage } from './withLoadedImage';

// Css rules that cannot be cut off.
// transform-origin is buggy in Chromiums.
const forcedStyles = /^transform-origin^/;

// Ignored styles. They won't add anything to render.
const ignoredStyles = /^(transition|cursor|animation|userSelect)/;

// Partial styles to skip while inlining for webkit browsers.
// For example, the value of borderTop is already contained in border.
// Adding it will just make the style longer.
// Firefox doesn't build the full style, so for the example above, only borderTop will be set.
const partialStyles = browser.engine !== 'webkit'
    ? /^(?=a)b/ // Dummy regex that fails on any string.
    : /^(background|outline|border|webkitBorder(Before|After|End|Start))[A-Z]/;

/**
 * Clone node hierarchy and inline all styles.
 */
export function inlineStyles(node: Node, stylesheet: StyleSheet): Promise<Node | null> {
    if (!node) {
        throw new Error(`inlineStyles: node must be not null`);
    }

    if (node.nodeType === Node.TEXT_NODE) {
        return Promise.resolve(document.createTextNode(node.textContent || ''));
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return Promise.resolve(null);
    }

    return inlineElementStyles(node as HTMLElement, stylesheet);
}

function inlineElementStyles(node: HTMLElement, stylesheet: StyleSheet): Promise<Node> {
    if (node.style.display === 'none') {
        return Promise.resolve(document.createComment(`<${node.tagName}> with display: none`));
    }

    const tagName = node.tagName.toLowerCase();
    const newTagName = /^(canvas|img)$/.test(tagName) ? 'div' : tagName;
    const newNode = document.createElement(newTagName);
    const desiredStyle = getComputedStyle(node);

    // getComputedStyle requires the node to be in the document.
    const tempDom = temporaryDom.append(newNode);

    // Create a copy of the default style, because CSSStyleDeclaration auto updates itself.
    const defaultStyle = clone(getComputedStyle(newNode));
    tempDom.dispose();

    const styles: string[] = [];
    for (const key in desiredStyle) {
        if (!desiredStyle.hasOwnProperty(key)) {
            continue;
        }

        // Skip JavaScript stuff.
        if (/^(\d+|length|cssText)$|-/.test(key)) {
            continue;
        }

        if (ignoredStyles.test(key) || partialStyles.test(key)) {
            continue;
        }

        let value = desiredStyle[key];
        const type = typeof value;

        // Skip more JavaScript stuff.
        if (type === 'function' || type === 'undefined' || value == null) {
            continue;
        }

        const forced = forcedStyles.test(key);

        // Skip styles that are already implicitly applied to the node.
        if (defaultStyle[key] === desiredStyle[key] && !forced) {
            continue;
        }

        // Skip empty styles.
        value = String(value);
        if (value === '' && !forced) {
            continue;
        }

        styles.push(cssOmKeyToCssKey(key) + ':' + value + ';');
    }

    // Try to save data from canvas.
    if (tagName === 'canvas') {
        try {
            const dataUrl = (node as HTMLCanvasElement).toDataURL();
            styles.push(`background-image: url("${dataUrl}");`);
        } catch (e) {
            // nop
        }
    }

    let done = Promise.resolve();

    // Try to save data from image.
    if (tagName === 'img') {
        styles.push('display: block;');
        done = loadImageAsDataUrl(node as HTMLImageElement)
            .then((dataUrl) => {
                if (dataUrl) {
                    styles.push(`background-image: url("${dataUrl}");`);
                }
            })
            .catch((e) => { /* ignore */ });
    }

    return done.then(() => {
        const className = node.getAttribute('class') || '';
        if (className) {
            newNode.setAttribute('data-carbonite-class', className);
        }

        // setAttribute('style', ...) triggers CSP warnings everywhere.
        // Setting CSSOM value directly makes XMLSerializer output them in style attribute.
        // This works in Chromiums, but Firefox fails to render foreignObject with style attributes.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1358106
        newNode.className = stylesheet.createClass(styles.join(''));

        // Create inlined versions of child nodes and append them.
        const childPromises = [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            childPromises.push(inlineStyles(child, stylesheet));
        }

        return Promise.all(childPromises)
            .then((children) => {
                for (const child of children) {
                    if (child) {
                        newNode.appendChild(child);
                    }
                }

                return newNode;
            });
    });
}

const hop = ({}).hasOwnProperty;
function clone(object: { [key: string]: any; }) {
    const result: { [key: string]: any; } = {};

    for (const key in object) {
        if (hop.call(object, key)) {
            result[key] = object[key];
        }
    }

    return result;
}

function getComputedStyle(e: HTMLElement) {
    return e.ownerDocument.defaultView.getComputedStyle(e);
}

function loadImageAsDataUrl(node: HTMLImageElement): Promise<string | null> {
    const { width, height, src } = node;
    if (!width || !height || !src) {
        return Promise.resolve(null);
    }

    return withLoadedImage(src, (img) => {
        // TODO: cache canvases
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        canvas.getContext('2d')!.drawImage(img, 0, 0);
        return canvas.toDataURL();
    });
}
