import React from 'react';
import styles from './styles.css';
import {Tabs, Space, Button} from 'antd';
import Material from './Material.jsx';
import Setting from './Setting.jsx';
import p3dModelManager from "../../lib/p3dModelManager";
import FileSaver from 'file-saver';
import {actions as p3dGcodeActions} from "../../../../reducers/p3dGcode";
import {connect} from 'react-redux';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";

class Index extends React.Component {
    state = {};

    actions = {
        exportModel: () => {
            const blob = p3dModelManager.exportModelsToBlob()
            const date = new Date();
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const fileName = arr.join("") + ".stl";
            FileSaver.saveAs(blob, fileName, true);
        },
        generateGcode: () => {
            this.props.startSlice();
        },
        exportGcode: () => {
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
                    console.log("down load ok")
                })
                .catch(() => {
                    console.error("down load err")
                });
        },
        startSendGcode: () => {
            //todo：serialport状态
            const {gcodeUrl} = this.props.result;
            fetch(gcodeUrl)
                .then(resp => resp.text())
                .then(text => {
                    this.props.startSendGcode(text);
                })
                .catch(() => {
                    console.error("down load err")
                });
        },
        stopSendGcode: () => {
            //todo：serialport状态
            this.props.stopSendGcode();
        },
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <Space direction={"vertical"} style={{width: "100%", paddingLeft: "5px", paddingRight: "5px"}}>
                    <Button
                        block
                        onClick={actions.exportModel}
                    >
                        {"Export Model"}
                    </Button>
                    <Button
                        block
                        onClick={actions.generateGcode}
                    >
                        {"Generate G-code"}
                    </Button>
                    <Button
                        block
                        onClick={actions.exportGcode}
                    >
                        {"Export G-code"}
                    </Button>
                    <Button
                        block
                        onClick={actions.startSendGcode}
                    >
                        {"Start Send"}
                    </Button>
                    <Button
                        block
                        onClick={actions.stopSendGcode}
                    >
                        {"Stop Send"}
                    </Button>
                </Space>
                <Material/>
                <Setting/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {result} = state.p3dGcode;
    return {
        result
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startSlice: () => dispatch(p3dGcodeActions.startSlice()),
        startSendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        stopSendGcode: () => dispatch(gcodeSendActions.stop()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
