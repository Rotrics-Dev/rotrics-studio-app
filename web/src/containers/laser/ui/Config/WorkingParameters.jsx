import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from '../../../../utils';

const tooltipId = getUuid();

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
        setEngraveTime: (value) => {
            this.props.updateWorkingParameters("engrave_time", value)
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
        //power
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
        const {multi_pass, power} = working_parameters.children;

        const {work_speed, jog_speed, dwell_time, engrave_time} = working_parameters.children;
        const {passes, pass_depth} = multi_pass.children;
        const {movement_mode} = config.children;

        //TODO: 根据settings动态设置
        //bw/svg/text: {work_speed, jog_speed}
        //greyscale:
        //config.children.movement_mode.default_value === greyscale-dot => {work_speed,  dwell_time, engrave_time}
        //config.children.movement_mode.default_value === greyscale-line => {work_speed, jog_speed}
        let jogSpeedVisible = true;
        let dwellTimeVisible = false;
        let engraveTimeVisible = false;
        if (movement_mode && movement_mode.default_value === "greyscale-dot") {
            jogSpeedVisible = false;
            dwellTimeVisible = true;
            engraveTimeVisible = true;
        }
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"/>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(working_parameters.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(work_speed.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(work_speed.label)}(${work_speed.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={work_speed.minimum_value}
                                max={work_speed.maximum_value}
                                value={work_speed.default_value}
                                onAfterChange={actions.setWorkSpeed}/>
                        </Col>
                    </Row>
                    <Row
                        style={{display: jogSpeedVisible ? "" : "none"}}
                        data-for={tooltipId}
                        data-tip={t(jog_speed.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(jog_speed.label)}(${jog_speed.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={jog_speed.minimum_value}
                                max={jog_speed.maximum_value}
                                value={jog_speed.default_value}
                                onAfterChange={actions.setJogSpeed}/>
                        </Col>
                    </Row>
                    <Row
                        style={{display: dwellTimeVisible ? "" : "none"}}
                        data-for={tooltipId}
                        data-tip={t(dwell_time.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(dwell_time.label)}(${dwell_time.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={dwell_time.minimum_value}
                                max={dwell_time.maximum_value}
                                value={dwell_time.default_value}
                                onAfterChange={actions.setDwellTime}/>
                        </Col>
                    </Row>
                    <Row
                        style={{display: engraveTimeVisible ? "" : "none"}}
                        data-for={tooltipId}
                        data-tip={t(engrave_time.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(engrave_time.label)}(${engrave_time.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={engrave_time.minimum_value}
                                max={engrave_time.maximum_value}
                                value={engrave_time.default_value}
                                onAfterChange={actions.setEngraveTime}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(power.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(power.label)}(${power.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={power.minimum_value}
                                max={power.maximum_value}
                                value={power.default_value}
                                onAfterChange={actions.setPower}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(multi_pass.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(multi_pass.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                        </Col>
                    </Row>
                    <Row
                        style={{display: multi_pass.default_value ? "" : "none"}}
                        data-for={tooltipId}
                        data-tip={t(passes.description)}>
                        <Col span={17} push={2}>
                            <ConfigText text={`${t(passes.label)}`}/>
                        </Col>
                        <Col span={5} push={2}>
                            <NumberInput
                                min={passes.minimum_value}
                                max={passes.maximum_value}
                                value={passes.default_value}
                                onAfterChange={actions.setMultiPassPasses}/>
                        </Col>
                    </Row>
                    <Row
                        style={{display: multi_pass.default_value ? "" : "none"}}
                        data-for={tooltipId}
                        data-tip={t(pass_depth.description)}>
                        <Col span={17} push={2}>
                            <ConfigText text={`${t(pass_depth.label)}(${pass_depth.unit})`}/>
                        </Col>
                        <Col span={5} push={2}>
                            <NumberInput
                                min={pass_depth.minimum_value}
                                max={pass_depth.maximum_value}
                                value={pass_depth.default_value}
                                precision={1}
                                onAfterChange={actions.setMultiPassPassDepth}/>
                        </Col>
                    </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(WorkingParameters));


