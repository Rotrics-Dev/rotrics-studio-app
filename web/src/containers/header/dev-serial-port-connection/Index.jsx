import React from 'react';
import {Button, Modal, Radio} from 'antd';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {actions as serialPortActions} from '../../../reducers/serialPort';
import {actions as headerActions} from "../../../reducers/header";
import messageI18n from "../../../utils/messageI18n";
import styles from "./styles.css";

class Index extends React.Component {
    state = {
        selectedPath: null
    };

    componentWillReceiveProps(nextProps) {
        if (!nextProps.paths.includes(this.state.selectedPath)) {
            this.setState({selectedPath: null});
        }
    }

    actions = {
        openSerialPort: () => {
            const path = this.props.path;
            if (path) {
                messageI18n.warning("Unable to connect, disconnect first.");
            } else {
                this.props.openSerialPort(this.state.selectedPath)
            }
        },
        closeSerialPort: () => {
            if (this.props.curStatus !== 'idle') {
                messageI18n.warning("Unable to disconnect, sending G-code.");
            } else {
                this.props.closeSerialPort();
            }
        },
        selectPath: (e) => {
            this.setState({selectedPath: e.target.value})
        }
    };

    render() {
        const {t} = this.props;
        const actions = this.actions;
        const {selectedPath} = this.state;
        const {paths, path, serialPortConnectionVisible, changeVisible4serialPortConnection} = this.props;
        return (
            <Modal
                title={t("Connection")}
                visible={serialPortConnectionVisible}
                onCancel={() => {
                    changeVisible4serialPortConnection(false);
                }}
                footer={[
                    <Button
                        ghost
                        key="connect"
                        type="primary"
                        disabled={!selectedPath || selectedPath === path}
                        onClick={actions.openSerialPort}>
                        {t("Connect")}
                    </Button>,
                    <Button
                        ghost
                        key="disconnect"
                        type="primary"
                        disabled={!path || selectedPath !== path}
                        onClick={actions.closeSerialPort}>
                        {t('Disconnect')}
                    </Button>,
                ]}
            >
                <Radio.Group onChange={actions.selectPath} value={selectedPath}>
                    {paths.map(value => {
                        if (path === value) {
                            return (
                                <Radio className={styles.radio} key={value} value={value}>
                                    {value}
                                    <div className={styles.div_connected}/>
                                </Radio>)
                        } else {
                            return (<Radio className={styles.radio} key={value} value={value}>{value}</Radio>)
                        }
                    })}
                </Radio.Group>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    const {curStatus} = state.gcodeSend;
    const {paths, path} = state.serialPort;
    const {serialPortConnectionVisible} = state.header;
    return {
        curStatus,
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
