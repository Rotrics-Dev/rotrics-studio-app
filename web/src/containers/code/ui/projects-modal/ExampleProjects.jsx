import React from 'react';
import {Button, Row, Col, Modal} from 'antd';
import {actions as codeProjectActions, isProjectNameExist, compareProject} from "../../../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import showSaveConfirm from "../modal-tool/showSaveConfirm.jsx";
import showNameInput from "../modal-tool/showNameInput.jsx";
import messageI18n from "../../../../utils/messageI18n";
import styles from './styles.css';

class Index extends React.Component {
    state = {
        selected: null //selected project info
    };

    actions = {
        selectProject: (projectInfo) => {
            this.setState({selected: projectInfo})
        },
        closeModal: () => {
            this.setState({selected: null});
            this.props.closeModal4exampleProjects();
        },
        openProject: (projectInfo) => {
            if (compareProject(projectInfo, this.props.projectInfo)) {
                messageI18n.warning("The project already opened");
                return;
            }
            const {name, location, isSaved} = this.props.projectInfo;
            if (!isSaved) {
                if (location === "example") {
                    showSaveConfirm({
                        title: 'The example project has been modified. Save as a new project?',
                        saveText: "Save as",
                        doNotSaveText: "Don't save as",
                        onDoNotSave: () => {
                            this.props.openLocal(projectInfo);
                            this.setState({selected: null})
                        },
                        onSave: () => {
                            showNameInput({
                                title: 'Save as',
                                defaultValue: name,
                                onOk: (inputName) => {
                                    return new Promise(async (resolve, reject) => {
                                        inputName = inputName.trim();
                                        if (inputName.length === 0) {
                                            messageI18n.error("Name can't be empty");
                                            reject();
                                        } else if (isProjectNameExist(this.props.myProjectInfos, inputName)) {
                                            messageI18n.error("Name already occupied");
                                            reject();
                                        } else {
                                            await this.props.saveAs(inputName);
                                            this.props.openLocal(projectInfo);
                                            this.setState({selected: null});
                                            resolve();
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    showSaveConfirm({
                        title: 'Your project has been modified. Save it?',
                        saveText: "Save",
                        doNotSaveText: "Don't save",
                        onDoNotSave: () => {
                            this.props.openLocal(projectInfo);
                            this.setState({selected: null})
                        },
                        onSave: async () => {
                            await this.props.save();
                            this.props.openLocal(projectInfo);
                            this.setState({selected: null})
                        }
                    });
                }
            } else {
                this.props.openLocal(projectInfo);
                this.setState({selected: null})
            }
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {t} = this.props;
        const {isModalShow4exampleProjects, exampleProjectInfos} = this.props;
        return (
            <Modal
                title={t("Example projects")}
                visible={isModalShow4exampleProjects}
                onCancel={actions.closeModal}
                centered={true}
                width={"80%"}
                footer={[
                    <Button
                        ghost
                        key="Cancel"
                        type="primary"
                        size="small"
                        onClick={actions.closeModal}>
                        {t("Cancel")}
                    </Button>,
                    <Button
                        ghost
                        key="Create"
                        type="primary"
                        size="small"
                        disabled={!state.selected}
                        onClick={() => {
                            actions.openProject(state.selected)
                        }}>
                        {t('Open')}
                    </Button>
                ]}
            >
                <Row gutter={[20, 20]}>
                    {exampleProjectInfos.map(projectInfo => {
                        const {filePath, name} = projectInfo;
                        return (
                            <Col span={6} key={filePath}>
                                <div
                                    className={state.selected === projectInfo ? styles.div_project_selected : styles.div_project}
                                    onClick={() => {
                                        actions.selectProject(projectInfo)
                                    }}
                                    onDoubleClick={() => {
                                        actions.openProject(projectInfo)
                                    }}>
                                    <div className={styles.div_project_info_example}>
                                        <p className={styles.p_project_info}>{name}</p>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    const {
        isModalShow4exampleProjects,
        exampleProjectInfos,
        myProjectInfos,
        projectInfo
    } = state.codeProject;
    return {
        isModalShow4exampleProjects,
        exampleProjectInfos,
        myProjectInfos,
        projectInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4exampleProjects: () => dispatch(codeProjectActions.closeModal4exampleProjects()),
        openLocal: (projectInfo) => dispatch(codeProjectActions.openLocal(projectInfo)),
        saveAs: (name) => dispatch(codeProjectActions.saveAs(name)),
        save: () => dispatch(codeProjectActions.save()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

