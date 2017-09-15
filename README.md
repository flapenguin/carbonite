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
/**
 * Renders element from document into image.
 */
function render(node: HTMLElement, options?: RenderOptions): Promise<Resource>;

interface RenderOptions {
    /** Desired type of rendered image. */
    type?: ResourceType;

    /** Desired mime type of rendered image. */
    mime?: string;

    /** Size of element. */
    size?: { width: number; height: number; };

    /** Content Security Policy options. */
    csp?: Csp;
}

/**
 * Type of the resource.
 */
type ResourceType = 'data-url' | 'blob';

/**
 * Resource with url that can be destroyed.
 */
interface Resource {
    /** Type of the resource. */
    readonly type: Type;

    /** Mime type of the resource. */
    readonly mime: string;

    /** Url of the resource. */
    readonly url: string;

    /** Destroys resource. */
    destroy(): void;
}

/**
 * Holds information about Content Security Policy on page.
 */
interface Csp {
    /** Whether CSP is enabled. */
    enabled: boolean;

    /** Nonce value for styles from 'style-src'. */
    styleNonce?: string | null;

    /** Whether blob: images are allowed (i.e. 'img-src' has 'blob:'). */
    imageBlob?: boolean;
}
```

## Developing

Carbonite is extracted from Maps API and should be written to allow simple integration back into it. Since Maps API still supports browsers like Internet Explorer 8 and Opera 12 and browsers with ES3 only there're some quirks you should follow:

- Library should not produce `SyntaxError`s during parsing in IE 8 and Opera 12
- Code using promises should be written in a way to be able to work with [vow 0.4.7](https://github.com/Ajaxy/vow/tree/57e1b832a69edbc15ee0e72907a45cb3389d48cc) promises
