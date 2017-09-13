/**
 * Encodes string as base64.
 */
export function encode(str: string): string {
    // Since DOMStrings are 16-bit-encoded strings, in most browsers
    // calling window.btoa on a Unicode string will cause
    // a Character Out Of Range exception if a character exceeds
    // the range of a 8-bit byte (0x00~0xFF).
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem

    str = encodeURIComponent(str)
        .replace(/%([0-9A-F]{2})/g, (_, byte) => String.fromCharCode(parseInt(byte, 16)));

    return btoa(str);
}
