import React, {PureComponent} from 'react';
import {Checkbox, Select} from 'antd';
import laserManager from "../../manager/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import NumberInput from '../../components/NumberInput/Index.jsx';

class ConfigRasterBW extends PureComponent {
    state = {
        model2d: null,
        config: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let config = model2d ? _.cloneDeep(model2d.settings.config) : null;
            // console.log("change: " + JSON.stringify(config, null, 2))
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
        setBW: (value) => {
            laserManager.updateConfig("bw", value)
        },
        setDensity: (value) => {
            laserManager.updateConfig("density", value)
        },
        setLineDirection: (value) => {
            laserManager.updateConfig("line_direction", value)
        }
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "bw") {
            return null;
        }

        const actions = this.actions;
        const {config} = this.state;
        const {invert, bw, line_direction, density} = config.children;
        const directionOptions = [];
        Object.keys(line_direction.options).forEach((key) => {
            const option = line_direction.options[key];
            directionOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });
        return (
            <React.Fragment>
                <h2>{config.label}</h2>
                <div>
                    <span>{invert.label}</span>
                    <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                </div>
                <div>
                    <span>{bw.label}</span>
                    <NumberInput min={bw.minimum_value} max={bw.maximum_value}
                                 value={toFixed(bw.default_value, 0)}
                                 onChange={actions.setBW}/>
                </div>
                <div>
                    <span>{line_direction.label}</span>
                    <Select value={line_direction.default_value} style={{width: 110}}
                            onChange={actions.setLineDirection}>
                        {directionOptions}
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

export default ConfigRasterBW;

