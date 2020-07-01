import React from 'react';
import styles from './styles.css';
import {message, Space, Button} from 'antd';
import Material from './Material.jsx';
import Setting from './Setting.jsx';
import FileSaver from 'file-saver';
import {exportModelsToBlob, actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {connect} from 'react-redux';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";

class Index extends React.Component {
    state = {};

    actions = {
        exportModel: () => {
            if (this.actions._checkStatus4gcode("exportModel")) {
                const blob = exportModelsToBlob()
                const date = new Date();
                const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                const fileName = arr.join("") + ".stl";
                FileSaver.saveAs(blob, fileName, true);
                message.success('Export model success', 1);
            }
        },
        generateGcode: () => {
            if (this.actions._checkStatus4gcode("exportModel")) {
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
                        // message.success('Export G-code success', 1);
                        message.error('Export G-code error', 1);
                    })
                    .catch(() => {
                        console.error("down load err")
                        message.error('Export G-code error', 1);
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
                case "exportModel": {
                    if (this.props.modelCount === 0) {
                        message.warning('Load model first', 1);
                        return false;
                    }
                    break;
                }
                case "exportGcode": {
                    if (this.props.modelCount === 0) {
                        message.warning('Load model first', 1);
                        return false;
                    }
                    if (!this.props.result) {
                        message.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
                }
                case "startSendGcode":
                    console.log("result: " + JSON.stringify(this.props.result))
                    if (!this.props.result) {
                        message.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
                case "stopSendGcode":
                    if (!this.props.result) {
                        message.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
            }
            return true;
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

export default connect(mapStateToProps, mapDispatchToProps)(Index);
