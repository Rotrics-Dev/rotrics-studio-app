import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import FileSaver from 'file-saver';
import {Button, Space, Menu, Dropdown, Input, Modal, Row, Col} from 'antd';
import {FolderOutlined, SaveOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {actions as codeProjectActions, isProjectNameExist} from "../../../reducers/codeProject";
import {CODE_PROJECT_EXTENSION} from "../../../constants";
import showSaveConfirm from "./showSaveConfirm.jsx";
import showNameInput from "./showNameInput.jsx";
import messageI18n from "../../../utils/messageI18n";

let proinfo = null;

class Index extends React.Component {
    fileInput = React.createRef();

    state = {
        name: ""
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.projectInfo && nextProps.projectInfo.name !== this.state.name) {
            this.setState({name: nextProps.projectInfo.name})
        }
    }

    actions = {
        onMenu4fileClick: ({key}) => {
            const {name, location, isSaved} = this.props.projectInfo;
            switch (key) {
                case "New": {
                    if (!location) {
                        messageI18n.info("A new project already opened.");
                        return;
                    }
                    if (!isSaved) {
                        if (location === "example") {
                            showSaveConfirm({
                                title: 'The example project has been modified. Save as it?',
                                doNotSaveText: "Don't save as",
                                onDoNotSave: () => {
                                    this.props.create()
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
                                                    this.props.create();
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
                                    this.props.create()
                                },
                                onSave: async () => {
                                    await this.props.save();
                                    this.props.create();
                                }
                            });
                        }
                    } else {
                        this.props.create();
                    }
                    break;
                }
                case "Save As":
                    showNameInput({
                        title: "Save As",
                        defaultValue: name,
                        onOk: (inputName) => {
                            return new Promise((resolve, reject) => {
                                inputName = inputName.trim();
                                if (inputName.length === 0) {
                                    messageI18n.error("Name is empty");
                                    reject();
                                } else if (isProjectNameExist(this.props.myProjectInfos, inputName)) {
                                    messageI18n.error("Name already occupied");
                                    reject();
                                } else {
                                    this.props.saveAs(inputName);
                                    resolve();
                                }
                            });
                        }
                    });
                    break;
                case "Example Projects":
                    this.props.openModal4exampleProjects();
                    break;
                case "My Projects":
                    this.props.openModal4myProjects();
                    break;
                case "Open from your computer":
                    this.fileInput.current.value = null;
                    this.fileInput.current.click();
                    break;
                case "Save to your computer":
                    const content = this.props.vm.toJSON();
                    const date = new Date();
                    const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                    const filename = `${arr.join("")}${CODE_PROJECT_EXTENSION}`;
                    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
                    FileSaver.saveAs(blob, filename, true);
                    break;
            }
        },
        openFromYourComputer: (event) => {
            const file = event.target.files[0];
            this.props.openFromYourComputer(file);
        },
        onChangeProjectName: (e) => {
            this.setState({name: e.target.value});
        },
        changeProjectName: (e) => {
            this.props.rename(this.props.projectInfo, e.target.value)
            e.target.blur();
        },
    };

    menu4file = (
        <Menu onClick={this.actions.onMenu4fileClick}>
            <Menu.Item key="New">New</Menu.Item>
            <Menu.Item key="Save As">Save As</Menu.Item>
            <Menu.Item key="Example Projects">Example Projects</Menu.Item>
            <Menu.Item key="My Projects">My Projects</Menu.Item>
            <Menu.Item key="Open from your computer">Open from your computer</Menu.Item>
            <Menu.Item key="Save to your computer">Save to your computer</Menu.Item>
        </Menu>
    );

    render() {
        const {projectInfo} = this.props;
        if (!projectInfo) {
            return null;
        }
        const state = this.state;
        const {save} = this.props;
        const actions = this.actions;
        return (
            <Space style={{position: "absolute", left: "50px"}}>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={'.json'}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.openFromYourComputer}
                />
                <Dropdown overlay={this.menu4file} placement="bottomCenter">
                    <Button size="small" type="primary" ghost icon={<FolderOutlined/>}>File</Button>
                </Dropdown>
                <Button size="small" type="primary" onClick={save} ghost icon={<SaveOutlined/>}>Save</Button>
                <Input
                    value={state.name}
                    size="small"
                    onChange={actions.onChangeProjectName}
                    onBlur={actions.changeProjectName}
                    onPressEnter={actions.changeProjectName}
                    allowClear={true}
                    disabled={["example", "pc"].includes(projectInfo.location)}
                />
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {vm} = state.code;
    const {projectInfo, myProjectInfos} = state.codeProject;
    if (JSON.stringify(proinfo) !== JSON.stringify(projectInfo)) {
        proinfo = projectInfo;
        console.log(JSON.stringify(projectInfo, null, 2))
    }

    return {
        vm,
        projectInfo,
        myProjectInfos
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openModal4exampleProjects: () => dispatch(codeProjectActions.openModal4exampleProjects()),
        openModal4myProjects: () => dispatch(codeProjectActions.openModal4myProjects()),
        openFromYourComputer: (file) => dispatch(codeProjectActions.openFromYourComputer(file)),
        saveAs: (name) => dispatch(codeProjectActions.saveAs(name)),
        save: () => dispatch(codeProjectActions.save()),
        rename: (projectInfo, name) => dispatch(codeProjectActions.rename(projectInfo, name)),
        create: () => dispatch(codeProjectActions.create()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))


