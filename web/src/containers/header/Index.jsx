import React from 'react';
import styles from './styles.css';
import {Button, Modal, Select, Input, Space} from 'antd';
import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';

class Index extends React.Component {
    state = {
        visible: false, //serialPortModal visible
        serialPortPath: null, //当前选中的serial port path
    };

    componentDidMount() {
        this.actions.getSerialPortPaths();
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.serialPortPath && nextProps.paths.length > 0) {
            this.setState({serialPortPath: nextProps.paths[nextProps.paths.length - 1]})
        }
    }

    actions = {
        openSerialPortModal: () => {
            this.setState({
                visible: true,
            });
        },
        closeSerialPortModal: () => {
            this.setState({
                visible: false,
            });
        },
        openSerialPort: () => {
            const {serialPortPath} = this.state;
            this.props.openSerialPort(serialPortPath)
        },
        closeSerialPort: () => {
            this.props.closeSerialPort()
        },
        selectPath: (serialPortPath) => {
            this.setState({serialPortPath})
        },
        getSerialPortPaths: () => {
            this.props.getSerialPortPaths();
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
        const {serialPortStatus, paths, path} = this.props;

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
                <button
                    onClick={actions.emergencyStop}
                    className={styles.btn_emergency_stop}
                />
                <Button type="primary" onClick={actions.openSerialPortModal}>Serial Port</Button>
                <Modal
                    title="Serial Port"
                    visible={state.visible}
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
                        <h4>{"status: " + serialPortStatus}</h4>
                        <h4>{"port: " + path}</h4>
                        <Input onPressEnter={actions.sendGcode} placeholder="send gcode" style={{width: 300}}/>
                        <Space direction={"horizontal"}>
                            <Select style={{width: 300}} onChange={actions.selectPath} value={state.serialPortPath}>
                                {paths.map((item) => {
                                    return <Select.Option key={item} value={item}>{item}</Select.Option>
                                })}
                            </Select>
                            <Button type="primary" onClick={actions.getSerialPortPaths}>get paths</Button>
                        </Space>
                    </Space>
                </Modal>
                <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('Official Site')}
                </a>
                <a href="https://www.manual.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('User Manual')}
                </a>
                <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('Forum')}
                </a>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status, paths, path} = state.serialPort;
    return {
        serialPortStatus: status,
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
