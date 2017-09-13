import { cssomKeyToCssKey } from './cssomKeyToCssKey';

function joinRules(rules: {[key: string]: string}): string {
    const parts = [];

    // tslint:disable-next-line:forin
    for (const key in rules) {
        parts.push(`${cssomKeyToCssKey(key)}: ${rules[key]};`);
    }

    return parts.join('');
}

export class StyleSheet {
    private _styles: string[] = [];
    private _counter: number = 0;

    createClass(rules: {[key: string]: string} | string): string {
        const className = 'x' + this._counter++;

        const style = typeof rules === 'string' ? rules : joinRules(rules);
        this._styles.push(`.${className} { ${style} }`);

        return className;
    }

    combine(): string {
        return this._styles.join('');
    }
}
