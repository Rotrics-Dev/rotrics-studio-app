import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';

//hiddenStr: "movement_mode === greyscale-dot"
const getHiddenValue = (hiddenStr = "", config) => {
    let hidden = false;
    hiddenStr = hiddenStr.trim();
    if (hiddenStr.length > 0) {
        //替换所有多个空格为一个空格
        hiddenStr = hiddenStr.replace(/\s+/g, " ");

        const tokens = hiddenStr.split(" ");

        if (tokens.length !== 3) {
            return false;
        }

        const left = tokens[0];
        const opt = tokens[1];
        const rightValue = tokens[2];

        if (!config.children[left]) {
            return false;
        }
        const leftValue = config.children[left].default_value;
        switch (opt) {
            case "==" :
            case "===" :
                hidden = (leftValue === rightValue);
                break;
            case "!=" :
            case "!==" :
                hidden = (leftValue !== rightValue);
                break;
            case ">" :
                hidden = (leftValue > rightValue);
                break;
            case "<" :
                hidden = (leftValue < rightValue);
                break
        }
    }
    return hidden;
};

class WorkingParameters extends PureComponent {
    actions = {
        setPrintOrder: (value) => {
            this.props.updateWorkingParameters("print_order", value)
        },
        setJogSpeed: (value) => {
            this.props.updateWorkingParameters("jog_speed", value)
        },
        setWorkSpeed: (value) => {
            this.props.updateWorkingParameters("work_speed", value)
        },
        setDwellTime: (value) => {
            this.props.updateWorkingParameters("dwell_time", value)
        },
        //multi pass
        setMultiPass: (e) => {
            this.props.updateWorkingParameters("multi_pass", e.target.checked)
        },
        setMultiPassPasses: (value) => {
            this.props.updateWorkingParameters("multi_pass.passes", value)
        },
        setMultiPassPassDepth: (value) => {
            this.props.updateWorkingParameters("multi_pass.pass_depth", value)
        },
        //fixed power
        setFixedPower: (e) => {
            this.props.updateWorkingParameters("fixed_power", e.target.checked)
        },
        setFixedPowerPower: (value) => {
            this.props.updateWorkingParameters("fixed_power.power", value)
        }
    };

    render() {
        const {model, working_parameters, config} = this.props;
        if (!model || !working_parameters || !config) {
            return null;
        }
        const actions = this.actions;
        const {print_order, multi_pass, fixed_power} = working_parameters.children;

        //bw/svg: {work_speed, jog_speed}
        //greyscale:
        //config.movement_mode === greyscale-dot => {work_speed, jog_speed(不可见), dwell_time}
        //config.movement_mode === greyscale-line => {work_speed, jog_speed, dwell_time(不可见)}
        const {work_speed, jog_speed, dwell_time} = working_parameters.children;

        const {passes, pass_depth} = multi_pass.children;
        const {power} = fixed_power.children;

        let jogSpeedHidden = false; //默认显示的，dwell_time.hidden === null/undefined表示显示
        if (typeof jog_speed.hidden === "boolean"){
            jogSpeedHidden = jog_speed.hidden;
        } else if (typeof jog_speed.hidden === "string"){
            jogSpeedHidden = getHiddenValue(jog_speed.hidden, config);
        }

        let dwellTimeHidden = false; //默认显示的，dwell_time.hidden === null/undefined表示显示
        if (typeof dwell_time.hidden === "boolean"){
            dwellTimeHidden = dwell_time.hidden;
        } else if (typeof dwell_time.hidden === "string"){
            dwellTimeHidden = getHiddenValue(dwell_time.hidden, config);
        }

        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    <h4>{working_parameters.label}</h4>

                    {/*<Row>*/}
                    {/*<Col span={11}>*/}
                    {/*<span>{print_order.label}</span>*/}
                    {/*</Col>*/}
                    {/*<Col span={8} push={5}>*/}
                    {/*<NumberInput min={print_order.minimum_value} max={print_order.maximum_value}*/}
                    {/*value={toFixed(print_order.default_value, 0)}*/}
                    {/*onChange={actions.setPrintOrder}/>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}

                    <Row>
                        <Col span={15}>
                            <span>{work_speed.label}</span>
                            <span>{"(" + work_speed.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={work_speed.minimum_value} max={work_speed.maximum_value}
                                         value={toFixed(work_speed.default_value, 0)}
                                         onChange={actions.setWorkSpeed}/>
                        </Col>
                    </Row>
                    {!jogSpeedHidden &&
                    <Row>
                        <Col span={15}>
                            <span>{jog_speed.label}</span>
                            <span>{"(" + jog_speed.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={jog_speed.minimum_value} max={jog_speed.maximum_value}
                                         value={toFixed(jog_speed.default_value, 0)}
                                         onChange={actions.setJogSpeed}/>
                        </Col>
                    </Row>
                    }
                    {!dwellTimeHidden &&
                    <Row>
                        <Col span={15}>
                            <span>{dwell_time.label}</span>
                            <span>{"(" + dwell_time.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={dwell_time.minimum_value} max={dwell_time.maximum_value}
                                         value={toFixed(dwell_time.default_value, 0)}
                                         onChange={actions.setDwellTime}/>
                        </Col>
                    </Row>
                    }
                    <Row>
                        <Col span={15}>
                            <span>{multi_pass.label}</span>
                        </Col>
                        <Col span={9}>
                            <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                        </Col>
                    </Row>
                    {multi_pass.default_value &&
                    <Row>
                        <Col span={13} push={2}>
                            <span>{passes.label}</span>
                        </Col>
                        <Col span={9} push={2}>
                            <NumberInput min={passes.minimum_value} max={passes.maximum_value}
                                         value={toFixed(passes.default_value, 0)}
                                         onChange={actions.setMultiPassPasses}/>
                        </Col>
                    </Row>
                    }
                    {multi_pass.default_value &&
                    <Row>
                        <Col span={13} push={2}>
                            <span>{pass_depth.label}</span>
                            <span>{"(" + pass_depth.unit + ")"}</span>
                        </Col>
                        <Col span={9} push={2}>
                            <NumberInput min={pass_depth.minimum_value} max={pass_depth.maximum_value}
                                         value={toFixed(pass_depth.default_value, 0)}
                                         onChange={actions.setMultiPassPassDepth}/>
                        </Col>
                    </Row>
                    }
                    <Row>
                        <Col span={15}>
                            <span>{fixed_power.label}</span>
                        </Col>
                        <Col span={9}>
                            <Checkbox checked={fixed_power.default_value} onChange={actions.setFixedPower}/>
                        </Col>
                    </Row>
                    {fixed_power.default_value &&
                    <Row>
                        <Col span={13} push={2}>
                            <span>{power.label}</span>
                            <span>{"(" + power.unit + ")"}</span>
                        </Col>
                        <Col span={9} push={2}>
                            <NumberInput min={power.minimum_value} max={power.maximum_value}
                                         value={toFixed(power.default_value, 0)}
                                         onChange={actions.setFixedPowerPower}/> </Col>
                    </Row>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, working_parameters, config} = state.laser;
    return {
        model,
        working_parameters,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateWorkingParameters: (key, value) => dispatch(laserActions.updateWorkingParameters(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkingParameters);


