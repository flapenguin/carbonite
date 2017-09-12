const ua = navigator.userAgent;

export const engine = /WebKit\//.test(ua) ? 'webkit' :
    /Gecko\//.test(ua) ? 'gecko' :
    /Opera\//.test(ua) ? 'presto' :
    /Trident\//.test(ua) ? 'trident' :
    'unknown';

export const isChromium = /(Chromium|Chrome|Ya(ndex)?Browser)\//.test(ua);

export const isSafari = /Safari\//.test(ua) && !isChromium;

export const isFirefox = /(Firefox|Fennec|Gecko)\//.test(ua);

export const isIE = /MSIE/.test(ua);

export const isEdge = /Edge/.test(ua);

export const isOldOpera = /Opera[/ ]/.test(ua)
    && !isChromium
    && extractVersion(/(?:Version|Opera[/ ])\/([0-9][0-9\.]*)/) <= 12;

// In summary, we recommend looking for the string “Mobi”
// anywhere in the User Agent to detect a mobile device.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
export const isMobile = /Mobi/.test(ua);

function extractVersion(regex: RegExp) {
    const match = ua.match(regex);
    return match ? parseInt(match[1], 10) : 0;
}
