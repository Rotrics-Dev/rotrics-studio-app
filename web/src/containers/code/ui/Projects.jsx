import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import FileSaver from 'file-saver';
import {Button, Modal, Select, Space, Switch, Input, Menu, Row, Col, Dropdown} from 'antd';
import {actions as codeProjectActions} from "../../../reducers/codeProject";
import styles from './styles.css';
import {timestamp2date, getFilename} from '../../../utils/index.js';
import {CODE_PROJECT_EXTENSION} from "../../../constants";

class Index extends React.Component {
    state = {
        name4new: "",
        name4saveAs: "",
    };

    actions = {
        changeName4new: (e) => {
            this.setState({name4new: e.target.value})
        },
        changeName4saveAs: (e) => {
            this.setState({name4saveAs: e.target.value})
        },
        openLocal: (projectInfo) => {
            this.props.openLocal(projectInfo)
        },
        saveToYourComputer: () => {
            let content = this.props.vm.toJSON();
            content = JSON.stringify(JSON.parse(content), null, 2)
            const date = new Date();
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const filename = `${arr.join("")}${CODE_PROJECT_EXTENSION}`;
            const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, filename, true);
        },
        save: () => {
            this.props.save();
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {t} = this.props;
        const {isModalShow4new, isModalShow4saveAs, isModalShow4exampleProjects, isModalShow4myProjects, isModalShow4save} = this.props;
        const {closeModal4new, closeModal4saveAs, closeModal4exampleProjects, closeModal4myProjects, closeModal4save} = this.props;
        const {myProjectInfos, exampleProjectInfos} = this.props;
        return (
            <div style={{width: "100%", height: "100%"}}>
                {/*Create new project*/}
                <Modal
                    title={t("Create new project")}
                    visible={isModalShow4new}
                    onCancel={closeModal4new}
                    footer={[
                        <Button
                            ghost
                            key="Cancel"
                            type="primary"
                            size="small"
                            onClick={closeModal4new}>
                            {t("Cancel")}
                        </Button>,
                        <Button
                            ghost
                            key="Create"
                            type="primary"
                            size="small"
                            onClick={closeModal4new}>
                            {t('Create')}
                        </Button>
                    ]}
                >
                    <Row>
                        <Col span={8}>
                            <span className={styles.span_project_name}>{`${t("Project Name")}:`}</span>
                        </Col>
                        <Col span={12}>
                            <Input placeholder="input project name" onChange={actions.changeName4new}/>
                        </Col>
                    </Row>
                </Modal>
                {/*Save project as*/}
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
                {/*Example projects*/}
                <Modal
                    title={t("Example projects")}
                    visible={isModalShow4exampleProjects}
                    onCancel={closeModal4exampleProjects}
                    centered={true}
                    width={1000}
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
                    <div style={{backgroundColor: "#E0E0E0", width: "100%", height: "500px"}}>
                        {exampleProjectInfos.map(projectInfo => {
                            const {filePath, location, created, modified} = projectInfo;
                            const name = getFilename(filePath);
                            return (
                                <div key={created} style={{backgroundColor: "#FFE0E0"}} onClick={() => {
                                    actions.openLocal(projectInfo)
                                }}>
                                    <h4>{name}</h4>
                                    <h4>{filePath}</h4>
                                    <h4>{location}</h4>
                                    <h4>{timestamp2date(created)}</h4>
                                    <h4>{timestamp2date(modified)}</h4>
                                </div>
                            );
                        })}
                    </div>
                </Modal>
                {/*My projects*/}
                <Modal
                    title={t("My projects")}
                    visible={isModalShow4myProjects}
                    onCancel={closeModal4myProjects}
                    centered={true}
                    width={1000}
                    footer={[
                        <Button
                            ghost
                            key="Cancel"
                            type="primary"
                            size="small"
                            onClick={closeModal4myProjects}>
                            {t("Cancel")}
                        </Button>,
                        <Button
                            ghost
                            key="Create"
                            type="primary"
                            size="small"
                            onClick={closeModal4myProjects}>
                            {t('Open')}
                        </Button>
                    ]}
                >
                    <div style={{backgroundColor: "#E0E0E0", width: "100%", height: "500px"}}>
                        {myProjectInfos.map(projectInfo => {
                            const {filePath, location, created, modified} = projectInfo;
                            const name = getFilename(filePath);
                            return (
                                <div key={created} style={{backgroundColor: "#FFE0E0"}} onClick={() => {
                                    actions.openLocal(projectInfo)
                                }}>
                                    <h4>{name}</h4>
                                    <h4>{filePath}</h4>
                                    <h4>{location}</h4>
                                    <h4>{timestamp2date(created)}</h4>
                                    <h4>{timestamp2date(modified)}</h4>
                                </div>
                            );
                        })}
                    </div>
                </Modal>
                {/*save confirm*/}
                <Modal
                    title={t("Save")}
                    visible={isModalShow4save}
                    onCancel={closeModal4save}
                    footer={[
                        <Button
                            ghost
                            key="Cancel"
                            type="primary"
                            size="small"
                            onClick={closeModal4save}>
                            {t("Cancel")}
                        </Button>,
                        <Button
                            ghost
                            key="Create"
                            type="primary"
                            size="small"
                            onClick={closeModal4save}>
                            {t('Do not Save')}
                        </Button>,
                        <Button
                            ghost
                            key="Create"
                            type="primary"
                            size="small"
                            onClick={actions.save}>
                            {t('Save')}
                        </Button>
                    ]}
                >
                    <h4>{"The file has been modified. Save it?"}</h4>
                </Modal>
            </div>
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


