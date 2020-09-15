import messageI18n from "../../../utils/messageI18n";

const PROJECT_ALREADY_OPENED = 'PROJECT_ALREADY_OPENED';
const PROJECT_ALREADY_SAVED = 'PROJECT_ALREADY_SAVED';

const PROJECT_MODIFIED_EXAMPLE = 'PROJECT_MODIFIED_EXAMPLE';
const PROJECT_MODIFIED_OTHERS = 'PROJECT_MODIFIED_OTHERS';

// check the opened project is saved?
const _checkIsSaved = (projectInfo) => {
    const {location, isSaved} = projectInfo;
    if (isSaved) {
        return {approved: true};
    } else {
        if (location === "example") {
            return {approved: false, reason: PROJECT_MODIFIED_EXAMPLE};
        } else {
            return {approved: false, reason: PROJECT_MODIFIED_OTHERS};
        }
    }
};

const _checkIsOpened4local = (projectInfoOpened, projectInfoTarget) => {
    if (projectInfoOpened.filePath === projectInfoTarget.filePath) {
        return {approved: false, reason: PROJECT_ALREADY_OPENED};
    } else {
        return {approved: true};
    }
};

const _checkIsOpened4pc = (projectInfoOpened, file) => {
    if (projectInfoOpened.filePath === file.path) {
        return {approved: false, reason: PROJECT_ALREADY_OPENED};
    } else {
        return {approved: true};
    }
};

const checkCreate = (projectInfo) => {
    return _checkIsSaved();
};

const checkOpenLocal = (projectInfoOpened, projectInfoTarget) => {
    const result = _checkIsOpened4local(projectInfoOpened, projectInfoTarget);
    if (result.approved) {
        return _checkIsSaved(projectInfoOpened);
    } else {
        return result
    }
};

const checkOpenFromPc = (projectInfoOpened, file) => {
    const result = _checkIsOpened4pc(projectInfoOpened, file);
    if (result.approved) {
        return _checkIsSaved(projectInfoOpened);
    } else {
        return result
    }
};

const checkSave = (projectInfo) => {
    const {location, isSaved} = projectInfo;
    if (isSaved) {
        return {approved: false, reason: PROJECT_MODIFIED_EXAMPLE}
    } else {
        if (location === "example") {
            return {approved: false, reason: PROJECT_MODIFIED_EXAMPLE};
        } else {
            return {approved: false, reason: PROJECT_MODIFIED_OTHERS};
        }
    }

};

export {checkCreate};

