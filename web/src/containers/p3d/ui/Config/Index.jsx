import React from 'react';
import styles from './styles.css';
import {Space, Button} from 'antd';
import messageI18n from "../../../../utils/messageI18n";
import Material from './Material.jsx';
import Setting from './Setting.jsx';
import FileSaver from 'file-saver';
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {connect} from 'react-redux';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {withTranslation} from 'react-i18next';

import ActionButton from '../../../../components/ActionButton/Index.jsx';

class Index extends React.Component {
    state = {};

    actions = {
        generateGcode: () => {
            if (this.actions._checkStatus4gcode("generateGcode")) {
                this.props.startSlice();
            }
        },
        exportGcode: () => {
            if (this.actions._checkStatus4gcode("exportGcode")) {
                const date = new Date();
                //https://blog.csdn.net/xu511739113/article/details/72764321
                const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                const fileName = arr.join("") + ".gcode";
                const {gcodeUrl} = this.props.result;
                console.log("gcodeUrl: " + gcodeUrl)

                fetch(gcodeUrl)
                    .then(resp => resp.blob())
                    .then(blob => {
                        FileSaver.saveAs(blob, fileName, true);
                        messageI18n.success('Export G-code success', 1);
                    })
                    .catch(() => {
                        console.error("down load err")
                        messageI18n.error('Export G-code failed', 1);
                    });
            }
        },
        startSendGcode: () => {
            if (this.actions._checkStatus4gcode("startSendGcode")) {
                const {gcodeUrl} = this.props.result;
                fetch(gcodeUrl)
                    .then(resp => resp.text())
                    .then(text => {
                        this.props.startSendGcode(text);
                    })
                    .catch(() => {
                        console.error("down load err")
                    });
            }
        },
        stopSendGcode: () => {
            if (this.actions._checkStatus4gcode("stopSendGcode")) {
                this.props.stopSendGcode();
            }
        },
        _checkStatus4gcode: (type) => {
            switch (type) {
                case "generateGcode": {
                    if (this.props.modelCount === 0) {
                        messageI18n.warning('Load model first', 1);
                        return false;
                    }
                    break;
                }
                case "exportGcode": {
                    if (this.props.modelCount === 0) {
                        messageI18n.warning('Load model first', 1);
                        return false;
                    }
                    if (!this.props.result) {
                        messageI18n.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
                }
                case "startSendGcode":
                    if (!this.props.result) {
                        messageI18n.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
                case "stopSendGcode":
                    if (!this.props.result) {
                        messageI18n.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
            }
            return true;
        },
    };

    render() {
        const {t} = this.props;
        const actions = this.actions;
        return (
            <div>
                <Space direction={"vertical"} size="small"
                       style={{width: "100%", padding: "8px"}}>
                    <ActionButton onClick={actions.generateGcode} text={t("Generate G-code")}/>
                    <ActionButton onClick={actions.exportGcode} text={t("Export G-code")}/>
                    <div style={{width: "100%"}}>
                        <ActionButton onClick={actions.startSendGcode} text={t("Start Send")}
                                      style={{width: "calc(50% - 4px)", marginRight: "8px"}}/>
                        <ActionButton onClick={actions.stopSendGcode} text={t("Stop Send")}
                                      style={{width: "calc(50% - 4px)"}}/>
                    </div>
                </Space>
                <Material/>
                <Setting/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {result, modelCount} = state.p3dModel
    return {
        result,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startSlice: () => dispatch(p3dModelActions.startSlice()),
        startSendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        stopSendGcode: () => dispatch(gcodeSendActions.stop()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

