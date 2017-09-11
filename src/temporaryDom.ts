const parent = () => document.body;

let container: HTMLElement|null = null;
let refCount = 0;

export function append(node: HTMLElement) {
    refCount++;
    if (!container) {
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-99999px';
        container.style.top = '-99999px';
        parent().appendChild(container);
    }

    container.appendChild(node);

    const savedContainer = container;
    let disposed = false;

    return {
        dispose() {
            if (disposed) {
                return;
            }

            disposed = true;
            savedContainer.removeChild(node);
            if (--refCount === 0) {
                savedContainer.parentElement!.removeChild(savedContainer);
                container = null;
            }
        }
    };
}
