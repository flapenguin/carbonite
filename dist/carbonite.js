var carbonite =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var ua = navigator.userAgent;
exports.engine = /WebKit\//.test(ua) ? 'webkit' :
    /Gecko\//.test(ua) ? 'gecko' :
        /Opera\//.test(ua) ? 'presto' :
            /Trident\//.test(ua) ? 'trident' :
                'unknown';
exports.isChromium = /(Chromium|Chrome|Ya(ndex)?Browser)\//.test(ua);
exports.isSafari = /Safari\//.test(ua) && !exports.isChromium;
exports.isFirefox = /(Firefox|Fennec|Gecko)\//.test(ua);
exports.isIE = /MSIE/.test(ua);
exports.isEdge = /Edge/.test(ua);
exports.isOldOpera = /Opera[/ ]/.test(ua)
    && !exports.isChromium
    && extractVersion(/(?:Version|Opera[/ ])\/([0-9][0-9\.]*)/) <= 12;
// In summary, we recommend looking for the string “Mobi”
// anywhere in the User Agent to detect a mobile device.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
exports.isMobile = /Mobi/.test(ua);
function extractVersion(regex) {
    var match = ua.match(regex);
    return match ? parseInt(match[1], 10) : 0;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var Resource_1 = __webpack_require__(2);
var inlineStyles_1 = __webpack_require__(5);
var withLoadedImage_1 = __webpack_require__(6);
var StyleSheet_1 = __webpack_require__(8);
var htmlToSvg_1 = __webpack_require__(10);
var support_1 = __webpack_require__(3);
function render(node, options) {
    var csp = options.csp || { enabled: false };
    var nonSvgSupported = support_1.isNonSvgSupported(csp);
    var type = options.type || Resource_1.defaultType;
    var mime = options.mime || (nonSvgSupported ? 'image/png' : 'image/svg+xml');
    if (!support_1.isSupported(csp)) {
        return Promise.reject(new Error("carbonite: render is not supported"));
    }
    if (type === 'blob' && !support_1.areBlobsSupported(csp)) {
        return Promise.reject(new Error("carbonite: blobs are not supported"));
    }
    if (mime !== 'image/svg+xml' && !nonSvgSupported) {
        return Promise.reject(new Error("carbonite: only 'image/svg+xml' mime is supported"));
    }
    if (!document.body.contains(node)) {
        return Promise.reject(new Error("carbonite: node must be in document"));
    }
    try {
        var stylesheet = new StyleSheet_1.StyleSheet();
        var inlined = inlineStyles_1.inlineStyles(node, stylesheet);
        var svg = htmlToSvg_1.htmlToSvg(inlined, stylesheet, options.size, csp);
        if (options.mime === 'image/svg+xml') {
            return Promise.resolve(Resource_1.fromString(svg, options.mime, options.type));
        }
        var svgResource_1 = Resource_1.fromString(svg, 'image/svg+xml', Resource_1.getResourceTypeForForeignObjectSvg(csp));
        var canvas_1 = document.createElement('canvas');
        var ctx_1 = canvas_1.getContext('2d');
        canvas_1.width = options.size.width;
        canvas_1.height = options.size.height;
        return withLoadedImage_1.withLoadedImage(svgResource_1.url, function (img) { return ctx_1.drawImage(img, 0, 0); })
            .then(function () {
            svgResource_1.destroy();
            return Resource_1.fromCanvas(canvas_1, mime, type);
        });
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.render = render;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var support_1 = __webpack_require__(3);
var base64 = __webpack_require__(4);
var browser = __webpack_require__(0);
exports.defaultType = 'blob';
function fromDataUrl(url) {
    return {
        type: 'data-url',
        mime: (url.match(/^data:(.*?);/) || ['', ''])[1],
        url: url,
        destroy: function () { }
    };
}
exports.fromDataUrl = fromDataUrl;
function fromBlob(blob) {
    var url = support_1.URL.createObjectURL(blob);
    return {
        type: 'blob',
        mime: (blob.type.match(/^([^/]*\/[^;]*)/) || ['', ''])[1],
        url: url,
        destroy: function () {
            support_1.URL.revokeObjectURL(url);
        }
    };
}
exports.fromBlob = fromBlob;
function fromString(str, mime, type) {
    type = type || exports.defaultType;
    if (type === 'blob') {
        return fromBlob(new Blob([str], { type: mime + ";charset=utf-8" }));
    }
    if (type === 'data-url') {
        var dataUrl = "data:" + mime + ";base64," + base64.encode(str);
        return fromDataUrl(dataUrl);
    }
    throw new Error("carbonite: bad resource type, expected 'blob' or 'data-uri', got " + type);
}
exports.fromString = fromString;
function fromCanvas(canvas, mime, type) {
    type = type || exports.defaultType;
    try {
        if (type === 'data-url') {
            return Promise.resolve(fromDataUrl(canvas.toDataURL()));
        }
        if (type === 'blob') {
            return new Promise(function (resolve, reject) {
                canvas.toBlob(function (blob) {
                    if (blob) {
                        resolve(fromBlob(blob));
                    }
                    else {
                        reject(new Error('carbonite: cannot render canvas'));
                    }
                });
            });
        }
    }
    catch (e) {
        return Promise.reject(e);
    }
    return Promise.reject(null);
}
exports.fromCanvas = fromCanvas;
function getResourceTypeForForeignObjectSvg(csp) {
    // We require data: in image-src, but not blob:.
    if (csp.enabled && !csp.imageBlob) {
        return 'data-url';
    }
    // Chromiums taint canvas after rendering blobs with <foreignObject>. Data URI is fine though.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=294129
    if (browser.isChromium) {
        return 'data-url';
    }
    return support_1.areBlobsSupported(csp) ? 'blob' : 'data-url';
}
exports.getResourceTypeForForeignObjectSvg = getResourceTypeForForeignObjectSvg;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var browser = __webpack_require__(0);
exports.URL = window.URL
    || window.webkitURL
    || window.mozURL
    || window;
exports.isSupported = function (csp) {
    // IE doesn't support foreignObject.
    return !browser.isIE
        // TODO: test on mobile browsers.
        && !browser.isMobile
        // No way to make Firefox load svg with styles inside into <img> if
        // we don't have 'nonce-...' in style-src.
        // TODO: maybe detect style-src 'unsafe-inline' somehow and then use
        // style attributes?
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1358106
        && !(browser.isFirefox && csp.enabled && !csp.styleNonce)
        && typeof XMLSerializer !== 'undefined';
};
exports.isNonSvgSupported = function (csp) {
    return exports.isSupported(csp)
        // Safari and old versions of Opera have trouble rendering foreignObject.
        && !browser.isSafari
        && !browser.isOldOpera
        // Edge silently fails to drawImage SVG after onload.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4411619/
        && !browser.isEdge;
};
exports.areBlobsSupported = function (csp) {
    return typeof Blob !== 'undefined'
        && exports.URL.createObjectURL
        // Safari doesn't want to load SVG blobs with foreignObject inside.
        // Also, Safari can't render anything, so blobs are useless for a canvas too.
        && !browser.isSafari;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
function encode(str) {
    // Since DOMStrings are 16-bit-encoded strings, in most browsers
    // calling window.btoa on a Unicode string will cause
    // a Character Out Of Range exception if a character exceeds
    // the range of a 8-bit byte (0x00~0xFF).
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    str = encodeURIComponent(str)
        .replace(/%([0-9A-F]{2})/g, function (_, byte) { return String.fromCharCode(parseInt(byte, 16)); });
    return btoa(str);
}
exports.encode = encode;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var cssomKeyToCssKey_1 = __webpack_require__(9);
var browser = __webpack_require__(0);
var temporaryDom = __webpack_require__(7);
// Css rules that cannot be cut off.
// transform-origin is buggy in Chromiums.
var forcedStyles = /^transform-origin^/;
// Ignored styles. They won't add anything to render.
var ignoredStyles = /^(transition|cursor|animation|userSelect)/;
// Partial styles to skip while inlining for webkit browsers.
// For example, the value of borderTop is already contained in border.
// Adding it will just make the style longer.
// Firefox doesn't build the full style, so for the example above, only borderTop will be set.
var partialStyles = browser.engine !== 'webkit'
    ? /^(?=a)b/ // Dummy regex that fails on any string.
    : /^(background|outline|border|webkitBorder(Before|After|End|Start))[A-Z]/;
function inlineStyles(node, stylesheet) {
    if (!node) {
        throw new Error("inlineStyles: node must be not null");
    }
    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    return inlineElementStyles(node, stylesheet);
}
exports.inlineStyles = inlineStyles;
function inlineElementStyles(node, stylesheet) {
    if (node.style.display === 'none') {
        return document.createComment("<" + node.tagName + "> with display: none");
    }
    var tagName = node.tagName.toLowerCase();
    if (tagName === 'img') {
        return document.createComment("skipped " + node.outerHTML);
    }
    var newTagName = tagName === 'canvas' ? 'div' : 'canvas';
    var newNode = document.createElement(newTagName);
    var desiredStyle = getComputedStyle(node);
    // getComputedStyle requires the node to be in the document.
    var tempDom = temporaryDom.append(newNode);
    // Create a copy of the default style, because CSSStyleDeclaration auto updates itself.
    var defaultStyle = clone(getComputedStyle(newNode));
    tempDom.dispose();
    var styles = [];
    for (var key in desiredStyle) {
        // Skip JavaScript stuff.
        if (/^(\d+|length|cssText)$|-/.test(key)) {
            continue;
        }
        if (ignoredStyles.test(key) || partialStyles.test(key)) {
            continue;
        }
        var value = desiredStyle[key];
        var type = typeof value;
        // Skip more JavaScript stuff.
        if (type === 'function' || type === 'undefined' || value == null) {
            continue;
        }
        var forced = forcedStyles.test(key);
        // Skip styles that are already implicitly applied to the node.
        if (defaultStyle[key] === desiredStyle[key] && !forced) {
            continue;
        }
        // Skip empty styles.
        value = String(value);
        if (value === '' && !forced) {
            continue;
        }
        styles.push(cssomKeyToCssKey_1.cssomKeyToCssKey(key) + ':' + value + ';');
    }
    // Try to save data from canvas.
    if (tagName === 'canvas') {
        try {
            var dataUrl = node.toDataURL();
            styles.push("background-image: url(\"" + dataUrl + "\");");
        }
        catch (e) {
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
    for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        var newChild = inlineStyles(child, stylesheet);
        if (newChild) {
            newNode.appendChild(newChild);
        }
    }
    return newNode;
}
var hop = ({}).hasOwnProperty;
function clone(object) {
    var result = {};
    for (var key in object) {
        if (hop.call(object, key)) {
            result[key] = object[key];
        }
    }
    return result;
}
function getComputedStyle(e) {
    return e.ownerDocument.defaultView.getComputedStyle(e);
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var temporaryDom = __webpack_require__(7);
function withLoadedImage(url, callback) {
    var img = new Image();
    var tempDom = temporaryDom.append(img);
    var loaded = new Promise(function (resolve, reject) {
        img.onload = function () { return resolve(); };
        img.onerror = function () {
            var shortUrl = url.length <= 64 ? url : url.substr(0, 61) + '...';
            reject(new Error("carbonite: failed to load image " + shortUrl));
        };
        img.src = url;
    });
    return loaded
        .then(function () { return callback(img); })
        .then(function () { tempDom.dispose(); }, function (error) {
        tempDom.dispose();
        return Promise.reject(error);
    });
}
exports.withLoadedImage = withLoadedImage;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var parent = function () { return document.body; };
var container = null;
var refCount = 0;
function append(node) {
    refCount++;
    if (!container) {
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-99999px';
        container.style.top = '-99999px';
        parent().appendChild(container);
    }
    container.appendChild(node);
    var savedContainer = container;
    var disposed = false;
    return {
        dispose: function () {
            if (disposed) {
                return;
            }
            disposed = true;
            savedContainer.removeChild(node);
            if (--refCount === 0) {
                savedContainer.parentElement.removeChild(savedContainer);
                container = null;
            }
        }
    };
}
exports.append = append;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var cssomKeyToCssKey_1 = __webpack_require__(9);
function joinRules(rules) {
    var parts = [];
    // tslint:disable-next-line:forin
    for (var key in rules) {
        parts.push(cssomKeyToCssKey_1.cssomKeyToCssKey(key) + ": " + rules[key] + ";");
    }
    return parts.join('');
}
var StyleSheet = /** @class */ (function () {
    function StyleSheet() {
        this.styles = [];
        this.counter = 0;
    }
    StyleSheet.prototype.createClass = function (rules) {
        var className = 'x' + this.counter++;
        var style = typeof rules === 'string' ? rules : joinRules(rules);
        this.styles.push("." + className + " { " + style + " }");
        return className;
    };
    StyleSheet.prototype.combine = function () {
        return this.styles.join('');
    };
    return StyleSheet;
}());
exports.StyleSheet = StyleSheet;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
function cssomKeyToCssKey(cssomKey) {
    if (cssomKey === 'cssFloat') {
        return 'float';
    }
    return cssomKey
        .replace(/([A-Z])/g, '-$&')
        .replace(/^(webkit|ms|moz)/, '-')
        .toLowerCase();
}
exports.cssomKeyToCssKey = cssomKeyToCssKey;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
function htmlToSvg(node, stylesheet, size, csp) {
    var html = new XMLSerializer().serializeToString(node);
    var rootStyle = stylesheet.createClass('position: relative;');
    return "\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + size.width + "\" height=\"" + size.height + "\">\n        <foreignObject width=\"100%\" height=\"100%\">\n            <div xmlns=\"http://www.w3.org/1999/xhtml\">\n                <style " + (csp.enabled ? "nonce=\"" + csp.styleNonce + "\"" : '') + ">\n                    " + stylesheet.combine() + "\n                </style>\n                <div class=\"" + rootStyle + "\">\n                    " + html + "\n                </div>\n            </div>\n        </foreignObject>\n        </svg>\n    ";
}
exports.htmlToSvg = htmlToSvg;


/***/ })
/******/ ]);