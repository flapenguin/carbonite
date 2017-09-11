import * as temporaryDom from './temporaryDom';

export function withLoadedImage(url: string, callback: (img: HTMLImageElement) => never): Promise<void> {
    const img = new Image();
    const tempDom = temporaryDom.append(img);

    const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
            const shortUrl = url.length <= 64 ? url : url.substr(0, 61) + '...';
            reject(new Error(`carbonite: failed to load image ${shortUrl}`));
        };

        img.src = url;
    });

    return loaded
        .then(() => callback(img))
        .then(
            () => { tempDom.dispose(); },
            error => {
                tempDom.dispose();
                return Promise.reject(error);
            });
}
