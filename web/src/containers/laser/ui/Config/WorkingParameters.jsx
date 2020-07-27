import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';

import ReactTooltip from "react-tooltip";
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
            return true;
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
        const {print_order, multi_pass, power} = working_parameters.children;

        //bw/svg: {work_speed, jog_speed}
        //greyscale:
        //config.movement_mode === greyscale-dot => {work_speed, jog_speed(不可见), dwell_time}
        //config.movement_mode === greyscale-line => {work_speed, jog_speed, dwell_time(不可见)}
        const {work_speed, jog_speed, dwell_time, engrave_time} = working_parameters.children;

        const {passes, pass_depth} = multi_pass.children;

        let jogSpeedHidden = false; //默认显示的，dwell_time.hidden === null/undefined表示显示
        if (typeof jog_speed.hidden === "boolean") {
            jogSpeedHidden = jog_speed.hidden;
        } else if (typeof jog_speed.hidden === "string") {
            jogSpeedHidden = getHiddenValue(jog_speed.hidden, config);
        }

        let dwellTimeHidden = false; //默认显示的，dwell_time.hidden === null/undefined表示显示
        if (!dwell_time) {
            dwellTimeHidden = true;
        } else if (typeof dwell_time.hidden === "boolean") {
            dwellTimeHidden = dwell_time.hidden;
        } else if (typeof dwell_time.hidden === "string") {
            dwellTimeHidden = getHiddenValue(dwell_time.hidden, config);
        }

        let engraveTimeHidden = false;
        if (!engrave_time) {
            engraveTimeHidden = true;
        } else if (typeof engrave_time.hidden === "boolean") {
            engraveTimeHidden = engrave_time.hidden;
        } else if (typeof engrave_time.hidden === "string") {
            engraveTimeHidden = getHiddenValue(engrave_time.hidden, config);
        }
        return (
            <div>
                <ReactTooltip
                    id={tooltipId}
                    place="left"
                    type="info"
                    effect="solid"
                    backgroundColor="#c0c0c0"
                    textColor="#292421"
                    delayShow={200}/>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(working_parameters.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how fast the front end moves when it’s working.')}>
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
                    {!jogSpeedHidden &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how fast the front end moves when it’s not working.')}>
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
                    }
                    {!dwellTimeHidden &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how long the laser keeps on when it’s engraving a dot.')}>
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
                    }
                    {!engraveTimeHidden &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how long the laser keeps on when it’s engraving a dot.')}>
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
                    }
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Power to use when laser is working.')}>
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
                        data-tip={t('When enabled, the Arm will run the G-code multiple times automatically according to the below settings. This feature helps you cut materials that can\'t be cut with only one pass.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(multi_pass.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={multi_pass.default_value} onChange={actions.setMultiPass}/>
                        </Col>
                    </Row>
                    {multi_pass.default_value &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how many times the printer will run the G-code automatically.')}>
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
                    }
                    {multi_pass.default_value &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how much the laser module will be lowered after each pass.')}>
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
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, working_parameters, config} = state.laser;
    // console.log(JSON.stringify(working_parameters, null, 2))
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


