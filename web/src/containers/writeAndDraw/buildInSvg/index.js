export const getExampleSvgArray = () => {
    const exampleSvgArr = [];
    if (exampleSvgArr.length === 0) {
        for (let i = 1; i <= 48; i++) {
            const url = require(`./${i}.svg`);
            exampleSvgArr.push(url);
        }
    }
    return exampleSvgArr;
};

export const base64ToBlob = (uri) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (uri.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(uri.split(',')[1]);
    } else {
        byteString = unescape(uri.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = uri
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

    // write the bytes of the string to a typed array
    const uint8Array = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], {type: mimeString});
};
