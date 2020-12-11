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
import {actions as model2dActions} from "../../../../reducers/model2d";
import styles from './styles.css';
import Model2D from "../../../Model2D/Model2D.js";

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        fileType: '', // bw, greyscale, svg, text
        accept: '',
    };

    actions = {
        onChangeFile: async (event) => {
            const {fileType} = this.state;
            const file = event.target.files[0];
            const model = new Model2D(fileType, 'laser', file);
            await model.init();
            this.props.addModel(model);
        },
        onClickToUpload: async (fileType) => {
            switch (fileType) {
                case "text":
                    const model = new Model2D(fileType, 'laser');
                    await model.init();
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
        const {t, model, config, transformation, working_parameters, buildInFonts, userFonts} = this.props;
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
                <Space
                    direction={"horizontal"}
                    style={{width: "100%", paddingLeft: "10px", paddingTop: "10px"}}
                    size={16}
                >
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
                />
                <ConfigGreyscale
                    t={t}
                    model={model}
                    config={config}
                />
                <ConfigSvg
                    t={t}
                    model={model}
                    config={config}
                />
                <ConfigText
                    t={t}
                    model={model}
                    config={config}
                    buildInFonts={buildInFonts}
                    userFonts={userFonts}
                />
                <Transformation
                    t={t}
                    model={model}
                    transformation={transformation}
                />
                <WorkingParameters
                    t={t}
                    model={model}
                    working_parameters={working_parameters}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {modelLaser: model, configLaser: config, transformationLaser: transformation, workingParametersLaser: working_parameters} = state.model2d;
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
        addModel: (model) => dispatch(model2dActions.addModel('laser', model)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
