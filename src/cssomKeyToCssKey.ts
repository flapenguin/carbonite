/**
 * Converts CSS Object Model key to CSS key.
 */
export function cssOmKeyToCssKey(cssomKey: string): string {
    if (cssomKey === 'cssFloat') {
        return 'float';
    }

    return cssomKey
        .replace(/([A-Z])/g, '-$&')
        .replace(/^(webkit|ms|moz)/, '-')
        .toLowerCase();
}
