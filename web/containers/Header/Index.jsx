import React from 'react';
import styles from './styles.css';
import {Button, Modal, Select, Input, Space} from 'antd';
import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';

class Index extends React.Component {
    state = {
        visible: false, //serialPortModal visible
        pathSelected: null,
    };

    componentDidMount() {
        this.actions.getPaths();
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.pathSelected && nextProps.paths.length > 0) {
            this.setState({pathSelected: nextProps.paths[nextProps.paths.length - 1]})
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
        open: () => {
            const {pathSelected} = this.state;
            const {path} = this.props;
            this.props.open(pathSelected)
        },
        close: () => {
            this.props.close()
        },
        selectPath: (pathSelected) => {
            this.setState({pathSelected})
        },
        getPaths: () => {
            this.props.getPaths();
        },
        sendGcode: (e) => {
            const gcode = e.target.value;
            this.props.write(gcode)
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
                        <Button key="connect" type="primary" loading={serialPortStatus === "opening"}
                                onClick={actions.open}>
                            Open
                        </Button>,
                        <Button key="disconnect" type="primary" loading={serialPortStatus === "closing"}
                                onClick={actions.close}>
                            Close
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{"status: " + serialPortStatus}</h4>
                        <h4>{"port: " + path}</h4>
                        <Input onPressEnter={actions.sendGcode} placeholder="send gcode" style={{width: 300}}/>
                        <Space direction={"horizontal"}>
                            <Select style={{width: 300}} onChange={actions.selectPath} value={state.pathSelected}>
                                {paths.map((item) => {
                                    return <Select.Option key={item} value={item}>{item}</Select.Option>
                                })}
                            </Select>
                            <Button type="primary" onClick={actions.getPaths}>get paths</Button>
                        </Space>


                    </Space>
                </Modal>
                <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('Official Site')}
                </a>
                <a href="https://www.manual.rotrics.com/v/v1.0-chinese/" target="_blank" rel="noopener noreferrer">
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
    const {serialPortStatus, paths, path} = state.serialPort;
    return {
        serialPortStatus,
        paths,
        path
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getPaths: () => dispatch(serialPortActions.getPaths()),
        open: (path) => dispatch(serialPortActions.open(path)),
        close: () => dispatch(serialPortActions.close()),
        write: (str) => dispatch(serialPortActions.write(str)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
