import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import {Button, Modal, Select, Input, Space, notification, InputNumber} from 'antd';
import {DisconnectOutlined, LinkOutlined} from '@ant-design/icons';

import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {getUuid} from '../../utils/index.js';
import Console from 'react-console-component';

const notificationKeyConnected = getUuid();
const notificationKeyDisconnected = getUuid();

class Index extends React.Component {
    state = {
        serialPortModalVisible: false,
        selectedPath: undefined, //当前选中的serial port path; 使用undefined而不是null，是因为undefined情况下，Select才会显示placeholder
        consoleModalVisible: false,
    };

    componentWillReceiveProps(nextProps) {
        this.refConsole = React.createRef();
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
                    // duration: 3
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
        sendGcode: (e) => {
            const gcode = e.target.value;
            this.props.writeSerialPort(gcode + "\n")
        },
        sendStr: (e) => {
            const str = e.target.value;
            this.props.writeSerialPort(str+"")
        },
        emergencyStop: () => {
            console.log("emergencyStop")
        },
        //console
        openConsolePortModal: () => {
            this.setState({
                consoleModalVisible: true,
            });
        },
        closeConsolePortModal: () => {
            this.setState({
                consoleModalVisible: false,
            });
        },
        echo: (text) => {
            console.log(text)

            this.refConsole.current.log(text);
            this.refConsole.current.return();
            // this.setState({
            //     count: this.state.count + 1,
            // }, this.child.console.return);
        },
        promptLabel: () => {
            return "> "
            // return this.state.count + "> ";
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path} = this.props;

        const {selectedPath} = state;

        let statusDes = "";
        if (selectedPath) {
            statusDes = (path === selectedPath) ? "opened" : "closed";
        }

        const options = [];
        for (let i = 0; i < paths.length; i++) {
            options.push({label: paths[i], value: paths[i]})
        }

        let openDisabled = false;
        let closeDisabled = false;
        if (!selectedPath) {
            openDisabled = true;
            closeDisabled = true;
        } else {
            if (selectedPath === path) {
                openDisabled = true;
                closeDisabled = false;
            } else {
                openDisabled = false;
                closeDisabled = true;
            }
        }
        return (
            <div style={{
                width: "400px",
                height: "100%",
                float: "right",
                marginRight: "15px",
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between"
            }}>
                {/*<button*/}
                {/*onClick={actions.emergencyStop}*/}
                {/*className={styles.btn_emergency_stop}*/}
                {/*/>*/}
                {/*<Button type="primary" ghost icon={path ? <LinkOutlined/> : <DisconnectOutlined/>}*/}
                        {/*onClick={actions.openConsolePortModal}>Console</Button>*/}
                <Button type="primary" ghost icon={path ? <LinkOutlined/> : <DisconnectOutlined/>}
                        onClick={actions.openSerialPortModal}>Serial Port</Button>
                <Modal
                    title="Serial Port"
                    visible={state.serialPortModalVisible}
                    onCancel={actions.closeSerialPortModal}
                    footer={[
                        <Button
                            ghost
                            key="connect"
                            type="primary"
                            disabled={openDisabled}
                            onClick={actions.openSerialPort}>
                            Open
                        </Button>,
                        <Button
                            ghost
                            key="disconnect"
                            type="primary"
                            disabled={closeDisabled}
                            onClick={actions.closeSerialPort}>
                            Close
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{`Status: ${statusDes}`}</h4>
                        <Input onPressEnter={actions.sendGcode} placeholder="send gcode" style={{width: 300}}/>
                        <Input onPressEnter={actions.sendStr} placeholder="send string" style={{width: 300}}/>
                        <Select style={{width: 300}}
                                value={selectedPath}
                                onChange={actions.selectPath}
                                placeholder="Choose a port"
                                options={options}/>
                    </Space>
                </Modal>
                <Modal
                    title="Console"
                    visible={state.consoleModalVisible}
                    onCancel={actions.closeConsolePortModal}
                >
                    <Console
                        style={{backgroundColor: "#ff0000"}}
                        ref={this.refConsole}
                             handler={actions.echo}
                             promptLabel={actions.promptLabel}
                             welcomeMessage={"Welcome to the react-console demo!\nThis is an example of a simple echo console."}
                             autofocus={true}
                    />
                </Modal>
                <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('Official Site')}
                </a>
                <a href="https://www.manual.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('User Manual')}
                </a>
                <a href="https://discord.gg/Xd7X8EW" target="_blank" rel="noopener noreferrer">
                    {('Forum')}
                </a>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {paths, path} = state.serialPort;
    return {
        paths,
        path
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
