import { StyleSheet } from './StyleSheet';
import { cssomKeyToCssKey } from './cssomKeyToCssKey';
import * as browser from './browser';
import * as temporaryDom from './temporaryDom';

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

export function inlineStyles(node: Node, stylesheet: StyleSheet): Node | null {
    if (!node) {
        throw new Error(`inlineStyles: node must be not null`);
    }

    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    return inlineElementStyles(node as HTMLElement, stylesheet);
}

function inlineElementStyles(node: HTMLElement, stylesheet: StyleSheet): Node {
    if (node.style.display === 'none') {
        return document.createComment(`<${node.tagName}> with display: none`);
    }

    const tagName = node.tagName.toLowerCase();
    if (tagName === 'img') {
        return document.createComment(`skipped ${node.outerHTML}`);
    }

    const newTagName = tagName === 'canvas' ? 'div' : 'canvas';
    const newNode = document.createElement(newTagName);
    const desiredStyle = getComputedStyle(node);

    // getComputedStyle requires the node to be in the document.
    const tempDom = temporaryDom.append(newNode);

    // Create a copy of the default style, because CSSStyleDeclaration auto updates itself.
    const defaultStyle = clone(getComputedStyle(newNode));
    tempDom.dispose();

    const styles = [];
    for (const key in desiredStyle) {
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

        styles.push(cssomKeyToCssKey(key) + ':' + value + ';');
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

    // setAttribute('style', ...) triggers CSP warnings everywhere.
    // Setting CSSOM value directly makes XMLSerializer output them in style attribute.
    // This works in Chromiums, but Firefox fails to render foreignObject with style attributes.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1358106
    newNode.className = stylesheet.createClass(styles.join(''));
    newNode.setAttribute('data-carbonite-class', node.getAttribute('class') || '');

    // Create inlined versions of child nodes and append them.
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        const newChild = inlineStyles(child, stylesheet);

        if (newChild) {
            newNode.appendChild(newChild);
        }
    }

    return newNode;
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
