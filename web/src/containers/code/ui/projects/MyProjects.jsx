import React from 'react';
import FileSaver from 'file-saver';
import {Button, Dropdown, Menu, Row, Col, Modal, Empty} from 'antd';
import {EditOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {actions as codeProjectActions, compareProject, isProjectNameExist} from "../../../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {timestamp2date, getFilename} from '../../../../utils/index.js';
import styles from './styles.css';
import messageI18n from "../../../../utils/messageI18n";
import showSaveConfirm from "../showSaveConfirm.jsx";
import showNameInput from "../showNameInput.jsx";
import {fetchProjectContent} from "../../../../api/codeProject";
import {CODE_PROJECT_EXTENSION} from "../../../../constants";

class Index extends React.Component {
    state = {
        selected: null, //selected project info
    };

    actions = {
        selectProject: (projectInfo) => {
            this.setState({selected: projectInfo})
        },
        closeModal: () => {
            this.setState({selected: null});
            this.props.closeModal4myProjects();
        },
        openProject: (projectInfo) => {
            if (compareProject(projectInfo, this.props.projectInfo)) {
                messageI18n.warning("Project already opened.");
                return;
            }
            const target = projectInfo ? projectInfo : this.state.selected;
            const {name, location, isSaved} = this.props.projectInfo;
            if (!isSaved) {
                if (location === "example") {
                    showSaveConfirm({
                        title: 'The example project has been modified. Save as it?',
                        doNotSaveText: "Don't save as",
                        onDoNotSave: () => {
                            this.props.openLocal(target);
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
                                            messageI18n.error("Name is empty");
                                            reject();
                                        } else if (isProjectNameExist(this.props.myProjectInfos, inputName)) {
                                            messageI18n.error("Name already occupied");
                                            reject();
                                        } else {
                                            await this.props.saveAs(inputName);
                                            this.props.openLocal(target);
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
                        title: 'The project has been modified. Save it?',
                        doNotSaveText: "Don't save",
                        onDoNotSave: () => {
                            this.props.openLocal(target);
                            this.setState({selected: null})
                        },
                        onSave: async () => {
                            await this.props.save();
                            this.props.openLocal(target);
                            this.setState({selected: null})
                        }
                    });
                }
            } else {
                this.props.openLocal(target);
                this.setState({selected: null})
            }
        },
        delProject: (projectInfo) => {
            Modal.confirm({
                title: 'Are you sure delete this project?',
                icon: <ExclamationCircleOutlined/>,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                    this.setState({selected: null});
                    this.props.del(projectInfo);
                },
                onCancel: () => {
                },
            })
        },
        renameProject: (projectInfo) => {
            showNameInput({
                title: 'Rename',
                defaultValue: projectInfo.name,
                onOk: (inputName) => {
                    return new Promise(async (resolve, reject) => {
                        inputName = inputName.trim();
                        if (inputName.length === 0) {
                            messageI18n.error("Name is empty");
                            reject();
                        } else if (isProjectNameExist(this.props.myProjectInfos, inputName)) {
                            messageI18n.error("Name already occupied");
                            reject();
                        } else {
                            await this.props.rename(projectInfo, inputName);
                            this.setState({selected: null});
                            resolve();
                        }
                    });
                }
            });
        },
        exportProject: async (projectInfo) => {
            const {status, data: content} = await fetchProjectContent(projectInfo);
            if (status === "ok") {
                const filename = `${projectInfo.name}${CODE_PROJECT_EXTENSION}`;
                const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
                FileSaver.saveAs(blob, filename, true);
            } else {
                messageI18n.error("Export project failed");
            }
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {t} = this.props;
        const {isModalShow4myProjects, myProjectInfos, openLocal} = this.props;
        return (
            <div>
                <Modal
                    title={t("My projects")}
                    visible={isModalShow4myProjects}
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
                            onClick={actions.openProject}>
                            {t('Open')}
                        </Button>
                    ]}
                >
                    {myProjectInfos.length === 0 &&
                    <Empty/>
                    }
                    {myProjectInfos.length > 0 &&
                    <Row gutter={[20, 20]}>
                        {myProjectInfos.map(projectInfo => {
                            const {filePath, created, modified} = projectInfo;
                            const name = getFilename(filePath);
                            return (
                                <Col span={6} key={created}>
                                    <div
                                        className={state.selected === projectInfo ? styles.div_project_selected : styles.div_project}
                                        onClick={() => {
                                            actions.selectProject(projectInfo)
                                        }}
                                        onDoubleClick={() => {
                                            actions.openProject(projectInfo)
                                        }}
                                    >
                                        <Dropdown
                                            trigger={['click']}
                                            placement="bottomCenter"
                                            overlay={() => {
                                                return <Menu>
                                                    <Menu.Item>
                                                        <Button size="small" onClick={() => {
                                                            actions.renameProject(projectInfo)
                                                        }}>Rename</Button>
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        <Button size="small" onClick={() => {
                                                            actions.delProject(projectInfo)
                                                        }}>Delete</Button>
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        <Button size="small" onClick={() => {
                                                            actions.exportProject(projectInfo)
                                                        }}>Export</Button>
                                                    </Menu.Item>
                                                </Menu>
                                            }}>
                                            <EditOutlined className={styles.icon_edit}/>
                                        </Dropdown>
                                        <div className={styles.div_project_info}>
                                            <p className={styles.p_str}>{name}</p>
                                            <p className={styles.p_str}>{"created: " + timestamp2date(created)}</p>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                    }
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {
        isModalShow4myProjects,
        myProjectInfos,
        projectInfo
    } = state.codeProject;
    return {
        isModalShow4myProjects,
        myProjectInfos,
        projectInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4myProjects: () => dispatch(codeProjectActions.closeModal4myProjects()),
        openLocal: (projectInfo) => dispatch(codeProjectActions.openLocal(projectInfo)),
        del: (projectInfo) => dispatch(codeProjectActions.del(projectInfo)),
        rename: (projectInfo, name) => dispatch(codeProjectActions.rename(projectInfo, name)),
        saveAs: (name) => dispatch(codeProjectActions.saveAs(name)),
        save: () => dispatch(codeProjectActions.save()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

