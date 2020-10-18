import React from 'react';
import styles from './styles.css';
import {Button, Space, Switch} from 'antd';
import {StopOutlined} from '@ant-design/icons';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {actions as headerActions} from "../../reducers/header";
import {withTranslation} from 'react-i18next';
import Monitor from './monitor/Index.jsx';
import ControlPanel from './control-panel/Index.jsx';
import P3dCalibration from './p3d-calibration/Index.jsx'
import SerialPortConnection from './serial-port-connection/Index.jsx'

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
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                <Monitor/>
                <ControlPanel/>
                <P3dCalibration/>
                <SerialPortConnection/>
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
                            <span>{t("Monitor")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "5px"}}
                                checked={monitorVisible}
                                onChange={changeVisible4monitor}/>
                        </div>
                        <div>
                            <span>{t("Control Panel")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "5px", marginRight: "10px"}}
                                checked={controlPanelVisible}
                                onChange={changeVisible4controlPanel}/>
                        </div>
                    </Space>
                    }
                    <button
                        className={path ? styles.btn_connected : styles.btn_disconnected}
                        style={{marginRight: "110px"}}
                        onClick={() => {
                            changeVisible4serialPortConnection(true)
                        }}/>
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
            </div>
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
