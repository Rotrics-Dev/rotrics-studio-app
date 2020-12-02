import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Space, List} from 'antd';
import ConfigText from '../../../Model2D/components/ConfigText.jsx';
import ConfigSvg from '../../../Model2D/components/ConfigSvg.jsx';
import Transformation from '../../../Model2D/components/Transformation.jsx';
import WorkingParameters from '../../../Model2D/components/WorkingParameters.jsx';
import {actions as model2dActions} from "../../../../reducers/model2d";
import styles from './styles.css';
import Model2D from "../../../Model2D/Model2D.js";
import {base64ToBlob, getExampleSvgArray} from "../../buildInSvg";

class Index extends React.Component {
    fileInput = React.createRef();

    state={
        exampleListVisible: false
    };

    actions = {
        loadExampleSvg: async (event) => {
            const blob = base64ToBlob(event.target.src.toString());
            const file = new File([blob], "write_draw.svg");
            const model = new Model2D('svg', 'write_draw', file);
            await model.init();
            this.props.addModel(model);
        },
        onClickExample: () => {
            this.setState({exampleListVisible: true})
        },
        onClickSvg: () => {
            this.setState({exampleListVisible: false})
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        onClickText: async () => {
            this.setState({exampleListVisible: false})
            const fileType = 'text';
            const front_end = 'laser';
            const model = new Model2D(fileType, front_end);
            await model.init();
            this.props.addModel(model);
        },
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const model = new Model2D('svg', 'write_draw', file);
            await model.init();
            this.props.addModel(model);
        }
    };

    render() {
        const {t, model, config, transformation, working_parameters, updateConfig, updateTransformation, updateWorkingParameters, buildInFonts, userFonts} = this.props;
        const actions = this.actions;
        const {exampleListVisible} = this.state;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept=".svg"
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <Space
                    direction={"horizontal"}
                    style={{width: "100%", paddingLeft: "10px", paddingTop: "10px"}}
                    size={16}
                >
                    <button className={styles.btn_example} onClick={actions.onClickExample}>
                        <h6 className={styles.h_file_type}>{t('Example')}</h6>
                    </button>
                    <button className={styles.btn_svg} onClick={actions.onClickSvg}>
                        <h6 className={styles.h_file_type}>{t('SVG')}</h6>
                    </button>
                    <button className={styles.btn_svg} onClick={actions.onClickText}>
                        <h6 className={styles.h_file_type}>{t('Text')}</h6>
                    </button>
                </Space>
                {!exampleListVisible &&
                <div>
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
                }
                {exampleListVisible &&
                <div style={{padding: "30px"}}>
                    <List
                        grid={{gutter: 4, column: 4}}
                        dataSource={getExampleSvgArray()}
                        renderItem={(item) => (
                            <List.Item>
                                <img className={styles.img_list_item} src={item} onClick={actions.loadExampleSvg}/>
                            </List.Item>
                        )}
                    />
                </div>
                }


            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {modelWriteDraw: model, configWriteDraw: config, transformationWriteDraw: transformation, workingParametersWriteDraw: working_parameters} = state.model2d;
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
        addModel: (model) => dispatch(model2dActions.addModel('write_draw', model)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
