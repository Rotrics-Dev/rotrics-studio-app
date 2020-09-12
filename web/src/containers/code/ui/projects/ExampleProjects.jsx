import React from 'react';
import {Button, Row, Col, Modal} from 'antd';
import {actions as codeProjectActions} from "../../../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {timestamp2date, getFilename} from '../../../../utils/index.js';
import styles from './styles.css';

//TODO: double-click to open project: https://stackoverflow.com/questions/12014703/double-click-event-for-div
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
        openProject: () => {
            this.props.openLocal(this.state.selected);
            this.setState({selected: null})
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
                        onClick={actions.openProject}>
                        {t('Open')}
                    </Button>
                ]}
            >
                <Row gutter={[20, 20]}>
                    {exampleProjectInfos.map(projectInfo => {
                        const {filePath, created, modified} = projectInfo;
                        const name = getFilename(filePath);
                        return (
                            <Col span={6} key={created}>
                                <div
                                    className={state.selected === projectInfo ? styles.div_project_selected : styles.div_project}
                                    onClick={() => {
                                        actions.selectProject(projectInfo)
                                    }}>
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
    const {
        isModalShow4exampleProjects,
        exampleProjectInfos,
    } = state.codeProject;
    return {
        isModalShow4exampleProjects,
        exampleProjectInfos,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4exampleProjects: () => dispatch(codeProjectActions.closeModal4exampleProjects()),
        openLocal: (projectInfo) => dispatch(codeProjectActions.openLocal(projectInfo)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

