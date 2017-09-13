import * as browser from './browser';
import {Csp} from './csp';

export const URL = window.URL
    || (window as any).webkitURL
    || (window as any).mozURL
    || window;

export const isSupported = (csp: Csp) =>
    // IE doesn't support foreignObject.
    !browser.isIE
    // TODO: test on mobile browsers.
    && !browser.isMobile
    // No way to make Firefox load svg with styles inside into <img> if
    // we don't have 'nonce-...' in style-src.
    // TODO: maybe detect style-src 'unsafe-inline' somehow and then use
    // style attributes?
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1358106
    && !(browser.isFirefox && csp.enabled && !csp.styleNonce)
    && typeof XMLSerializer !== 'undefined';

export const isNonSvgSupported = (csp: Csp) =>
    isSupported(csp)
    // Safari and old versions of Opera have trouble rendering foreignObject.
    && !browser.isSafari
    && !browser.isOldOpera
    // Edge silently fails to drawImage SVG after onload.
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4411619/
    && !browser.isEdge;

export const areBlobsSupported = (csp: Csp) =>
    typeof Blob !== 'undefined'
    && URL.createObjectURL
    // Safari doesn't want to load SVG blobs with foreignObject inside.
    // Also, Safari can't render anything, so blobs are useless for a canvas too.
    && !browser.isSafari;
