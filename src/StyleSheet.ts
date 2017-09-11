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
    private styles: string[] = [];
    private counter: number = 0;

    public createClass(rules: {[key: string]: string} | string): string {
        const className = 'x' + this.counter++;

        const style = typeof rules === 'string' ? rules : joinRules(rules);
        this.styles.push(`.${className} { ${style} }`);

        return className;
    }

    public combine(): string {
        return this.styles.join('');
    }
}
