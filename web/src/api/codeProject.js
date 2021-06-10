const getBase = () => {
    return `${window.serverAddress}/code/project`;
};

const fetchMyProjectInfos = async () => {
    return await fetch(`${getBase()}/fetch/infos/my`, {
        method: 'GET'
    }).then(response => response.json());
};

const fetchExampleProjectInfos = async () => {
    return await fetch(`${getBase()}/fetch/infos/example`, {
        method: 'GET'
    }).then(response => response.json());
};

const fetchProjectContent = async (projectInfo) => {
    return await fetch(`${getBase()}/fetch/content`, {
        method: 'POST',
        body: JSON.stringify({projectInfo})
    }).then(response => response.json());
};

const rename = async (projectInfo, name, extension) => {
    return await fetch(`${getBase()}/rename`, {
        method: 'POST',
        body: JSON.stringify({projectInfo, name, extension})
    }).then(response => response.json());
};

const del = async (projectInfo) => {
    return await fetch(`${getBase()}/delete`, {
        method: 'POST',
        body: JSON.stringify({projectInfo})
    }).then(response => response.json());
};

const save = async (projectInfo, content, extension) => {
    return await fetch(`${getBase()}/save`, {
        method: 'POST',
        body: JSON.stringify({projectInfo, content, extension})
    }).then(response => response.json());
};

const saveAs = async (content, name, extension) => {
    return await fetch(`${getBase()}/save-as`, {
        method: 'POST',
        body: JSON.stringify({content, name, extension})
    }).then(response => response.json());
};

export {
    fetchMyProjectInfos,
    fetchExampleProjectInfos,
    fetchProjectContent,
    rename,
    del,
    save,
    saveAs
};


