import React, {PureComponent} from 'react';
import {Checkbox, Select, Row, Col, Divider} from 'antd';
import laserManager from "../../lib/laserManager.js";
import {toFixed} from '../../../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'

class ConfigGreyscale extends PureComponent {
    state = {
        model2d: null,
        config: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let config = model2d ? _.cloneDeep(model2d.settings.config) : null;
              this.setState({
                model2d,
                config
            })
        });
    }

    actions = {
        setInvert: (e) => {
            laserManager.updateConfig("invert", e.target.checked)
        },
        setContrast: (value) => {
            laserManager.updateConfig("contrast", value)
        },
        setBrightness: (value) => {
            laserManager.updateConfig("brightness", value)
        },
        setWhiteClip: (value) => {
            laserManager.updateConfig("white_clip", value)
        },
        setAlgorithm: (value) => {
            laserManager.updateConfig("algorithm", value)
        },
        setMovementMode: (value) => {
            laserManager.updateConfig("movement_mode", value)
        },
        setDensity: (value) => {
            laserManager.updateConfig("density", value)
        },
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "greyscale") {
            return null;
        }
        const actions = this.actions;
        const {config} = this.state;
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

export default ConfigGreyscale;

