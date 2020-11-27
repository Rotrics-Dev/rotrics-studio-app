import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigText, ConfigTitle} from "../../../components/Config";

//hiddenStr: "movement_mode === greyscale-dot"

//props: t, model, working_parameters, updateWorkingParameters, config
class Index extends PureComponent {
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
        setEngraveTime: (value) => {
            this.props.updateWorkingParameters("engrave_time", value)
        },
        setMultiPass: (e) => {
            this.props.updateWorkingParameters("multi_pass", e.target.checked)
        },
        setMultiPassPasses: (value) => {
            this.props.updateWorkingParameters("multi_pass.passes", value)
        },
        setMultiPassPassDepth: (value) => {
            this.props.updateWorkingParameters("multi_pass.pass_depth", value)
        },
        setPower: (value) => {
            this.props.updateWorkingParameters("power", value)
        }
    };

    render() {
        const {t} = this.props;
        const {model, working_parameters, config} = this.props;
        if (!model || !working_parameters || !config) {
            return null;
        }

        const actions = this.actions;

        // for greyscale and movement mode is greyscale-dot
        if (config.children.movement_mode && config.children.movement_mode.default_value === "greyscale-dot") {
            const {work_speed, dwell_time, engrave_time, power, multi_pass} = working_parameters.children;
            const {passes, pass_depth} = multi_pass.children;
            return (
                <div>
                    <Line/>
                    <div style={{padding: "8px"}}>
                        <ConfigTitle text={t(working_parameters.label)}/>
                        <Tooltip title={t(work_speed.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(work_speed.label)}(${work_speed.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={work_speed.minimum_value}
                                        max={work_speed.maximum_value}
                                        value={work_speed.default_value}
                                        onAfterChange={actions.setWorkSpeed}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(dwell_time.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(dwell_time.label)}(${dwell_time.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={dwell_time.minimum_value}
                                        max={dwell_time.maximum_value}
                                        value={dwell_time.default_value}
                                        onAfterChange={actions.setDwellTime}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(engrave_time.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(engrave_time.label)}(${engrave_time.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={engrave_time.minimum_value}
                                        max={engrave_time.maximum_value}
                                        value={engrave_time.default_value}
                                        onAfterChange={actions.setEngraveTime}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(power.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(power.label)}(${power.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={power.minimum_value}
                                        max={power.maximum_value}
                                        value={power.default_value}
                                        onAfterChange={actions.setPower}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(multi_pass.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(multi_pass.label)}`}/>
                                </Col>
                                <Col span={5}>
                                    <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(passes.description)}>
                            <Row style={{display: multi_pass.default_value ? "" : "none"}}>
                                <Col span={17} push={2}>
                                    <ConfigText text={t(passes.label)}/>
                                </Col>
                                <Col span={5} push={2}>
                                    <NumberInput
                                        min={passes.minimum_value}
                                        max={passes.maximum_value}
                                        value={passes.default_value}
                                        onAfterChange={actions.setMultiPassPasses}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(pass_depth.description)}>
                            <Row style={{display: multi_pass.default_value ? "" : "none"}}>
                                <Col span={17} push={2}>
                                    <ConfigText text={`${t(pass_depth.label)}(${pass_depth.unit})`}/>
                                </Col>
                                <Col span={5} push={2}>
                                    <NumberInput
                                        min={pass_depth.minimum_value}
                                        max={pass_depth.maximum_value}
                                        value={pass_depth.default_value}
                                        precision={2}
                                        onAfterChange={actions.setMultiPassPassDepth}/>
                                </Col>
                            </Row>
                        </Tooltip>
                    </div>
                </div>
            );
        } else {
            const {work_speed, jog_speed, power, multi_pass} = working_parameters.children;
            const {passes, pass_depth} = multi_pass.children;
            return (
                <div>
                    <Line/>
                    <div style={{
                        padding: "8px",
                    }}>
                        <ConfigTitle text={t(working_parameters.label)}/>
                        <Tooltip title={t(work_speed.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(work_speed.label)}(${work_speed.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={work_speed.minimum_value}
                                        max={work_speed.maximum_value}
                                        value={work_speed.default_value}
                                        onAfterChange={actions.setWorkSpeed}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(jog_speed.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(jog_speed.label)}(${jog_speed.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={jog_speed.minimum_value}
                                        max={jog_speed.maximum_value}
                                        value={jog_speed.default_value}
                                        onAfterChange={actions.setJogSpeed}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(power.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(power.label)}(${power.unit})`}/>
                                </Col>
                                <Col span={5}>
                                    <NumberInput
                                        min={power.minimum_value}
                                        max={power.maximum_value}
                                        value={power.default_value}
                                        onAfterChange={actions.setPower}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(multi_pass.description)}>
                            <Row>
                                <Col span={19}>
                                    <ConfigText text={`${t(multi_pass.label)}`}/>
                                </Col>
                                <Col span={5}>
                                    <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(passes.description)}>
                            <Row style={{display: multi_pass.default_value ? "" : "none"}}>
                                <Col span={17} push={2}>
                                    <ConfigText text={t(passes.label)}/>
                                </Col>
                                <Col span={5} push={2}>
                                    <NumberInput
                                        min={passes.minimum_value}
                                        max={passes.maximum_value}
                                        value={passes.default_value}
                                        onAfterChange={actions.setMultiPassPasses}
                                    />
                                </Col>
                            </Row>
                        </Tooltip>
                        <Tooltip title={t(pass_depth.description)}>
                            <Row style={{display: multi_pass.default_value ? "" : "none"}}>
                                <Col span={17} push={2}>
                                    <ConfigText text={`${t(pass_depth.label)}(${pass_depth.unit})`}/>
                                </Col>
                                <Col span={5} push={2}>
                                    <NumberInput
                                        min={pass_depth.minimum_value}
                                        max={pass_depth.maximum_value}
                                        value={pass_depth.default_value}
                                        precision={2}
                                        onAfterChange={actions.setMultiPassPassDepth}/>
                                </Col>
                            </Row>
                        </Tooltip>
                    </div>
                </div>
            );
        }
    }
}

export default Index;


