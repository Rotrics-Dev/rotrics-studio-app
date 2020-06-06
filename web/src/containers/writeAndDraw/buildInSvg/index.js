let buildInSvgArray = [];
export const getBuildInSvgArray = () => {
    if (buildInSvgArray.length === 0) {
        for (let i = 1; i <= 48; i++) {
            let url = require(`./${i}.svg`);
            buildInSvgArray.push(url);
            console.log(url)
        }
    }
    return buildInSvgArray;
}

// base64 to blob
export const base64ToBlob = (uri) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (uri.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(uri.split(',')[1]);
    } else {
        byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = uri
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}