let container: HTMLElement|null = null;
let refCount = 0;

/**
 * Temporarily appends node to DOM.
 */
export function append(node: HTMLElement): { dispose(): void; } {
    refCount++;
    if (!container) {
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-99999px';
        container.style.top = '-99999px';
        document.body.appendChild(container);
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
