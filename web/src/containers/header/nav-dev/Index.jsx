import React from 'react';
import styles from './styles.css';
import {Space, Switch} from 'antd';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../../reducers/serialPort';
import {actions as headerActions} from "../../../reducers/header";
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    actions = {
        emergencyStop: () => {
            //TODO: TEST. 不用gcode sender
            this.props.serialPortWrite('M410\n');
        }
    };

    render() {
        const actions = this.actions;
        const {path, monitorVisible, controlPanelVisible} = this.props;
        const {changeVisible4controlPanel, changeVisible4monitor, changeVisible4serialPortConnection} = this.props;
        const {t} = this.props;
        return (
            <Space size={0}>
                <button
                    className={path ? styles.btn_connected : styles.btn_disconnected}
                    onClick={() => {
                        changeVisible4serialPortConnection(true)
                    }}/>
                <div className={styles.div_monitor}>
                    <span style={{fontSize: "13px", marginRight: "5px"}}>{t("Monitor")}</span>
                    <Switch
                        size="small"
                        checked={monitorVisible}
                        onChange={changeVisible4monitor}/>
                </div>
                <div className={styles.div_control_panel}>
                    <span style={{fontSize: "13px", marginRight: "5px"}}>{t("Control Panel")}</span>
                    <Switch
                        size="small"
                        checked={controlPanelVisible}
                        onChange={changeVisible4controlPanel}/>
                </div>
                <button className={styles.btn_emergency_stop} onClick={actions.emergencyStop}>
                    {t("Emergency Stop")}
                </button>
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {path} = state.serialPort;
    const {monitorVisible, controlPanelVisible} = state.header;
    return {
        path,
        monitorVisible,
        controlPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        serialPortWrite: (gcode) => dispatch(serialPortActions.write(gcode)),
        changeVisible4monitor: (value) => dispatch(headerActions.changeVisible4monitor(value)),
        changeVisible4controlPanel: (value) => dispatch(headerActions.changeVisible4controlPanel(value)),
        changeVisible4serialPortConnection: (value) => dispatch(headerActions.changeVisible4serialPortConnection(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
