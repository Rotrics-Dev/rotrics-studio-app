import fs from 'fs';

const checkFileExist = (path) => {
    try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch (err) {
        return false;
    }
}

export {checkFileExist};