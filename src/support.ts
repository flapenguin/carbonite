import * as browser from './browser';
import { ICsp } from './csp';

export const URL = window.URL
    || (window as any).webkitURL
    || (window as any).mozURL
    || window;

export const isSupported = (csp: ICsp) =>
    !browser.isIE
    && !browser.isMobile
    && !(browser.isFirefox && csp.enabled && !csp.styleNonce)
    && typeof XMLSerializer !== 'undefined';

export const isNonSvgSupported = (csp: ICsp) =>
    isSupported(csp)
    && !browser.isSafari
    && !browser.isOldOpera
    && !browser.isEdge;

export const areBlobsSupported =
    window.Blob
    && URL.createObjectURL
    && !browser.isSafari;
