import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import FileSaver from 'file-saver';
import {Button, Space, Menu, Dropdown, Input} from 'antd';
import {FolderOutlined, SaveOutlined} from '@ant-design/icons';
import {actions as codeProjectActions} from "../../../reducers/codeProject";
import {CODE_PROJECT_EXTENSION} from "../../../constants";

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
        onClickOpenFromYourComputer: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        openFromYourComputer: (event) => {
            const file = event.target.files[0];
            this.props.openFromYourComputer(file);
        },
        saveToYourComputer: () => {
            const content = this.props.vm.toJSON();
            const date = new Date();
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const filename = `${arr.join("")}${CODE_PROJECT_EXTENSION}`;
            const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, filename, true);
        },
        onChangeProjectName: (e) => {
            this.setState({name: e.target.value});
        },
        changeProjectName: (e) => {
            this.props.rename(this.props.projectInfo, e.target.value)
            e.target.blur();
        },
        onMenu4fileClick: ({key}) => {
            switch (key) {
                case "1":
                    this.props.openModal4new();
                    break;
                case "2":
                    this.props.openModal4saveAs();
                    break;
                case "3":
                    this.props.openModal4exampleProjects();
                    break;
                case "4":
                    this.props.openModal4myProjects();
                    break;
                case "5":
                    this.actions.onClickOpenFromYourComputer();
                    break;
                case "6":
                    this.actions.saveToYourComputer();
                    break;
            }
        },
    };

    menu4file = (
        <Menu onClick={this.actions.onMenu4fileClick}>
            <Menu.Item key="1">New</Menu.Item>
            <Menu.Item key="2">Save As</Menu.Item>
            <Menu.Item key="3">Example Projects</Menu.Item>
            <Menu.Item key="4">My Projects</Menu.Item>
            <Menu.Item key="5">Open from your computer</Menu.Item>
            <Menu.Item key="6">Save to your computer</Menu.Item>
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
            <Space style={{position: "absolute", left: "25px"}}>
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
                    disabled={projectInfo.location === "example"}
                />
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {vm, running} = state.code;
    const {
        projectInfo,
        isSaved,
        myProjectInfos,
        exampleProjectInfos,
    } = state.codeProject;
    return {
        vm,
        running,
        projectInfo,
        isSaved,
        myProjectInfos,
        exampleProjectInfos,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openModal4new: () => dispatch(codeProjectActions.openModal4new()),
        openModal4saveAs: () => dispatch(codeProjectActions.openModal4saveAs()),
        openModal4exampleProjects: () => dispatch(codeProjectActions.openModal4exampleProjects()),
        openModal4myProjects: () => dispatch(codeProjectActions.openModal4myProjects()),
        openFromYourComputer: (file) => dispatch(codeProjectActions.openFromYourComputer(file)),
        save: () => dispatch(codeProjectActions.save()),
        rename: (projectInfo, name) => dispatch(codeProjectActions.rename(projectInfo, name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))


