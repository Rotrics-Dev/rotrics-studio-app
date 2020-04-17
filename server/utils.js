const getImageSize = (imagePath) => {
    const sizeOf = require('image-size');
    const dimensions = sizeOf(imagePath);
    return {
        width: dimensions.width,
        height: dimensions.height
    }
};

const getUniqueFilename = (filename) => {
    const path = require('path');
    return Date.now() + path.extname(filename);
};

module.exports = {getImageSize, getUniqueFilename};
