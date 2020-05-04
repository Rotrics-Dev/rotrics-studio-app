//fetch doc: https://developer.mozilla.org/zh-CN/docs/Web/API/Response

//error交给调用者处理
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:3002/uploadFile', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587458545878.jpg"}
    return response;
};

/**
 * 上传图片文件，返回url, width, height
 * 支持png, jpg, svg
 * error抛出，交给调用者处理
 * @param file
 * @returns {Promise<any>}
 */
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:3002/uploadImage', {
        method: 'POST',
        body: formData
    }).then(response => response.json());
    //response: {url: "http://localhost:3002/1587459128571.jpg", width: 500, height: 575}
    return response;
};

export {uploadFile, uploadImage}


