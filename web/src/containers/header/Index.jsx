import React from 'react';
import styles from './styles.css';
import {Button, Modal, Select, Space, Switch} from 'antd';
import {StopOutlined} from '@ant-design/icons';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {actions as headerActions} from "../../reducers/header";
import {withTranslation} from 'react-i18next';
import Terminal from './terminal/Index.jsx';
import ControlPanel from './control-panel/Index.jsx';
import P3dCalibration from './p3d-calibration/Index.jsx'

class Index extends React.Component {
    state = {
        serialPortModalVisible: false,
        selectedPath: undefined, //当前选中的serial port path; 使用undefined而不是null，是因为undefined情况下，Select才会显示placeholder
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.paths.includes(this.state.selectedPath) && !nextProps.paths.includes(this.state.selectedPath)) {
            this.setState({selectedPath: undefined});
        }
    }

    actions = {
        openSerialPortModal: () => {
            if (!this.state.selectedPath) {
                this.setState({
                    selectedPath: this.props.path,
                });
            }
            this.setState({
                serialPortModalVisible: true,
            });
        },
        closeSerialPortModal: () => {
            this.setState({
                serialPortModalVisible: false,
            });
        },
        openSerialPort: () => {
            this.props.openSerialPort(this.state.selectedPath)
        },
        closeSerialPort: () => {
            this.props.closeSerialPort()
        },
        selectPath: (selectedPath) => {
            this.setState({selectedPath})
        },
        emergencyStop: () => {
            this.props.serialPortWrite('M410\n');
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path, terminalVisible, jogPanelVisible} = this.props;
        const {changeVisibility4jogPanel, changeVisibility4terminal} = this.props;
        const {selectedPath} = state;
        const {t} = this.props;
        let statusDes = "";
        if (selectedPath) {
            if (path === selectedPath) {
                statusDes = "Connected"
            } else {
                statusDes = "Disconnected"
            }
        }

        let connectDisabled = false;
        let disconnectDisabled = false;
        if (!selectedPath) {
            connectDisabled = true;
            disconnectDisabled = true;
        } else {
            if (selectedPath === path) {
                connectDisabled = true;
                disconnectDisabled = false;
            } else {
                connectDisabled = false;
                disconnectDisabled = true;
            }
        }

        const options = [];
        for (let i = 0; i < paths.length; i++) {
            options.push({label: paths[i], value: paths[i]})
        }
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                <Terminal/>
                <ControlPanel/>
                <P3dCalibration/>
                <Space style={{position: "absolute", right: "15px"}}>
                    {path &&
                    <Space size={15}>
                        <Button
                            size={'small'}
                            danger
                            onClick={actions.emergencyStop}
                            icon={<StopOutlined/>}
                        >
                            {t("Stop")}
                        </Button>
                        <div>
                            <span>{t("Terminal")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "2px"}}
                                checked={terminalVisible}
                                onChange={changeVisibility4terminal}/>
                        </div>
                        <div>
                            <span>{t("Control Panel")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "2px", marginRight: "10px"}}
                                checked={jogPanelVisible}
                                onChange={changeVisibility4jogPanel}/>
                        </div>
                    </Space>
                    }
                    <button
                        className={path ? styles.btn_connected : styles.btn_disconnected}
                        style={{marginRight: "110px"}}
                        onClick={actions.openSerialPortModal}/>
                    <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                        <button className={styles.btn_official_website}/>
                    </a>
                    <a href="https://www.manual.rotrics.com/" target="_blank" rel="noopener noreferrer">
                        <button className={styles.btn_manual}/>
                    </a>
                    <a href="https://discord.gg/Xd7X8EW" target="_blank" rel="noopener noreferrer">
                        <button className={styles.btn_forum}/>
                    </a>
                </Space>
                <Modal
                    title={t("Connect DexArm")}
                    visible={state.serialPortModalVisible}
                    onCancel={actions.closeSerialPortModal}
                    footer={[
                        <Button
                            ghost
                            key="connect"
                            type="primary"
                            disabled={connectDisabled}
                            onClick={actions.openSerialPort}>
                            {t("Connect")}
                        </Button>,
                        <Button
                            ghost
                            key="disconnect"
                            type="primary"
                            disabled={disconnectDisabled}
                            onClick={actions.closeSerialPort}>
                            {t('Disconnect')}
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{`${t('Status')}: ${t(statusDes)}`}</h4>
                        <Select
                            style={{width: 300}}
                            value={selectedPath}
                            onChange={actions.selectPath}
                            placeholder={t("Choose a port")}
                            options={options}/>
                    </Space>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {paths, path} = state.serialPort;
    const {terminalVisible, jogPanelVisible} = state.header;
    return {
        paths,
        path,
        terminalVisible,
        jogPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        serialPortWrite: (gcode) => dispatch(serialPortActions.write(gcode)),

        changeVisibility4terminal: (value) => dispatch(headerActions.changeVisibility4terminal(value)),
        changeVisibility4jogPanel: (value) => dispatch(headerActions.changeVisibility4jogPanel(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
