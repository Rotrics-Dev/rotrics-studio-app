import React, {PureComponent} from 'react';
import { Checkbox} from 'antd';
import laserManager from "../../manager/laserManager.js";
import {toFixed} from '../../lib/numeric-utils';
import styles from './styles.css';
import NumberInput from '../../components/NumberInput/Index.jsx';

class WorkingParameters extends PureComponent {
    state = {
        model2d: null,
        working_parameters: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let working_parameters = model2d ? _.cloneDeep(model2d.settings.working_parameters) : null;
            // console.log("working_parameters: " + JSON.stringify(model2d.settings.working_parameters, null, 2))
            this.setState({
                model2d,
                working_parameters
            })
        });
    }

    actions = {
        setPrintOrder: (value) => {
            laserManager.updateWorkingParameters("print_order", value)
        },
        setJogSpeed: (value) => {
            laserManager.updateWorkingParameters("jog_speed", value)
        },
        setWorkSpeed: (value) => {
            laserManager.updateWorkingParameters("work_speed", value)
        },
        //TODO: fix-me
        //multi pass
        setMultiPass: (e) => {
            laserManager.updateWorkingParameters("multi_pass", e.target.checked)
        },
        setMultiPassPasses: (value) => {
            laserManager.updateWorkingParameters("multi_pass.passes", value)
        },
        setMultiPassPassDepth: (value) => {
            laserManager.updateWorkingParameters("multi_pass.pass_depth", value)
        },
        //fixed power
        setFixedPower: (e) => {
            laserManager.updateWorkingParameters("fixed_power", e.target.checked)
        },
        setFixedPowerPower: (value) => {
            laserManager.updateWorkingParameters("fixed_power.power", value)
        }
    };

    render() {
        if (!this.state.model2d) {
            return null;
        }
        const actions = this.actions;
        const {working_parameters} = this.state;
        const {print_order, jog_speed, work_speed, multi_pass, fixed_power} = working_parameters.children;
        const {passes, pass_depth} = multi_pass.children;
        const {power} = fixed_power.children;


        return (
            <React.Fragment>
                <h2>{working_parameters.label}</h2>
                <div>
                    <span>{print_order.label}</span>
                    <NumberInput min={print_order.minimum_value} max={print_order.maximum_value}
                                 value={toFixed(print_order.default_value, 0)}
                                 onChange={actions.setPrintOrder}/>
                </div>
                <div>
                    <span>{jog_speed.label}</span>
                    <span>{"(" + jog_speed.unit + ")"}</span>
                    <NumberInput min={jog_speed.minimum_value} max={jog_speed.maximum_value}
                                 value={toFixed(jog_speed.default_value, 0)}
                                 onChange={actions.setJogSpeed}/>
                </div>
                <div>
                    <span>{work_speed.label}</span>
                    <span>{"(" + work_speed.unit + ")"}</span>
                    <NumberInput min={work_speed.minimum_value} max={work_speed.maximum_value}
                                 value={toFixed(work_speed.default_value, 0)}
                                 onChange={actions.setWorkSpeed}/>
                </div>
                <div>
                    <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                    <span>{multi_pass.label}</span>
                </div>
                <div>
                    <span>{passes.label}</span>
                    <NumberInput min={passes.minimum_value} max={passes.maximum_value}
                                 value={toFixed(passes.default_value, 0)}
                                 onChange={actions.setMultiPassPasses}/>
                </div>
                <div>
                    <span>{pass_depth.label}</span>
                    <span>{"(" + pass_depth.unit + ")"}</span>
                    <NumberInput min={pass_depth.minimum_value} max={pass_depth.maximum_value}
                                 value={toFixed(pass_depth.default_value, 0)}
                                 onChange={actions.setMultiPassPassDepth}/>
                </div>
                <div>
                    <Checkbox checked={fixed_power.default_value} onChange={actions.setFixedPower}/>
                    <span>{fixed_power.label}</span>
                </div>
                <div>
                    <span>{power.label}</span>
                    <span>{"(" + power.unit + ")"}</span>
                    <NumberInput min={power.minimum_value} max={power.maximum_value}
                                 value={toFixed(power.default_value, 0)}
                                 onChange={actions.setFixedPowerPower}/>
                </div>
            </React.Fragment>
        );
    }
}

export default WorkingParameters;

