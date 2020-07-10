import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import {Button, Modal, Select, Space, notification, Switch} from 'antd';
import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {getUuid} from '../../utils/index.js';
import {actions as tapsActions} from "../../reducers/taps";

const notificationKeyConnected = getUuid();
const notificationKeyDisconnected = getUuid();

class Index extends React.Component {
    state = {
        serialPortModalVisible: false,
        selectedPath: undefined, //当前选中的serial port path; 使用undefined而不是null，是因为undefined情况下，Select才会显示placeholder
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.paths.length > 0) {
            const countDif = nextProps.paths.length - this.props.paths.length;
            if (countDif === 1) {
                const dif = _.difference(nextProps.paths, this.props.paths);
                notification.success({
                    key: notificationKeyConnected,
                    message: 'Cable Connected',
                    description: dif[0],
                    // duration: 3
                });
                notification.close(notificationKeyDisconnected);
            } else if (countDif === -1) {
                const dif = _.difference(this.props.paths, nextProps.paths);
                notification.error({
                    key: notificationKeyDisconnected,
                    message: 'Cable Disconnected',
                    description: dif[0],
                    duration: 1 //设置延时，防止调平断联时消息不消失
                });
                notification.close(notificationKeyConnected)
            }
        }
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
            console.log("emergencyStop")
        },
        setSerialPortAssistantVisible: (checked) => {
            this.props.setSerialPortAssistantVisible(checked)
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path, serialPortAssistantVisible} = this.props;
        const {selectedPath} = state;

        let statusDes = "";
        if (selectedPath) {
            if (path === selectedPath) {
                statusDes = "connected"
            } else {
                statusDes = "disconnected"
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
                <Space style={{position: "absolute", right: "15px"}}>
                    {path &&
                    <label>Terminal</label>
                    }
                    {path &&
                    <Switch
                        size="small"
                        checked={serialPortAssistantVisible}
                        onChange={actions.setSerialPortAssistantVisible}/>
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
                    title="Connect DexArm"
                    visible={state.serialPortModalVisible}
                    onCancel={actions.closeSerialPortModal}
                    footer={[
                        <Button
                            ghost
                            key="connect"
                            type="primary"
                            disabled={connectDisabled}
                            onClick={actions.openSerialPort}>
                            Connect
                        </Button>,
                        <Button
                            ghost
                            key="disconnect"
                            type="primary"
                            disabled={disconnectDisabled}
                            onClick={actions.closeSerialPort}>
                            Disconnect
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{`Status: ${statusDes}`}</h4>
                        <Select
                            style={{width: 300}}
                            value={selectedPath}
                            onChange={actions.selectPath}
                            placeholder="Choose a port"
                            options={options}/>
                    </Space>
                </Modal>

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {paths, path} = state.serialPort;
    const {serialPortAssistantVisible} = state.taps;
    return {
        paths,
        path,
        serialPortAssistantVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        setSerialPortAssistantVisible: (value) => dispatch(tapsActions.setSerialPortAssistantVisible(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
