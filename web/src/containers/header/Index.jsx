import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import {Button, Modal, Select, Input, Space, notification} from 'antd';
import {DisconnectOutlined, LinkOutlined} from '@ant-design/icons';

import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {getUuid} from '../../utils/index.js';

const notificationKey = getUuid();

class Index extends React.Component {
    state = {
        modalVisible: false, //serialPortModal visible
        serialPortPath: null, //当前选中的serial port path
    };

    componentDidMount() {
        setInterval(() => {
            this.props.getSerialPortPaths();
        }, 1000)
    }

    componentWillReceiveProps(nextProps) {
        const countDif = nextProps.paths.length - this.props.paths.length;
        if (countDif === 1) {
            const dif = _.difference(nextProps.paths, this.props.paths);
            notification.success({
                key: notificationKey,
                message: 'Cable Connected',
                description: dif[0],
                duration: 0
            });
        } else if (countDif === -1) {
            const dif = _.difference(this.props.paths, nextProps.paths);
            notification.error({
                key: notificationKey,
                message: 'Cable Disconnected',
                description: dif[0],
                duration: 0
            });
        }
    }

    actions = {
        openSerialPortModal: () => {
            this.setState({
                modalVisible: true,
            });
        },
        closeSerialPortModal: () => {
            this.setState({
                modalVisible: false,
            });
        },
        openSerialPort: () => {
            this.props.openSerialPort(this.state.serialPortPath)
        },
        closeSerialPort: () => {
            this.props.closeSerialPort()
        },
        selectPath: (serialPortPath) => {
            this.setState({serialPortPath})
        },
        sendGcode: (e) => {
            const gcode = e.target.value;
            this.props.writeSerialPort(gcode + "\n")
        },
        emergencyStop: () => {
            console.log("emergencyStop")
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path} = this.props;

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
                <Button type="primary" ghost icon={path ? <LinkOutlined/> : <DisconnectOutlined/>}
                        onClick={actions.openSerialPortModal}>Serial Port</Button>
                <Modal
                    title="Serial Port"
                    visible={state.modalVisible}
                    onCancel={actions.closeSerialPortModal}
                    footer={[
                        <Button key="connect" type="primary"
                                onClick={actions.openSerialPort}>
                            Open
                        </Button>,
                        <Button key="disconnect" type="primary"
                                onClick={actions.closeSerialPort}>
                            Close
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{"Status: " + path}</h4>
                        <h4>{"Port: " + path}</h4>
                        <Input onPressEnter={actions.sendGcode} placeholder="send gcode" style={{width: 300}}/>
                        <Space direction={"horizontal"}>
                            <Select style={{width: 300}} onChange={actions.selectPath} value={state.serialPortPath}>
                                {paths.map((item) => {
                                    return <Select.Option key={item} value={item}>{item}</Select.Option>
                                })}
                            </Select>
                        </Space>
                    </Space>
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
        getSerialPortPaths: () => dispatch(serialPortActions.getPaths()),
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
