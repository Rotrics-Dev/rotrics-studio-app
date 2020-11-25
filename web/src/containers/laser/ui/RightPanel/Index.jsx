import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Space} from 'antd';
import ConfigBW from '../../../Model2D/components/ConfigBW.jsx';
import ConfigGreyscale from '../../../Model2D/components/ConfigGreyscale.jsx';
import ConfigText from '../../../Model2D/components/ConfigText.jsx';
import ConfigSvg from '../../../Model2D/components/ConfigSvg.jsx';
import Transformation from '../../../Model2D/components/Transformation.jsx';
import WorkingParameters from '../../../Model2D/components/WorkingParameters.jsx';
import {actions as laserActions} from "../../../../reducers/laser";
import configText from "../../../Model2D/settings/config/text.json";
import Model2D from "../../../Model2D/Model2D.js";
import styles from './styles.css';
import {generateSvg2, uploadImage} from "../../../../api";

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        fileType: '',
        accept: '',
    };

    actions = {
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const fileType = this.state.fileType; // bw, greyscale, svg
            const response = await uploadImage(file);
            const {url, width, height} = response;
            console.log(url, width, height);
            const model = new Model2D(fileType);
            model.loadImg(url, width, height);
            this.props.addModel(model);
        },
        onClickToUpload: async (fileType) => {
            switch (fileType) {
                case "text":
                    const text = configText.children.text.default_value;
                    const font = configText.children.font.default_value;
                    const font_size = configText.children.font_size.default_value;
                    const svg = await generateSvg2(text, font, font_size);
                    const filename = "text.svg";
                    const blob = new Blob([svg], {type: 'text/plain'});
                    const file = new File([blob], filename);
                    const response = await uploadImage(file);
                    const {url, width, height} = response;
                    console.log(url, width, height);
                    const model = new Model2D(fileType);
                    model.loadImg(url, width, height);
                    this.props.addModel(model);
                    break;
                case "bw":
                case "greyscale":
                    // Jimp support file format: https://github.com/oliver-moran/jimp
                    // TODO: parse .tiff error
                    // Error: read ECONNRESET at TCP.onStreamRead (internal/stream_base_commons.js:205:27)
                    this.setState({
                        fileType,
                        accept: '.bmp, .gif, .jpeg, .jpg, .png, .tiff'
                    }, () => {
                        this.fileInput.current.value = null;
                        this.fileInput.current.click();
                    });
                    break;
                case "svg":
                    this.setState({
                        fileType,
                        accept: '.svg'
                    }, () => {
                        this.fileInput.current.value = null;
                        this.fileInput.current.click();
                    });
                    break;
            }
        }
    };

    render() {
        const {t, model, config, transformation, working_parameters, updateConfig, updateTransformation, updateWorkingParameters, buildInFonts, userFonts} = this.props;
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
                        <h6 className={styles.h_file_type}>{t('Greyscale')}</h6>
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
                        <h6 className={styles.h_file_type}>{t('Text')}</h6>
                    </button>
                </Space>
                <ConfigBW
                    t={t}
                    model={model}
                    config={config}
                    updateConfig={updateConfig}
                />
                <ConfigGreyscale
                    t={t}
                    model={model}
                    config={config}
                    updateConfig={updateConfig}
                />
                <ConfigSvg
                    t={t}
                    model={model}
                    config={config}
                    updateConfig={updateConfig}
                />
                <ConfigText
                    t={t}
                    model={model}
                    config={config}
                    updateConfig={updateConfig}
                    buildInFonts={buildInFonts}
                    userFonts={userFonts}
                />
                <Transformation
                    t={t}
                    model={model}
                    transformation={transformation}
                    updateTransformation={updateTransformation}
                />
                <WorkingParameters
                    t={t}
                    model={model}
                    working_parameters={working_parameters}
                    updateWorkingParameters={updateWorkingParameters}
                    config={config}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {model, config, transformation, working_parameters} = state.laser;
    const {buildInFonts, userFonts} = state.fonts;
    return {
        model,
        config,
        transformation,
        working_parameters,
        buildInFonts,
        userFonts,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        addModel: (model) => dispatch(laserActions.addModel(model)),
        updateConfig: (key, value) => dispatch(laserActions.updateConfig(key, value)),
        updateTransformation: (key, value, preview) => dispatch(laserActions.updateTransformation(key, value, preview)),
        updateWorkingParameters: (key, value) => dispatch(laserActions.updateWorkingParameters(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
