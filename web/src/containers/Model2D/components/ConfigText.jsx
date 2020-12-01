import React, {PureComponent} from 'react';
import {Checkbox, Input, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../components/Config";

//props: t, model, config, buildInFonts, userFonts
class Index extends PureComponent {
    actions = {
        setText: (e) => {
            if (e.target.value.trim().length > 0) {
                this.props.model.updateConfig("text", e.target.value.trim())
            }
        },
        setFont: (value) => {
            this.props.model.updateConfig("font", value)
        },
        setFontSize: (value) => {
            this.props.model.updateConfig("font_size", value)
        },
        setOptimizePath: (e) => {
            this.props.model.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            this.props.model.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            this.props.model.updateConfig("fill.fill_density", value);
        }
    };

    render() {
        const {t, model, config, buildInFonts, userFonts} = this.props;

        if (!model || model.fileType !== "text" || !config) {
            return null;
        }

        const actions = this.actions;
        const {text, font, font_size, optimize_path, fill} = config.children;
        const {fill_density} = fill.children;

        const fontOptions = [];
        for (const font of buildInFonts) {
            fontOptions.push({label: font.fontName, value: font.path})
        }
        for (const font of userFonts) {
            fontOptions.push({label: font.fontName, value: font.path, color: '#007777'})
        }

        return (
            <div>
                <Line/>
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(config.label)}/>
                    <Tooltip title={t(text.description)}>
                        <Row>
                            <Col span={13}>
                                <ConfigText text={t(text.label)}/>
                            </Col>
                            <Col span={11}>
                                <Input.TextArea
                                    style={{fontSize: "12px", resize: "none"}}
                                    value={text.default_value}
                                    onChange={actions.setText}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(font.description)}>
                        <Row>
                            <Col span={13}>
                                <ConfigText text={t(font.label)}/>
                            </Col>
                            <Col span={11}>
                                <ConfigSelect
                                    options={fontOptions}
                                    value={font.default_value}
                                    onChange={actions.setFont}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(font_size.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(font_size.label)}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={font_size.minimum_value}
                                    max={font_size.maximum_value}
                                    value={font_size.default_value}
                                    onAfterChange={actions.setFontSize}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(optimize_path.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(optimize_path.label)}`}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(fill.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(fill.label)}`}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    {fill.default_value &&
                    <Tooltip title={t(fill_density.description)}>
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
                    </Tooltip>
                    }
                </div>
            </div>
        );
    }
}

export default Index;

