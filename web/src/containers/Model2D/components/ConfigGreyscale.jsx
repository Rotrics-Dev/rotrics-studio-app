import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../components/Config";
import Tooltip from '../../Tooltip/Index.jsx';

//props: t, model, config, updateConfig
class Index extends PureComponent {
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
        }
    };

    render() {
        const {t, model, config} = this.props;

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
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(config.label)}/>
                    <Tooltip title={t(invert.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(invert.label)}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(contrast.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(contrast.label)}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={contrast.minimum_value}
                                    max={contrast.maximum_value}
                                    value={contrast.default_value}
                                    onAfterChange={actions.setContrast}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(brightness.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(brightness.label)}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={brightness.minimum_value}
                                    max={brightness.maximum_value}
                                    value={brightness.default_value}
                                    onAfterChange={actions.setBrightness}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(white_clip.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(white_clip.label)}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={white_clip.minimum_value}
                                    max={white_clip.maximum_value}
                                    value={white_clip.default_value}
                                    onAfterChange={actions.setWhiteClip}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(density.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(density.label)}(${density.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={density.minimum_value}
                                    max={density.maximum_value}
                                    value={density.default_value}
                                    onAfterChange={actions.setDensity}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(algorithm.description)}>
                        <Row>
                            <Col span={10}>
                                <ConfigText text={t(algorithm.label)}/>
                            </Col>
                            <Col span={14}>
                                <ConfigSelect
                                    options={algorithmOptions}
                                    value={algorithm.default_value}
                                    onChange={actions.setAlgorithm}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(movement_mode.description)}>
                        <Row>
                            <Col span={10}>
                                <ConfigText text={t(movement_mode.label)}/>
                            </Col>
                            <Col span={14}>
                                <ConfigSelect
                                    options={movementModeOptions}
                                    value={movement_mode.default_value}
                                    onChange={actions.setMovementMode}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

export default Index;

