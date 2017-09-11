const ua = navigator.userAgent;

export const isChromium = /(Chromium|Chrome|Ya(ndex)?Browser)\//.test(ua);

export const isSafari = /Safari\//.test(ua);

export const isGecko = /(Firefox|Fennec|Gecko)\//.test(ua);

export const isIE = /MSIE/.test(ua);

// TODO
export const isOldOpera = false;

// TODO
export const isEdge = false;

// TODO
export const isMobile = false;
