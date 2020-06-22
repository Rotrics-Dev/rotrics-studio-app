import React from 'react';
import {connect} from 'react-redux';
import FileSaver from 'file-saver';

import styles from './styles.css';
import {Button, Space, message, List} from 'antd';

import "antd/dist/antd.css";

import Transformation from './Transformation.jsx';

import ConfigSvg from './ConfigSvg.jsx';
import ConfigText from './ConfigText.jsx';

import WorkingParameters from './WorkingParameters.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {getBuildInSvgArray, base64ToBlob} from "../../buildInSvg";
import {uploadImage} from '../../../../api/';
import Model2D from "../../lib/Model2D";
//Jimp支持的文件格式  https://github.com/oliver-moran/jimp
const getAccept = (fileType) => {
    let accept = '';
    switch (fileType) {
        case "bw":
        case "greyscale":
            //TODO: .tiff读取报错
            // Error: read ECONNRESET
            //       at TCP.onStreamRead (internal/stream_base_commons.js:205:27)
            // accept = '.bmp, .gif, .jpeg, .jpg, .png, .tiff';
            accept = '.bmp, .gif, .jpeg, .jpg, .png';
            break;
        case "svg":
        case "text":
            accept = '.svg';
            break;
    }
    return accept;
};

class Index extends React.Component {
    fileInput = React.createRef();
    buildInSvgList = React.createRef();
    state = {
        fileType: '', // bw, greyscale, svg, text
        accept: '',
    };

    actions = {
        onChooseBuildInSvg: async (event) => {
            this.buildInSvgList.current.style.display = "none";//关闭点选 buildinSvg List
            const filename = "select.svg";
            const blob = base64ToBlob(event.target.src.toString());
            const file = new File([blob], filename);
            this.props.addModel('svg', file);
        },


        onChangeFile: async (event) => {
            //bw, greyscale, svg
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            this.props.addModel(fileType, file);
        },
        onClickToUpload: async (fileType) => {
            this.buildInSvgList.current.style.display = "none";//关闭点选 buildinSvg List
            if (fileType === "text") {
                this.props.addModel(fileType);
            } else {
                this.setState({
                    fileType,
                    accept: getAccept(fileType)
                }, () => {
                    this.fileInput.current.value = null;
                    this.fileInput.current.click();
                });
            }
        },
        generateGcode: () => {
            if (this.actions._checkStatus4gcode("generateGcode")) {
                const {write_and_draw} = this.props;
                this.props.generateGcode(write_and_draw);
                message.success('Generate G-code success', 1);
            }
        },
        exportGcode: () => {
            if (this.actions._checkStatus4gcode("exportGcode")) {
                const date = new Date();
                //https://blog.csdn.net/xu511739113/article/details/72764321
                const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                const fileName = arr.join("") + ".gcode";
                const gcode = this.props.gcode;
                const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
                FileSaver.saveAs(blob, fileName, true);
            }
        },
        startSendGcode: () => {
            //todo：serialport状态
            const gcode = this.props.gcode;
            this.props.startSendGcode(gcode);
        },
        stopSendGcode: () => {
            //todo：serialport状态
            this.props.stopSendGcode();
        },
        _checkStatus4gcode: (type) => {
            switch (type) {
                case "generateGcode": {
                    if (this.props.modelCount === 0) {
                        message.warning('Load model first', 1);
                        return false;
                    }
                    if (!this.props.isAllPreviewed) {
                        message.warning('Previewing', 1);
                        return false;
                    }
                    break;
                }
                case "exportGcode": {
                    if (this.props.modelCount === 0) {
                        message.warning('Load model first', 1);
                        return false;
                    }
                    if (!this.props.isAllPreviewed) {
                        message.warning('Previewing', 1);
                        return false;
                    }
                    if (this.props.gcode.length === 0) {
                        message.warning('Generate G-code first', 1);
                        return false;
                    }
                    break;
                }
                case "startSendGcode":
                    break;
                case "stopSendGcode":
                    break;
            }
            return true;
        },
    };

    render() {
        const {accept} = this.state;
        const {model} = this.props;
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <Space direction={"vertical"} style={{width: "100%", paddingLeft: "5px", paddingRight: "5px"}}>
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
                <Line/>
                <h4 style={{
                    paddingLeft: "10px",
                    color: "grey"
                }}> {" selected image type: " + (model ? model.fileType : "")}</h4>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={accept}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <Space direction={"horizontal"} style={{width: "100%", paddingLeft: "7px"}} size={7}>
                    <button
                        className={styles.btn_select}
                        onClick={() => {
                            this.buildInSvgList.current.style.display = 'block'
                        }}
                    >
                        <h6 className={styles.h_file_type}>SELECT</h6>
                    </button>
                    <button
                        className={styles.btn_svg}
                        onClick={() => actions.onClickToUpload('svg')}
                    >
                        <h6 className={styles.h_file_type}>SVG</h6>
                    </button>
                    <button
                        className={styles.btn_text}
                        onClick={() => actions.onClickToUpload('text')}
                    >
                        <h6 className={styles.h_file_type}>TEXT</h6>
                    </button>
                </Space>
                <div
                    ref={this.buildInSvgList}
                    style={{width: "100%", padding: "5px 5px 5px 20px", display: "none"}}>
                    <List
                        grid={{gutter: 4, column: 4}}
                        dataSource={getBuildInSvgArray()}
                        renderItem={(item, index) => (
                            <List.Item>
                                <img className={styles.img_list_item} src={item} onClick={actions.onChooseBuildInSvg}/>
                            </List.Item>
                        )}
                    />
                </div>
                <Transformation/>
                <ConfigSvg/>
                <ConfigText/>
                <WorkingParameters/>
                <div style={{height: "15px"}}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status} = state.serialPort;
    const {gcode, model, modelCount, isAllPreviewed, write_and_draw} = state.writeAndDraw;
    let fileTypeSelected = model ? model.fileType : "";
    return {
        serialPortStatus: status,
        gcode,
        model,
        isAllPreviewed,
        modelCount,
        write_and_draw
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startSendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        stopSendGcode: () => dispatch(gcodeSendActions.stop()),
        //model
        addModel: (fileType, file) => dispatch(writeAndDrawActions.addModel(fileType, file)),
        generateGcode: (write_and_draw) => dispatch(writeAndDrawActions.generateGcode(write_and_draw)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
