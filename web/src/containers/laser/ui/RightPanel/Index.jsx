import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {Space} from 'antd';
import Transformation from './Transformation.jsx';
import ConfigGreyscale from './ConfigGreyscale.jsx';
import ConfigBW from './ConfigBW.jsx';
import ConfigSvg from './ConfigSvg.jsx';
import ConfigSvgText from './ConfigSvgText.jsx';
import WorkingParameters from './WorkingParameters.jsx';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as laserActions} from "../../../../reducers/laser";
import {withTranslation} from 'react-i18next';
import {TAP_LASER} from "../../../../constants.js";

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
        }
    };

    render() {
        const {t} = this.props;
        const {accept} = this.state;
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
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

const mapDispatchToProps = (dispatch) => {
    return {
        addModel: (fileType, file) => dispatch(laserActions.addModel(fileType, file)),
        generateGcode: () => dispatch(laserActions.generateGcode()),
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Index));
