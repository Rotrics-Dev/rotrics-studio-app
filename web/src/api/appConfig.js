const getBase = () => {
    return `${window.serverAddress}/app_config`;
};

const getAllConfig = async () => {
    return await fetch(`${getBase()}/get/all`, {
        method: 'GET'
    }).then(response => response.json());
};

const setOneConfig = async (key, value) => {
    return await fetch(`${getBase()}/set/one`, {
        method: 'POST',
        body: JSON.stringify({key, value})
    }).then(response => response.json());
};

export {
    getAllConfig,
    setOneConfig
};


