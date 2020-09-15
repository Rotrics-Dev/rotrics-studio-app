import React from 'react';
import {Button, Dropdown, Menu, Row, Col, Modal, Empty, Popconfirm} from 'antd';
import {EditOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {actions as codeProjectActions} from "../../../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {timestamp2date, getFilename} from '../../../../utils/index.js';
import styles from './styles.css';
import NameInputModal from "../NameInputModal.jsx";

//TODO: double-click to open project
class Index extends React.Component {
    state = {
        selected: null, //selected project info
        nameInputModalVisible: false
    };

    actions = {
        selectProject: (projectInfo) => {
            this.setState({selected: projectInfo})
        },
        closeModal: () => {
            this.setState({selected: null});
            this.props.closeModal4myProjects();
        },
        openProject: () => {
            this.props.openLocal(this.state.selected);
            this.setState({selected: null})
        },
        renameProject: (name) => {
            const projectInfo = this.state.selected;
            this.props.rename(projectInfo, name);
        },
        delProject: (projectInfo) => {
            this.setState({selected: null});
            this.props.del(projectInfo);
        },
        showDelConfirm: (projectInfo) => {
            Modal.confirm({
                title: 'Are you sure delete this project?',
                icon: <ExclamationCircleOutlined/>,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                    this.actions.delProject(projectInfo);
                },
                onCancel: () => {
                },
            })
        }
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {t} = this.props;
        const {isModalShow4myProjects, myProjectInfos} = this.props;
        return (
            <div>
                {state.nameInputModalVisible &&
                <NameInputModal
                    title={t('Rename')}
                    visible={true}
                    defaultValue={state.selected ? state.selected.name : ""}
                    onOk={(name) => {
                        this.setState({nameInputModalVisible: false});
                        actions.renameProject(name);
                    }}
                    onCancel={() => {
                        this.setState({nameInputModalVisible: false});
                    }}
                />
                }
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
                                        }}>
                                        <Dropdown
                                            trigger={['click']}
                                            placement="bottomCenter"
                                            overlay={() => {
                                                return <Menu>
                                                    <Menu.Item>
                                                        <Button size="small" onClick={(e) => {
                                                            this.setState({nameInputModalVisible: true})
                                                        }}>Rename</Button>
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        <Button size="small" onClick={() => {
                                                            actions.showDelConfirm(projectInfo)
                                                        }}>Delete</Button>
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
    } = state.codeProject;
    return {
        isModalShow4myProjects,
        myProjectInfos,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4myProjects: () => dispatch(codeProjectActions.closeModal4myProjects()),
        openLocal: (projectInfo) => dispatch(codeProjectActions.openLocal(projectInfo)),
        del: (projectInfo) => dispatch(codeProjectActions.del(projectInfo)),
        rename: (projectInfo, name) => dispatch(codeProjectActions.rename(projectInfo, name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

