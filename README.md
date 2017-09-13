# Carbonite

> Library for client-side HTML to PNG rendering.

Extracted from [Yandex.Maps API](https://tech.yandex.com/maps/mapsapi/).

## Usage

Carbonite is using UMD pattern, so you can use it with require.js or SystemJS, or any other module system which supports UMD.

```html
<script src="carbonite.min.js"></script>
<script>
    carbonite.render(document.querySelector('#to-render'))
        .then(resource => {
            imgElement.src = resource.url;
            console.log(resource.type, resource.mime);

            // resource.destroy()
        })
        .catch(err => console.error(err));
</script>
```

## Documentation

```typescript
function render(node: HTMLElement, options?: IRenderOptions): Promise<IResource>;

interface IRenderOptions {
    type?: Type;
    mime?: string;
    size?: { width: number; height: number; };
    csp?: ICsp;
}

interface IResource {
    readonly type: 'data-url' | 'blob';
    readonly mime: string;
    readonly url: string;

    destroy(): void;
}
```
