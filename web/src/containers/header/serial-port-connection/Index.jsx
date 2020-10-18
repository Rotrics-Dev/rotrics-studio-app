import React from 'react';
import {Button, Modal, Select, Space} from 'antd';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../../reducers/serialPort';
import {actions as headerActions} from "../../../reducers/header";
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    state = {
        selectedPath: undefined, //undefined时Select才会显示placeholder
    };

    componentWillReceiveProps(nextProps) {
        if (!nextProps.paths.includes(this.state.selectedPath)) {
            this.setState({selectedPath: undefined});
        }
    }

    actions = {
        openSerialPort: () => {
            this.props.openSerialPort(this.state.selectedPath)
        },
        closeSerialPort: () => {
            this.props.closeSerialPort()
        },
        selectPath: (selectedPath) => {
            this.setState({selectedPath})
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path, serialPortConnectionVisible, changeVisible4serialPortConnection} = this.props;
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
            <Modal
                title={t("Connect DexArm")}
                visible={serialPortConnectionVisible}
                onCancel={() => {
                    changeVisible4serialPortConnection(false);
                }}
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
        )
    }
}

const mapStateToProps = (state) => {
    const {paths, path} = state.serialPort;
    const {serialPortConnectionVisible} = state.header;
    return {
        paths,
        path,
        serialPortConnectionVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        serialPortWrite: (gcode) => dispatch(serialPortActions.write(gcode)),
        changeVisible4serialPortConnection: (value) => dispatch(headerActions.changeVisible4serialPortConnection(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
