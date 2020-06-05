import React, {PureComponent} from 'react';
import {Checkbox, Select, Input, Row, Col} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import {actions as writeAndDrawTextActions} from '../../../../reducers/writeAndDrawText';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import _ from 'lodash';
import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';

class ConfigText extends PureComponent {
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
        const {model, config_text, config} = this.props;
        // console.log("write render" + (model));
        // console.log("write render" + (!model));
        // console.log("write render" + (!model || model.fileType !== "text"));
        // console.log("write render" + (!model || model.fileType !== "text" || !config_text));
        // console.log("write render" + (!model || model.fileType !== "text" || !config_text || !config));

        if (!model || model.fileType !== "text" || !config_text || !config) {
            return null;
        }

        const actions = this.actions;

        const {text, font, font_size} = config_text.children;

        const fontOptions = [];
        Object.keys(font.options).forEach((key) => {
            const option = font.options[key];
            fontOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;

        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    <h4>{config_text.label}</h4>
                    <Row>
                    {/*    <Col span={10}>*/}
                    {/*        <span>{text.label}</span>*/}
                    {/*    </Col>*/}
                    {/*    <Col span={14}>*/}
                            <Input.TextArea value={text.default_value} autoSize={{minRows: 1, maxRows: 1}}
                                            onChange={actions.setText}
                            />
                    {/*    </Col>*/}
                    </Row>
                    <Row>
                        <Col span={10}>
                            <span>{font.label}</span>
                        </Col>
                        <Col span={14}>
                            <Select value={font.default_value} style={{width: "100%"}}
                                    onChange={actions.setFont}>
                                {fontOptions}
                            </Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{font_size.label}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={font_size.minimum_value} max={font_size.maximum_value}
                                         value={toFixed(font_size.default_value, 0)}
                                         onChange={actions.setFontSize}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{optimize_path.label}</span>
                        </Col>
                        <Col span={9}>
                            <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{fill.label}</span>
                        </Col>
                        <Col span={9}>
                            <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                        </Col>
                    </Row>
                    {fill.default_value &&
                    <Row>
                        <Col span={13} push={2}>
                            <span>{fill_density.label}</span>
                        </Col>
                        <Col span={9} push={2}>
                            <NumberInput min={fill_density.minimum_value} max={fill_density.maximum_value}
                                         value={toFixed(fill_density.default_value, 0)}
                                         onChange={actions.setFillDensity}/>
                        </Col>
                    </Row>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    // console.log("chenmapStateToProps1" + JSON.stringify(state.writeAndDraw.config))
    // console.log("chenmapStateToProps2" + JSON.stringify(state.writeAndDrawText))
    const {model, config} = state.writeAndDraw;
    const {config_text} = state.writeAndDrawText;
    return {
        model,
        config,
        config_text
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfigText: (key, value) => dispatch(writeAndDrawTextActions.updateConfigText(key, value)),
        updateConfig: (key, value) => dispatch(writeAndDrawActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigText);

