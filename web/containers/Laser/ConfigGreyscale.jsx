import React, {PureComponent} from 'react';
import {Checkbox, Select} from 'antd';
import laserManager from "../../laser/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import NumberInput from '../../components/NumberInput/Index.jsx';

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
                <h2>{config.label}</h2>
                <div>
                    <span>{invert.label}</span>
                    <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                </div>
                <div>
                    <span>{contrast.label}</span>
                    <NumberInput min={contrast.minimum_value} max={contrast.maximum_value}
                                 value={toFixed(contrast.default_value, 0)}
                                 onChange={actions.setContrast}/>
                </div>

                <div>
                    <span>{brightness.label}</span>
                    <NumberInput min={brightness.minimum_value} max={brightness.maximum_value}
                                 value={toFixed(brightness.default_value, 0)}
                                 onChange={actions.setBrightness}/>
                </div>

                <div>
                    <span>{white_clip.label}</span>
                    <NumberInput min={white_clip.minimum_value} max={white_clip.maximum_value}
                                 value={toFixed(white_clip.default_value, 0)}
                                 onChange={actions.setWhiteClip}/>
                </div>

                <div>
                    <span>{algorithm.label}</span>
                    <Select value={algorithm.default_value} style={{width: 110}}
                            onChange={actions.setAlgorithm}>
                        {algorithmOptions}
                    </Select>
                </div>

                <div>
                    <span>{movement_mode.label}</span>
                    <Select value={movement_mode.default_value} style={{width: 110}}
                            onChange={actions.setMovementMode}>
                        {movementModeOptions}
                    </Select>
                </div>

                <div>
                    <span>{density.label}</span>
                    <span>{"(" + density.unit + ")"}</span>
                    <NumberInput min={density.minimum_value} max={density.maximum_value}
                                 value={toFixed(density.default_value, 0)}
                                 onChange={actions.setDensity}/>
                </div>
            </React.Fragment>
        );
    }
}

export default ConfigGreyscale;

