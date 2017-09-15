import {convertCssOmKeyToCssKey} from './cssomKeyToCssKey';

function joinRules(rules: Record<string, string>): string {
    return Object.keys(rules)
        .map((rule) => `${convertCssOmKeyToCssKey(rule)}: ${rules[rule]};`)
        .join('');
}

/**
 * Append-only CSS style sheet.
 */
export class StyleSheet {
    private _styles: string[] = [];
    private _counter: number = 0;

    /**
     * Creates class with passed rules and returns its name.
     */
    createClass(rules: Record<string, string> | string): string {
        const className = 'x' + this._counter++;

        const style = typeof rules === 'string' ? rules : joinRules(rules);
        this._styles.push(`.${className} { ${style} }`);

        return className;
    }

    /**
     * Combines all created classes into one css string.
     */
    combine(): string {
        return this._styles.join('');
    }
}
