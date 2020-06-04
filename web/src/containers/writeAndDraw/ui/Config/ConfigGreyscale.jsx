import React, {PureComponent} from 'react';
import {Checkbox, Select, Row, Col, Divider} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';

class ConfigGreyscale extends PureComponent {
    actions = {
        setInvert: (e) => {
            this.props.updateConfig("invert", e.target.checked)
        },
        setContrast: (value) => {
            this.props.updateConfig("contrast", value)
        },
        setBrightness: (value) => {
            this.props.updateConfig("brightness", value)
        },
        setWhiteClip: (value) => {
            this.props.updateConfig("white_clip", value)
        },
        setAlgorithm: (value) => {
            this.props.updateConfig("algorithm", value)
        },
        setMovementMode: (value) => {
            this.props.updateConfig("movement_mode", value)
        },
        setDensity: (value) => {
            this.props.updateConfig("density", value)
        },
    };

    render() {
        const {model, config} = this.props;
        if (!model || model.fileType !== "greyscale" || !config) {
            return null;
        }
        const actions = this.actions;
        const {invert, contrast, brightness, white_clip, algorithm, movement_mode, density} = config.children;

        const algorithmOptions = [];
        Object.keys(algorithm.options).forEach((key) => {
            const option = algorithm.options[key];
            algorithmOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        const movementModeOptions = [];
        Object.keys(movement_mode.options).forEach((key) => {
            const option = movement_mode.options[key];
            movementModeOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        return (
            <React.Fragment>
                <Line/>
                <h4>{config.label}</h4>

                <Row>
                    <Col span={11}>
                        <span>{invert.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                    </Col>
                </Row>

                <Row>
                    <Col span={11}>
                        <span>{contrast.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={contrast.minimum_value} max={contrast.maximum_value}
                                     value={toFixed(contrast.default_value, 0)}
                                     onChange={actions.setContrast}/>
                    </Col>
                </Row>


                <Row>
                    <Col span={11}>
                        <span>{brightness.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={brightness.minimum_value} max={brightness.maximum_value}
                                     value={toFixed(brightness.default_value, 0)}
                                     onChange={actions.setBrightness}/>
                    </Col>
                </Row>

                <Row>
                    <Col span={11}>
                        <span>{white_clip.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={white_clip.minimum_value} max={white_clip.maximum_value}
                                     value={toFixed(white_clip.default_value, 0)}
                                     onChange={actions.setWhiteClip}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{algorithm.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Select value={algorithm.default_value} style={{width: 180}}
                                onChange={actions.setAlgorithm}>
                            {algorithmOptions}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{movement_mode.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Select value={movement_mode.default_value} style={{width: 180}}
                                onChange={actions.setMovementMode}>
                            {movementModeOptions}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{density.label}</span>
                        <span>{"(" + density.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={density.minimum_value} max={density.maximum_value}
                                     value={toFixed(density.default_value, 0)}
                                     onChange={actions.setDensity}/>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config} = state.writeAndDraw;
    return {
        model,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (key, value) => dispatch(writeAndDrawActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigGreyscale);

