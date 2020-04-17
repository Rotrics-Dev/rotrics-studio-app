import noop from 'lodash/noop';

const uploadFile = (file, onSuccess = noop, onError = noop) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:3002/uploadFile', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .catch(error => onError(error))
        .then(response => onSuccess(response))
};


const uploadImage = (file, onSuccess = noop, onError = noop) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:3002/uploadImage', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .catch(error => onError(error))
        .then(response => onSuccess(response))
};

export {uploadFile, uploadImage}


