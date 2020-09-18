import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import {Button, Modal, Select, Space, Switch} from 'antd';
import notificationI18n from "../../utils/notificationI18n";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {getUuid} from '../../utils/index.js';
import {actions as tapsActions} from "../../reducers/taps";
import {withTranslation} from 'react-i18next';

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
                notificationI18n.success({
                    key: notificationKeyConnected,
                    message: 'Cable Inserted',
                    description: dif[0],
                    // duration: 3
                });
                notificationI18n.close(notificationKeyDisconnected);
            } else if (countDif === -1) {
                const dif = _.difference(this.props.paths, nextProps.paths);
                notificationI18n.error({
                    key: notificationKeyDisconnected,
                    message: 'Cable Cable Pulled Out',
                    description: dif[0],
                    duration: 1 //设置延时，防止调平断联时消息不消失
                });
                notificationI18n.close(notificationKeyConnected)
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
            this.props.serialPortWrite('M410\n');
            console.log("emergencyStop")
        },
        setTerminalVisible: (checked) => {
            this.props.setTerminalVisible(checked)
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path, terminalVisible} = this.props;
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
                <Space style={{position: "absolute", right: "15px"}}>
                    {path &&
                    <button
                        className={styles.btn_emergency_stop}
                        style={{marginRight: "15px", marginTop: "6px"}}
                        onClick={actions.emergencyStop}
                    />
                    }
                    {path &&
                    <label>{t("Terminal")}</label>
                    }
                    {path &&
                    <Switch
                        size="small"
                        checked={terminalVisible}
                        onChange={actions.setTerminalVisible}/>
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
    const {terminalVisible} = state.taps;
    return {
        paths,
        path,
        terminalVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        serialPortWrite: (gcode) => dispatch(serialPortActions.write(gcode)),
        setTerminalVisible: (value) => dispatch(tapsActions.setTerminalVisible(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
