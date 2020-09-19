import React from 'react';
import {connect} from 'react-redux';
import FileSaver from 'file-saver';
import styles from './styles.css';
import {Space} from 'antd';
import messageI18n from "../../../../utils/messageI18n";
import Transformation from './Transformation.jsx';
import ConfigGreyscale from './ConfigGreyscale.jsx';
import ConfigBW from './ConfigBW.jsx';
import ConfigSvg from './ConfigSvg.jsx';
import ConfigSvgText from './ConfigSvgText.jsx';
import WorkingParameters from './WorkingParameters.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as laserActions} from "../../../../reducers/laser";
import ActionButton from "../../../../components/ActionButton/Index.jsx";
import {getGcode4runBoundary} from "../../../../reducers/laser";
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
    state = {
        fileType: '', // bw, greyscale, svg, text
        accept: '',
    };

    actions = {
        onChangeFile: (event) => {
            //bw, greyscale, svg
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            this.props.addModel(fileType, file);
        },
        onClickToUpload: (fileType) => {
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
            this.props.generateGcode();
            messageI18n.success('Generate G-code success', 1);
        },
        exportGcode: () => {
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first');
                return;
            }
            if (!this.props.isAllPreviewed) {
                messageI18n.warning('Previewing');
                return;
            }
            if (!this.props.gcode) {
                messageI18n.warning('Generate G-code first');
                return;
            }
            const d = new Date();
            const filname = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join("") + ".gcode";;
            const gcode = this.props.gcode;
            const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(blob, filname, true);
            messageI18n.success('Export G-code success');
        },
        runBoundary: () => {
            this.props.startTask(getGcode4runBoundary(), false)
        },
        startTask: () => {
            if (!this.props.gcode) {
                messageI18n.warning('Generate G-code first');
                return;
            }
            this.props.startTask(this.props.gcode, true, true);
        },
        stopTask: () => {
            this.props.stopTask();
        },
        pauseTask: () => {
            this.props.pauseTask();
        },
        resumeTask: () => {
            this.props.resumeTask();
        }
    };

    render() {
        const {t} = this.props;
        const {accept} = this.state;
        const {model} = this.props;
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
                    <div style={{width: "100%"}}>
                        <ActionButton onClick={actions.pauseTask} text={t("Pause Send")}
                                      style={{width: "calc(50% - 4px)", marginRight: "8px"}}/>
                        <ActionButton onClick={actions.resumeTask} text={t("Resume Send")}
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
                        className={styles.btn_bw}
                        onClick={() => actions.onClickToUpload('bw')}
                    >
                        <h6 className={styles.h_file_type}>{t('B&W')}</h6>
                    </button>
                    <button
                        className={styles.btn_greyscale}
                        onClick={() => actions.onClickToUpload('greyscale')}
                    >
                        <h6 className={styles.h_file_type}>{t('GREYSCALE')}</h6>
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
                <ConfigGreyscale/>
                <ConfigBW/>
                <ConfigSvg/>
                <ConfigSvgText/>
                <Transformation/>
                <WorkingParameters/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {gcode, model, modelCount, isAllPreviewed} = state.laser;
    return {
        gcode,
        model,
        isAllPreviewed,
        modelCount,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startTask: (gcode, isAckChange, isLaser) => dispatch(gcodeSendActions.startTask(gcode, isAckChange, isLaser)),
        stopTask: () => dispatch(gcodeSendActions.stopTask()),
        pauseTask: () => dispatch(gcodeSendActions.pauseTask()),
        resumeTask: () => dispatch(gcodeSendActions.resumeTask()),
        //model
        addModel: (fileType, file) => dispatch(laserActions.addModel(fileType, file)),
        generateGcode: () => dispatch(laserActions.generateGcode()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
