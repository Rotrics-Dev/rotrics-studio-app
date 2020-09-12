import path from 'path';
import _ from 'lodash';
import socketClientManager from "../socket/socketClientManager";
import messageI18n from "../utils/messageI18n";
import {CODE_PROJECT_EXTENSION} from "../constants";
import {
    fetchMyProjectInfos,
    fetchExampleProjectInfos,
    fetchProjectContent,
    rename,
    del,
    save,
    saveAs
} from "../api/codeProject.js";

const ACTION_UPDATE_STATE = 'codeProject/ACTION_UPDATE_STATE';
const INITIAL_STATE = {
    isModalShow4new: false,
    isModalShow4saveAs: false,
    isModalShow4exampleProjects: false,
    isModalShow4myProjects: false,
    isModalShow4save: false,

    projectInfo: null, //{name, filePath, created, modified, location}, location: my/example/your-computer/create
    isSaved: false,
    myProjectInfos: [],
    exampleProjectInfos: []
};

const getFilename = (filePath) => {
    return path.basename(filePath, path.extname(filePath));
};

const isNameExist = (projectInfos, name) => {
    for (let i = 0; i < projectInfos.length; i++) {
        if (projectInfos[i].name === name) {
            return true;
        }
    }
    return false;
};

const getAvailableName = () => {
    const d = new Date(),
        year = d.getFullYear(),
        month = d.getMonth() + 1,
        day = d.getDate(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        second = d.getSeconds();
    return year + "-" +
        (month < 10 ? "0" + month : month) + "-" +
        (day < 10 ? "0" + day : day) + "-" +
        (hour < 10 ? "0" + hour : hour) + "-" +
        (minute < 10 ? "0" + minute : minute) + "-" +
        (second < 10 ? "0" + second : second);
};

const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", async () => {
            console.log("##connect")
            const {status: status4my, data: myProjectInfos} = await fetchMyProjectInfos();
            const {status: status4example, data: exampleProjectInfos} = await fetchExampleProjectInfos();
            dispatch(actions._updateState({myProjectInfos, exampleProjectInfos}));
            //无项目，则creat one
            if (!getState().codeProject.projectInfo) {
                dispatch(actions._updateState({
                    isSaved: true,
                    projectInfo: {
                        name: getAvailableName(),
                        filePath: null,
                        created: null,
                        modified: null,
                        location: 'create'
                    }
                }));
            }
        });
        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({
                myProjectInfos: [],
                exampleProjectInfos: []
            }));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    //open project located "my projects" and "example projects"
    openLocal: (newProjectInfo) => async (dispatch, getState) => {
        const {projectInfo, isSaved} = getState().codeProject;
        if (projectInfo.filePath === newProjectInfo.filePath) {
            messageI18n.success("already opened");
            return {type: null};
        }
        if (projectInfo.filePath !== newProjectInfo.filePath && !isSaved) {
            dispatch(actions.openModal4save());
        }
        if (projectInfo && projectInfo.filePath !== newProjectInfo.filePath && isSaved) {
            const {vm} = getState().code;
            const {status, data: content} = await fetchProjectContent(newProjectInfo);
            if (status === "ok") {
                vm.loadProject(content)
                    .then(() => {
                        messageI18n.success("open project success");
                        dispatch(actions._updateState({
                            projectInfo: newProjectInfo,
                            isSaved: true,
                            isModalShow4exampleProjects: false,
                            isModalShow4myProjects: false,
                        }));
                    })
                    .catch(error => {
                        messageI18n.error("open project failed");
                        return {type: null};
                    });
            } else {
                messageI18n.error("fetch project content failed");
                return {type: null};
            }
        }
    },
    // get file abs path, only available in electron:
    // https://github.com/electron/electron/blob/master/docs/api/file-object.md
    openFromYourComputer: (file) => async (dispatch, getState) => {
        const {projectInfo, isSaved} = getState().codeProject;
        if (projectInfo.filePath === file.path) {
            messageI18n.success("already opened");
            return {type: null};
        }
        if (projectInfo.filePath !== file.path && !isSaved) {
            dispatch(actions.openModal4save());
        }
        if (projectInfo.filePath !== file.path && isSaved) {
            const {vm} = getState().code;
            const content = await file.text();
            vm.loadProject(content)
                .then(() => {
                    messageI18n.success("open project success");
                    dispatch(actions._updateState({
                        projectInfo: {
                            name: getFilename(file.path),
                            filePath: file.path,
                            created: 0,
                            modified: 0,
                            location: "your-computer"
                        },
                        isSaved: true,
                        isModalShow4exampleProjects: false,
                        isModalShow4myProjects: false,
                    }));
                })
                .catch(error => {
                    messageI18n.error("open project failed");
                    return {type: null};
                });
        }
    },
    save: () => async (dispatch, getState) => {
        const {isSaved} = getState().codeProject;
        if (isSaved) {
            messageI18n.success("already saved");
            return {type: null};
        }
        const {vm} = getState().code;
        const content = vm.toJSON();
        const {projectInfo} = getState().codeProject;
        const {status} = await save(projectInfo, content);
        if (status === "ok") {
            if (projectInfo.location === "your-computer") {
                messageI18n.success(`save success to ${projectInfo.filePath}`);
            } else {
                messageI18n.success("save success");
            }
            const {status: status4example, data: exampleProjectInfos} = await fetchExampleProjectInfos();
            dispatch(actions._updateState({
                isSaved: true,
                isModalShow4save: true,
                exampleProjectInfos
            }));
        } else {
            messageI18n.error("save failed");
            dispatch(actions._updateState({
                isSaved: false,
                isModalShow4save: true
            }));
        }
    },
    saveAs: (name) => async (dispatch, getState) => {
        const {vm} = getState().code;
        const content = vm.toJSON();
        const extension = CODE_PROJECT_EXTENSION;
        const {status} = await saveAs(content, name, extension);
        if (status === "ok") {
            messageI18n.success("save as success");
        } else {
            messageI18n.error("save as failed");
        }
        return {type: null};
    },
    rename: (projectInfo, name) => async (dispatch, getState) => {
        name = name.trim();
        if (name.length === 0) {
            messageI18n.error("rename failed: name is empty");
            return {type: null};
        }

        const {location} = projectInfo;
        if (["create", "my"].includes(location) && isNameExist(getState().codeProject.myProjectInfos, name)) {
            messageI18n.error("rename failed: name is exist");
            return {type: null};
        }

        switch (location) {
            case "create":
                dispatch(actions._updateState({projectInfo: {...projectInfo, name}}));
                break;
            case "my": {
                const extension = CODE_PROJECT_EXTENSION;
                const {status} = await rename(projectInfo, name, extension);
                if (status === "ok") {
                    messageI18n.success("rename success");
                    dispatch(actions.fetchMyProjectInfos());
                    const curProjectInfo = getState().codeProject.projectInfo;
                    if (projectInfo.filePath === curProjectInfo.filePath) {
                        dispatch(actions._updateState({projectInfo: {...projectInfo, name}}));
                    }
                } else {
                    messageI18n.error("rename failed");
                }
                break;
            }
            case "your-computer": { //TODO: 测试
                const extension = CODE_PROJECT_EXTENSION;
                const {status} = await rename(projectInfo, name, extension);
                if (status === "ok") {
                    messageI18n.success("rename success");
                    const curProjectInfo = getState().codeProject.projectInfo;
                    if (projectInfo.filePath === curProjectInfo.filePath) {
                        dispatch(actions._updateState({projectInfo: {...projectInfo, name}}));
                    }
                } else {
                    messageI18n.error("rename your-computer failed");
                }
                break;
            }
        }
        return {type: null};
    },
    del: (projectInfo) => async (dispatch, getState) => {
        const {status} = await del(projectInfo);
        if (status === "ok") {
            messageI18n.success("delete success");
            dispatch(actions.fetchMyProjectInfos());
            const curProjectInfo = getState().codeProject.projectInfo;
            if (projectInfo.filePath === curProjectInfo.filePath) {
                dispatch(actions._updateState({
                    isSaved: false,
                    projectInfo: {
                        name: getAvailableName(),
                        filePath: null,
                        created: null,
                        modified: null,
                        location: 'create'
                    }
                }));
            }
        } else {
            messageI18n.error("delete failed");
        }
        return {type: null};
    },
    fetchMyProjectInfos: () => async (dispatch) => {
        const {status, data: myProjectInfos} = await fetchMyProjectInfos();
        dispatch(actions._updateState({myProjectInfos}));
    },
    openModal4new: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4new: true
        }));
    },
    openModal4saveAs: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4saveAs: true
        }));
    },
    openModal4exampleProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4exampleProjects: true
        }));
    },
    openModal4myProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4myProjects: true
        }));
    },
    openModal4save: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4save: true
        }));
    },
    closeModal4new: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4new: false
        }));
    },
    closeModal4saveAs: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4saveAs: false
        }));
    },
    closeModal4exampleProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4exampleProjects: false
        }));
    },
    closeModal4myProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4myProjects: false
        }));
    },
    closeModal4save: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4save: false
        }));
    },
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
};

export {actions};
export default reducer;
