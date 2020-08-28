import React from 'react';
import {connect} from 'react-redux';
import FileSaver from 'file-saver';
import styles from './styles.css';
import {Button, Space, List} from 'antd';
import messageI18n from "../../../../utils/messageI18n";
import Transformation from './Transformation.jsx';
import ConfigSvg from './ConfigSvg.jsx';
import ConfigSvgText from './ConfigSvgText.jsx';
import WorkingParameters from './WorkingParameters.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {getBuildInSvgArray, base64ToBlob} from "../../buildInSvg";
import ActionButton from "../../../../components/ActionButton/Index.jsx";
import {getGcode4runBoundary} from "../../../../reducers/writeAndDraw";
import {withTranslation} from 'react-i18next';

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
            console.log(`before:this.props.addModel('svg', ${file});`)
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
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first');
                return;
            }
            if (!this.props.isAllPreviewed) {
                messageI18n.warning('Previewing');
                return;
            }
            const {write_and_draw} = this.props;
            this.props.generateGcode(write_and_draw);
            messageI18n.success('Generate G-code success');
        },
        exportGcode: () => {
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first');
                return ;
            }
            if (!this.props.isAllPreviewed) {
                messageI18n.warning('Previewing');
                return ;
            }
            if (!this.props.gcode) {
                messageI18n.warning('Generate G-code first');
                return ;
            }
            const date = new Date();
            //https://blog.csdn.net/xu511739113/article/details/72764321
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const fileName = arr.join("") + ".gcode";
            const gcode = this.props.gcode;
            const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, fileName, true);
            messageI18n.success('Export G-code success');
        },
        runBoundary: () => {
            this.props.start(getGcode4runBoundary(), false, false);
        },
        startTask: () => {
            if (!this.props.gcode) {
                messageI18n.warning('Generate G-code first');
                return;
            }
            this.props.start(this.props.gcode, true, false);
        },
        stopTask: () => {
            this.props.stopTask();
        }
    };

    render() {
        const {accept} = this.state;
        const {model} = this.props;
        const {t} = this.props;
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <Space direction={"vertical"} size="small"
                       style={{width: "100%", padding: "8px"}}>
                    <ActionButton onClick={actions.generateGcode} text={t("Generate G-code")}/>
                    <ActionButton onClick={actions.exportGcode} text={t("Export G-code")}/>
                    <ActionButton onClick={actions.runBoundary} text={t("Run Boundary")}/>
                    <div style={{width: "100%"}}>
                        <ActionButton onClick={actions.startTask} text={t("Start Send")}
                                      style={{width: "calc(50% - 4px)", marginRight: "8px"}}/>
                        <ActionButton onClick={actions.stopTask} text={t("Stop Send")}
                                      style={{width: "calc(50% - 4px)"}}/>
                    </div>
                </Space>
                <Line/>
                {/*<h4 style={{*/}
                {/*    padding: "10px 0 0 10px",*/}
                {/*}}>{t(model ? model.fileType : "")}</h4>*/}
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={accept}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <Space direction={"horizontal"} style={{width: "100%", paddingLeft: "10px", paddingTop: "10px"}}
                       size={16}>
                    <button
                        className={styles.btn_select}
                        onClick={() => {
                            this.buildInSvgList.current.style.display = 'block'
                        }}
                    >
                        <h6 className={styles.h_file_type}>{t('SELECT')}</h6>
                    </button>
                    <button
                        className={styles.btn_svg}
                        onClick={() => actions.onClickToUpload('svg')}
                    >
                        <h6 className={styles.h_file_type}>{t('SVG')}</h6>
                    </button>
                    <button
                        className={styles.btn_text}
                        onClick={() => actions.onClickToUpload('text')}
                    >
                        <h6 className={styles.h_file_type}>{t('TEXT')}</h6>
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
                <ConfigSvg/>
                <ConfigSvgText/>
                <Transformation/>
                <WorkingParameters/>
                <div style={{height: "15px"}}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status} = state.serialPort;
    const {gcode, model, modelCount, isAllPreviewed, write_and_draw} = state.writeAndDraw;
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
        start: (gcode, isTask, isLaser) => dispatch(gcodeSendActions.start(gcode, isTask, isLaser)),
        stopTask: () => dispatch(gcodeSendActions.stopTask()),
        //model
        addModel: (fileType, file) => dispatch(writeAndDrawActions.addModel(fileType, file)),
        generateGcode: (write_and_draw) => dispatch(writeAndDrawActions.generateGcode(write_and_draw)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
