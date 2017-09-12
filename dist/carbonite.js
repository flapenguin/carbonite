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
        node = inlineStyles_1.inlineStyles(node, stylesheet);
        var svg = htmlToSvg_1.htmlToSvg(node, stylesheet, options.size, csp);
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
    if (csp.enabled) {
        return 'data-url';
    }
    if (browser.isChromium) {
        return 'data-url';
    }
    return support_1.areBlobsSupported ? 'blob' : 'data-url';
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
    return !browser.isIE
        && !browser.isMobile
        && !(browser.isFirefox && csp.enabled && !csp.styleNonce)
        && typeof XMLSerializer !== 'undefined';
};
exports.isNonSvgSupported = function (csp) {
    return exports.isSupported(csp)
        && !browser.isSafari
        && !browser.isOldOpera
        && !browser.isEdge;
};
exports.areBlobsSupported = function (csp) {
    return window.Blob
        && exports.URL.createObjectURL
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
function inlineStyles(node, stylesheet) {
    // TODO
    return node;
}
exports.inlineStyles = inlineStyles;


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