import React, {PureComponent} from 'react';
import {Checkbox, Select, Input, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';

class ConfigSvgText extends PureComponent {
    actions = {
        //config text
        setText: (e) => {
            if (e.target.value.trim().length > 0) {
                this.props.updateConfigText("text", e.target.value.trim())
            }
        },
        setFont: (value) => {
            this.props.updateConfigText("font", value)
        },
        setFontSize: (value) => {
            this.props.updateConfigText("font_size", value)
        },
        //config
        setOptimizePath: (e) => {
            this.props.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            this.props.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            this.props.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        const {t} = this.props;
        const {model, config_text, config} = this.props;
        if (!model || model.fileType !== "text" || !config_text || !config) {
            return null;
        }
        const actions = this.actions;

        const {text, font, font_size} = config_text.children;

        const fontOptions = [];
        Object.keys(font.options).forEach((key) => {
            const option = font.options[key];
            fontOptions.push({label: key, value: option})
        });

        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;

        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(config.label)}/>
                    <Row>
                        <Col span={13}>
                            <ConfigText text={`${t(text.label)}`}/>
                        </Col>
                        <Col span={11}>
                            <Input.TextArea style={{fontSize: "12px"}} value={text.default_value}
                                            autoSize={{minRows: 1, maxRows: 1}}
                                            onChange={actions.setText}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={13}>
                            <ConfigText text={`${t(font.label)}`}/>
                        </Col>
                        <Col span={11}>
                            <ConfigSelect options={fontOptions} value={font.default_value} onChange={actions.setFont}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${t(font_size.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={font_size.minimum_value}
                                max={font_size.maximum_value}
                                value={font_size.default_value}
                                onAfterChange={actions.setFontSize}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${t(optimize_path.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${t(fill.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                        </Col>
                    </Row>
                    {fill.default_value &&
                    <Row>
                        <Col span={17} push={2}>
                            <ConfigText text={`${t(fill_density.label)}`}/>
                        </Col>
                        <Col span={5} push={2}>
                            <NumberInput
                                min={fill_density.minimum_value}
                                max={fill_density.maximum_value}
                                value={fill_density.default_value}
                                onAfterChange={actions.setFillDensity}/>
                        </Col>
                    </Row>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config, config_text} = state.laser;
    return {
        model,
        config,
        config_text
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfigText: (key, value) => dispatch(laserActions.updateConfigText(key, value)),
        updateConfig: (key, value) => dispatch(laserActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ConfigSvgText));

