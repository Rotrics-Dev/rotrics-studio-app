import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigText, ConfigTitle} from "../../../components/Config";

//props: t, model, working_parameters
class Index extends PureComponent {
    actions = {
        setWorkSpeed: (value) => {
            this.props.model.updateWorkingParameters("work_speed", value)
        },
        setJogSpeed: (value) => {
            this.props.model.updateWorkingParameters("jog_speed", value)
        },
        setPower: (value) => {
            this.props.model.updateWorkingParameters("power", value)
        },
        setMultiPass: (e) => {
            this.props.model.updateWorkingParameters("multi_pass", e.target.checked)
        },
        setMultiPassPasses: (value) => {
            this.props.model.updateWorkingParameters("multi_pass.passes", value)
        },
        setMultiPassPassDepth: (value) => {
            this.props.model.updateWorkingParameters("multi_pass.pass_depth", value)
        },
        setDwellTime: (value) => {
            this.props.model.updateWorkingParameters("dwell_time", value)
        },
        setEngraveTime: (value) => {
            this.props.model.updateWorkingParameters("engrave_time", value)
        },
        setJogPenOffset: (value) => {
            this.props.model.updateWorkingParameters("jog_pen_offset", value)
        }
    };

    render() {
        const {t, model, working_parameters} = this.props;

        if (!model || !working_parameters) {
            return null;
        }

        const actions = this.actions;

        const {work_speed, jog_speed, power, multi_pass, dwell_time, engrave_time, jog_pen_offset} = working_parameters.children;
        let passes = null;
        let pass_depth = null;
        if (multi_pass) {
            passes = multi_pass.children.passes;
            pass_depth = multi_pass.children.pass_depth;
        }

        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(working_parameters.label)}/>
                    {work_speed &&
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
                    }
                    {jog_speed &&
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
                    }
                    {power &&
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
                    }
                    {multi_pass &&
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
                    }
                    {passes &&
                    <Tooltip title={t(passes.description)}>
                        <Row>
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
                    }
                    {pass_depth &&
                    <Tooltip title={t(pass_depth.description)}>
                        <Row>
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
                    }
                    {dwell_time &&
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
                    }
                    {engrave_time &&
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
                    }
                    {jog_pen_offset &&
                    <Tooltip title={t(jog_pen_offset.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(jog_pen_offset.label)}(${jog_pen_offset.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={jog_pen_offset.minimum_value}
                                    max={jog_pen_offset.maximum_value}
                                    value={jog_pen_offset.default_value}
                                    onAfterChange={actions.setJogPenOffset}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    }
                </div>
            </div>
        );
    }
}

export default Index;


