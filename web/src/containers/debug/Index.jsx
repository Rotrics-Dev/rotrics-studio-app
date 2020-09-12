import React from 'react';
import {Button, Space, Dropdown, Menu, Row, Col, Modal} from 'antd';
import {MoreOutlined, EditOutlined} from '@ant-design/icons';
import {actions as codeProjectActions} from "../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {timestamp2date, getFilename} from '../../utils/index.js';
import styles from './styles.css';

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    menu4edit = (
        <Menu>
            <Menu.Item>
                <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    console.log("rename")
                }}>Rename</Button>
            </Menu.Item>
            <Menu.Item>
                <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    console.log("Delete")
                }}>Delete</Button>
            </Menu.Item>
        </Menu>
    );

    render() {
        const actions = this.actions;
        const {t} = this.props;
        const {isModalShow4new, isModalShow4saveAs, isModalShow4exampleProjects, isModalShow4myProjects, isModalShow4save} = this.props;
        const {closeModal4new, closeModal4saveAs, closeModal4exampleProjects, closeModal4myProjects, closeModal4save, openLocal} = this.props;
        const {myProjectInfos, exampleProjectInfos} = this.props;
        return (
                <Modal
                    title={t("Example projects")}
                    visible={false}
                    onCancel={closeModal4exampleProjects}
                    centered={true}
                    width={"80%"}
                    footer={[
                        <Button
                            ghost
                            key="Cancel"
                            type="primary"
                            size="small"
                            onClick={closeModal4exampleProjects}>
                            {t("Cancel")}
                        </Button>,
                        <Button
                            ghost
                            key="Create"
                            type="primary"
                            size="small"
                            onClick={closeModal4exampleProjects}>
                            {t('Open')}
                        </Button>
                    ]}
                >
                    <Row gutter={[20, 20]}>
                        {exampleProjectInfos.map(projectInfo => {
                            const {filePath, location, created, modified} = projectInfo;
                            const name = getFilename(filePath);
                            return (
                                <Col span={6} key={created}>
                                    <div className={styles.div_project} onClick={() => {
                                        openLocal(projectInfo)
                                    }}>
                                        <Dropdown overlay={this.menu4edit} placement="bottomCenter">
                                            <EditOutlined
                                                className={styles.icon_edit}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}/>
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
                </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    const {vm, running} = state.code;
    const {
        isModalShow4new,
        isModalShow4saveAs,
        isModalShow4exampleProjects,
        isModalShow4myProjects,
        isModalShow4save,
        project,
        isSaved,
        myProjectInfos,
        exampleProjectInfos,
    } = state.codeProject;
    return {
        vm,
        running,
        isModalShow4new,
        isModalShow4saveAs,
        isModalShow4exampleProjects,
        isModalShow4myProjects,
        isModalShow4save,
        project,
        isSaved,
        myProjectInfos,
        exampleProjectInfos,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4new: () => dispatch(codeProjectActions.closeModal4new()),
        closeModal4saveAs: () => dispatch(codeProjectActions.closeModal4saveAs()),
        closeModal4exampleProjects: () => dispatch(codeProjectActions.closeModal4exampleProjects()),
        closeModal4myProjects: () => dispatch(codeProjectActions.closeModal4myProjects()),
        closeModal4save: () => dispatch(codeProjectActions.closeModal4save()),
        openLocal: (projectInfo) => dispatch(codeProjectActions.openLocal(projectInfo)),
        save: () => dispatch(codeProjectActions.save()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

