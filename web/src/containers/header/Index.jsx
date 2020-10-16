import React from 'react';
import styles from './styles.css';
import {Button, Space, Switch} from 'antd';
import {StopOutlined} from '@ant-design/icons';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {actions as headerActions} from "../../reducers/header";
import {withTranslation} from 'react-i18next';
import Terminal from './terminal/Index.jsx';
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
        const {path, terminalVisible, jogPanelVisible} = this.props;
        const {changeVisibility4jogPanel, changeVisibility4terminal, changeVisibility4serialPortConnection} = this.props;
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
                <Terminal/>
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
                            <span>{t("Terminal")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "2px"}}
                                checked={terminalVisible}
                                onChange={changeVisibility4terminal}/>
                        </div>
                        <div>
                            <span>{t("Control Panel")}</span>
                            <Switch
                                size="small"
                                style={{marginLeft: "2px", marginRight: "10px"}}
                                checked={jogPanelVisible}
                                onChange={changeVisibility4jogPanel}/>
                        </div>
                    </Space>
                    }
                    <button
                        className={path ? styles.btn_connected : styles.btn_disconnected}
                        style={{marginRight: "110px"}}
                        onClick={() => {
                            changeVisibility4serialPortConnection(true)
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
    const {terminalVisible, jogPanelVisible} = state.header;
    return {
        path,
        terminalVisible,
        jogPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        serialPortWrite: (gcode) => dispatch(serialPortActions.write(gcode)),
        changeVisibility4terminal: (value) => dispatch(headerActions.changeVisibility4terminal(value)),
        changeVisibility4jogPanel: (value) => dispatch(headerActions.changeVisibility4jogPanel(value)),
        changeVisibility4serialPortConnection: (value) => dispatch(headerActions.changeVisibility4serialPortConnection(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
