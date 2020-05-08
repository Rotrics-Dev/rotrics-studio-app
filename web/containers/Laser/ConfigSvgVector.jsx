import React, {PureComponent} from 'react';
import {Checkbox, Select} from 'antd';
import laserManager from "../../manager/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import NumberInput from '../../components/NumberInput/Index.jsx';

class ConfigSvgVector extends PureComponent {
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
        setOptimizePath: (e) => {
            laserManager.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            laserManager.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            laserManager.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "svg") {
            return null;
        }
        const actions = this.actions;
        const {config} = this.state;
        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;
        return (
            <React.Fragment>
                <h2>{config.label}</h2>
                <div>
                    <span>{optimize_path.label}</span>
                    <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                </div>
                <div>
                    <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                    <span>{fill.label}</span>
                </div>
                <div>
                    <span>{fill_density.label}</span>
                    <NumberInput min={fill_density.minimum_value} max={fill_density.maximum_value}
                                 value={toFixed(fill_density.default_value, 0)}
                                 onChange={actions.setFillDensity}/>
                </div>
            </React.Fragment>
        );
    }
}

export default ConfigSvgVector;

