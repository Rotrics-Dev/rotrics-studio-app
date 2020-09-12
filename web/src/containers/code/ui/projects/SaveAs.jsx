import React from 'react';
import {Button, Row, Col, Modal} from 'antd';
import {actions as codeProjectActions} from "../../../../reducers/codeProject";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {timestamp2date, getFilename} from '../../../../utils/index.js';
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
                title={t("Save project as")}
                visible={isModalShow4saveAs}
                onCancel={closeModal4saveAs}
                footer={[
                    <Button
                        ghost
                        key="Cancel"
                        type="primary"
                        size="small"
                        onClick={closeModal4saveAs}>
                        {t("Cancel")}
                    </Button>,
                    <Button
                        ghost
                        key="Create"
                        type="primary"
                        size="small"
                        onClick={closeModal4saveAs}>
                        {t('Save')}
                    </Button>
                ]}
            >
                <Row>
                    <Col span={8}>
                        <span className={styles.span_project_name}>{`${t("Project Name")}:`}</span>
                    </Col>
                    <Col span={12}>
                        <Input placeholder="input project name" onChange={actions.changeName4saveAs}/>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    const {
        isModalShow4saveAs,
    } = state.codeProject;
    return {
        isModalShow4saveAs
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeModal4exampleProjects: () => dispatch(codeProjectActions.closeModal4exampleProjects()),
        saveAs: (name) => dispatch(codeProjectActions.saveAs(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))

