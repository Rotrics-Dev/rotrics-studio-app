import path from 'path';
import {actions as codeActions} from "./code";
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
    isModalShow4exampleProjects: false,
    isModalShow4myProjects: false,
    // {name, filePath, created, modified, location, isSaved}
    // location: my/example/pc/null(null表示是new project)
    // isSaved: 是否已经保存，即是否workspace和文件存储一致
    projectInfo: null,
    myProjectInfos: [],
    exampleProjectInfos: []
};

const getFilename = (filePath) => {
    return path.basename(filePath, path.extname(filePath));
};

const isProjectNameExist = (projectInfos, name) => {
    for (let i = 0; i < projectInfos.length; i++) {
        if (projectInfos[i].name === name) {
            return true;
        }
    }
    return false;
};

const getProjectInfoByName = (projectInfos, name) => {
    for (let i = 0; i < projectInfos.length; i++) {
        if (projectInfos[i].name === name) {
            return projectInfos[i];
        }
    }
    return null
};

const getAvailableName = (myProjectInfos) => {
    let name = "new-1";
    for (let i = 0; i < myProjectInfos.length; i++) {
        if (isProjectNameExist(myProjectInfos, name)) {
            name = `new-${i + 1}`;
        } else {
            return name;
        }
    }
    name = `new-${myProjectInfos.length + 1}`;
    return name;
};

const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", async () => {
            const {status: status4my, data: myProjectInfos} = await fetchMyProjectInfos();
            const {status: status4example, data: exampleProjectInfos} = await fetchExampleProjectInfos();
            dispatch(actions._updateState({myProjectInfos, exampleProjectInfos}));
            //无项目，则creat one
            if (!getState().codeProject.projectInfo) {
                dispatch(actions._updateState({
                    projectInfo: {
                        name: getAvailableName(myProjectInfos),
                        filePath: null,
                        created: null,
                        modified: null,
                        location: null,
                        isSaved: false
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
    create: () => async (dispatch, getState) => {
        dispatch(codeActions.loadEmptyProject());
        const {myProjectInfos} = getState().codeProject;
        dispatch(actions._updateState({
            projectInfo: {
                name: getAvailableName(myProjectInfos),
                filePath: null,
                created: null,
                modified: null,
                location: null,
                isSaved: false
            }
        }));
    },
    //open project located "my projects" and "example projects"
    openLocal: (projectInfo) => async (dispatch, getState) => {
        const {vm} = getState().code;
        const {status, data: content} = await fetchProjectContent(projectInfo);
        if (status === "ok") {
            vm.loadProject(content)
                .then(() => {
                    messageI18n.success("Open project success.");
                    dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: true},}));
                    dispatch(actions.closeModal4exampleProjects());
                    dispatch(actions.closeModal4myProjects());
                })
                .catch(error => {
                    messageI18n.error("Can not parse the project.");
                    return {type: null};
                });
        } else {
            messageI18n.error("Fetch project content failed");
            return {type: null};
        }

    },
    // get file abs path, only available in electron:
    // https://github.com/electron/electron/blob/master/docs/api/file-object.md
    openFromYourComputer: (file) => async (dispatch, getState) => {
        const {vm} = getState().code;
        const content = await file.text();
        vm.loadProject(content)
            .then(() => {
                messageI18n.success("Open project success.");
                dispatch(actions._updateState({
                    projectInfo: {
                        name: getFilename(file.path),
                        filePath: file.path,
                        created: 0,
                        modified: 0,
                        location: "pc",
                        isSaved: true,
                    }
                }));
            })
            .catch(error => {
                messageI18n.error("Can not parse the project.");
                return {type: null};
            });
    },
    save: () => async (dispatch, getState) => {
        const {projectInfo} = getState().codeProject;
        if (projectInfo.isSaved) {
            messageI18n.success("Already saved.");
            return {type: null};
        }
        const {vm} = getState().code;
        const content = vm.toJSON();
        const extension = CODE_PROJECT_EXTENSION;
        const {status} = await save(projectInfo, content, extension);
        if (status === "ok") {




            

            switch (projectInfo.location) {
                case null:
                    //save new project to my
                    dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: true, location: "my"}}));
                    return {type: null};
                case "pc":
                    messageI18n.success(`Save success to ${projectInfo.filePath}`);
                    dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: true}}));
                    return {type: null};
                case "my":
                    messageI18n.success("Save success");
                    dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: true}}));
                    return {type: null};
            }
        } else {
            messageI18n.error("Save failed");
            dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: false}}));
        }
    },
    saveAs: (name) => async (dispatch, getState) => {
        const {vm} = getState().code;
        const content = vm.toJSON();
        const extension = CODE_PROJECT_EXTENSION;
        const {status} = await saveAs(content, name, extension);
        if (status === "ok") {
            messageI18n.success("Save as success");
            const {status, data: myProjectInfos} = await fetchMyProjectInfos();
            const projectInfo = getProjectInfoByName(myProjectInfos, name)
            dispatch(actions._updateState({projectInfo, myProjectInfos}));
        } else {
            messageI18n.error("Save as failed");
        }
        return {type: null};
    },
    rename: (projectInfo, name) => async (dispatch, getState) => {
        name = name.trim();
        if (name.length === 0) {
            messageI18n.error("Name is empty");
            return {type: null};
        }
        const {location} = projectInfo;
        switch (location) {
            case null:
                dispatch(actions._updateState({projectInfo: {...projectInfo, name}}));
                return {type: null};
            case "example":
                messageI18n.error("Example project can not be renamed.");
                return {type: null};
            case "pc":
                messageI18n.error("The project from your computer can not be renamed.");
                return {type: null};
            case "my":
                if (isProjectNameExist(getState().codeProject.myProjectInfos, name)) {
                    messageI18n.error("Name already occupied");
                } else {
                    const extension = CODE_PROJECT_EXTENSION;
                    const {status} = await rename(projectInfo, name, extension);
                    if (status === "ok") {
                        messageI18n.success("Rename success");
                        dispatch(actions.updateMyProjectInfos());
                        const curProjectInfo = getState().codeProject.projectInfo;
                        if (projectInfo.filePath === curProjectInfo.filePath) {
                            dispatch(actions._updateState({projectInfo: {...projectInfo, name}}));
                        }
                    } else {
                        messageI18n.error("Rename failed");
                    }
                }
                return {type: null};
        }
        return {type: null};
    },
    del: (projectInfo) => async (dispatch, getState) => {
        const {status} = await del(projectInfo);
        if (status === "ok") {
            messageI18n.success("Delete success");
            dispatch(actions.updateMyProjectInfos());
            const {projectInfo: curProjectInfo, myProjectInfos} = getState().codeProject;
            if (projectInfo.filePath === curProjectInfo.filePath) {
                dispatch(actions._updateState({
                    projectInfo: {
                        name: getAvailableName(myProjectInfos),
                        filePath: null,
                        created: null,
                        modified: null,
                        location: null,
                        isSaved: false
                    }
                }));
            }
        } else {
            messageI18n.error("Delete failed");
        }
        return {type: null};
    },
    updateMyProjectInfos: () => async (dispatch) => {
        const {status, data: myProjectInfos} = await fetchMyProjectInfos();
        dispatch(actions._updateState({myProjectInfos}));
    },
    // only called by redux.code
    onProjectChanged: () => (dispatch, getState) => {
        const {projectInfo} = getState().codeProject;
        dispatch(actions._updateState({projectInfo: {...projectInfo, isSaved: false}}));
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
    closeModal4exampleProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4exampleProjects: false
        }));
    },
    closeModal4myProjects: () => (dispatch) => {
        dispatch(actions._updateState({
            isModalShow4myProjects: false
        }));
    }
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

export {actions, isProjectNameExist};
export default reducer;
