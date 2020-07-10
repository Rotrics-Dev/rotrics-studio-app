import React, {PureComponent} from 'react';
import {Checkbox, Select, Row, Col, Divider} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../../components/Config";

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
            algorithmOptions.push({label: key, value: option})
        });

        const movementModeOptions = [];
        Object.keys(movement_mode.options).forEach((key) => {
            const option = movement_mode.options[key];
            movementModeOptions.push({label: key, value: option})
        });
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={config.label}/>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${invert.label}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${contrast.label}`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={contrast.minimum_value}
                                max={contrast.maximum_value}
                                value={contrast.default_value}
                                onAfterChange={actions.setContrast}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${brightness.label}`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={brightness.minimum_value}
                                max={brightness.maximum_value}
                                value={brightness.default_value}
                                onAfterChange={actions.setBrightness}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${white_clip.label}`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={white_clip.minimum_value}
                                max={white_clip.maximum_value}
                                value={white_clip.default_value}
                                onAfterChange={actions.setWhiteClip}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${density.label}(${density.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={density.minimum_value}
                                max={density.maximum_value}
                                value={density.default_value}
                                onAfterChange={actions.setDensity}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            <ConfigText text={`${algorithm.label}`}/>
                        </Col>
                        <Col span={14}>
                            <ConfigSelect options={algorithmOptions} value={algorithm.default_value} onChange={actions.setAlgorithm}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            <ConfigText text={`${movement_mode.label}`}/>
                        </Col>
                        <Col span={14}>
                            <ConfigSelect options={movementModeOptions} value={movement_mode.default_value} onChange={actions.setMovementMode}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config} = state.laser;
    return {
        model,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (key, value) => dispatch(laserActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigGreyscale);

