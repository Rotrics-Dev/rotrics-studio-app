import React from 'react';
import {connect} from 'react-redux';
import {Space} from 'antd';
import messageI18n from "../../../../utils/messageI18n";
import TemperatureDisplay from './TemperatureDisplay.jsx'
import SettingVisibility from "./SettingVisibility.jsx";
import MaterialSettings from './MaterialSettings.jsx';
import PrintSettings from './PrintSettings.jsx';
import FileSaver from 'file-saver';
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {withTranslation} from 'react-i18next';
import ActionButton from '../../../../components/ActionButton/Index.jsx';

class Index extends React.Component {
    actions = {
        generateGcode: () => {
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first');
                return;
            }
            
            // 开始切片
            this.props.startSlice();
        },
        exportGcode: () => {
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first');
                return;
            }
            if (!this.props.result) {
                messageI18n.warning('Generate G-code first');
                return;
            }
            const d = new Date();
            //https://blog.csdn.net/xu511739113/article/details/72764321
            const arr = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
            const fileName = arr.join("") + ".gcode";
            const {gcodeUrl} = this.props.result;

            console.log('gcodeUrl')
            console.log(gcodeUrl)

            fetch(gcodeUrl)
                .then(resp => resp.blob())
                .then(blob => {
                    FileSaver.saveAs(blob, fileName, true);
                    messageI18n.success('Export G-code success', 1);
                })
                .catch(() => {
                    console.error("down load err");
                    messageI18n.error('Export G-code failed', 1);
                });
        },
        startTask: () => {
            if (!this.props.result) {
                messageI18n.warning('Generate G-code first', 1);
                return;
            }
            const {gcodeUrl} = this.props.result;
            fetch(gcodeUrl)
                .then(resp => resp.text())
                .then(gcode => {
                    this.props.startTask(gcode, true);
                })
                .catch(() => {
                    console.error("down load error")
                });
        },
        stopTask: () => {
            this.props.stopTask();
        }
    };

    render() {
        const {t} = this.props;
        const actions = this.actions;
        return (
            <div>
                <Space 
                    direction={"vertical"} 
                    size="small"
                    style={{width: "100%", padding: "8px"}}>
                    {/* 生成gcode */}
                    <ActionButton onClick={actions.generateGcode} text={t("Generate G-code")}/>
                    {/* 导出gcode */}
                    <ActionButton onClick={actions.exportGcode} text={t("Export G-code")}/>
                    <div>
                        {/* 开始发送gcode */}
                        <ActionButton 
                            onClick={actions.startTask} 
                            text={t("Start Send G-code")}
                            style={{width: "calc(50% - 4px)", marginRight: "8px"}}
                        />
                        {/* 停止发送gcode */}
                        <ActionButton 
                            onClick={actions.stopTask} 
                            text={t("Stop Send G-code")}
                            style={{width: "calc(50% - 4px)"}}
                        />
                    </div>
                    {/* 温度显示 */}
                    <TemperatureDisplay />
                    <SettingVisibility/>
                    <MaterialSettings/>
                    <PrintSettings/>
                </Space>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {result, modelCount} = state.p3dModel;
    return {
        result,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startSlice: () => dispatch(p3dModelActions.startSlice()),
        startTask: (gcode, isAckChange) => dispatch(gcodeSendActions.startTask(gcode, isAckChange)),
        stopTask: () => dispatch(gcodeSendActions.stopTask()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

