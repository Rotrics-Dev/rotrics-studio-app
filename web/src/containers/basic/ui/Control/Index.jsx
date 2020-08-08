import React from 'react';
import DeviceControl from '../../../_deviceControl/Index.jsx'
import teach_and_play from '../../lib/settings/teach_and_play.json';
import movement from '../../lib/settings/movement.json';
import {List, Modal, Space, Select, Row, Col, Radio} from 'antd';
import front_end from "../../lib/settings/front_end.json";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as serialPortActions} from "../../../../reducers/serialPort";
import Line from '../../../../components/Line/Index.jsx'

import {connect} from 'react-redux';
import NumberInput from "../../../../components/NumberInput/Index.jsx";
import {ConfigTitle} from "../../../../components/Config";
import {withTranslation} from 'react-i18next'

class Index extends React.Component {
    state = {
        laserPower: teach_and_play.front_end.options.laser.power.default_value,
        currentFrontEnd: teach_and_play.front_end.default_value,
        currentFrontEndState: teach_and_play.front_end.options[teach_and_play.front_end.default_value].default_value,
        currentMovementMode: 'fast_mode',
        currentSpeed: movement.speed.default_value
    };
    actions = {
        onSelectFrontEnd: (frontEnd) => {
            const currentFrontEnd = teach_and_play.front_end.options[frontEnd];
            const currentFrontEndState = currentFrontEnd.state[currentFrontEnd.default_value];
            const gcodeArr = [currentFrontEnd.gcode, currentFrontEndState.gcode];
            this.props.start(gcodeArr.join('\n'), false, false);

            this.setState({
                laserPower: teach_and_play.front_end.options.laser.power.default_value,
                currentFrontEnd: frontEnd,
                currentFrontEndState: currentFrontEnd.default_value
            });
        },
        onSelectMovementMode: (movementMode) => {
            this.props.start(movement.mode[movementMode].gcode, false, false);
            this.setState({currentMovementMode: movementMode});
        },
        onSetFrontEndState: (event) => {
            const frontEndState = event.target.value;
            const currentFrontEndState = teach_and_play.front_end.options[this.state.currentFrontEnd].state[frontEndState];
            this.props.start(currentFrontEndState.gcode, false, false);
            this.setState({
                currentFrontEndState: frontEndState
            });
        },
        setLaserPower: (power) => {
            this.props.start(`M3 S${Math.round(power * 2.55)}`, false, false);
            this.setState({
                laserPower: power,
                currentFrontEndState: 'state_1'//switch to  laser on
            });
        },
        setSpeed: (speed) => {
            this.props.start(`G0 F${speed}`, false, false);
            this.setState({
                currentSpeed: speed,
            });
        }
    };

    render() {
        const {t} = this.props;
        const movementModeOptions = [];
        Object.keys(movement.mode).forEach((key) => {
            movementModeOptions.push({value: key, label: t(movement.mode[key].label)})
        });


        const frontEndOptionsObj = teach_and_play.front_end.options;
        const frontEndOptions = [];
        Object.keys(teach_and_play.front_end.options).forEach((key) => {
            frontEndOptions.push({value: key, label: t(frontEndOptionsObj[key].label)})
        });
        const frontEndStateOptions = [];
        const frontEndState = frontEndOptionsObj[this.state.currentFrontEnd].state;
        Object.keys(frontEndState).forEach((key) => {
            frontEndStateOptions.push(<Radio.Button value={key} key={key}>{t(frontEndState[key].label)}</Radio.Button>);
        });

        return (
            <div>
                <DeviceControl/>
                <Line/>
                <div style={{padding: "6px"}}>
                    <ConfigTitle text={t("Motion Mode")}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        <Select
                            style={{width: "100%", textAlign: "center"}}
                            onChange={this.actions.onSelectMovementMode}
                            value={this.state.currentMovementMode}
                            options={movementModeOptions}/>
                        <Row>
                            <Col span={12}>
                                <span> {`${t(movement.speed.label)}(${movement.speed.unit})`}</span>
                            </Col>
                            <Col span={12} align={"right"}>
                                <NumberInput
                                    min={movement.speed.minimum_value}
                                    max={movement.speed.maximum_value}
                                    defaultValue={movement.speed.default_value}
                                    value={this.state.currentSpeed}
                                    onAfterChange={this.actions.setSpeed}/>
                            </Col>
                        </Row>
                    </Space>
                </div>


                <Line/>
                <div style={{padding: "6px", width: "100%"}}>
                    <ConfigTitle text={t("Front end")}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        <Select
                            style={{width: "100%", textAlign: "center"}}
                            onChange={this.actions.onSelectFrontEnd}
                            placeholder={t("select a front end")}
                            value={this.state.currentFrontEnd}
                            options={frontEndOptions}/>
                        <Row>
                            <Col span={6}>
                                <span>{t("Actions")}</span>
                            </Col>
                            <Col span={18} align={"right"}>{/*前端模块*/}
                                <Radio.Group
                                    buttonStyle="solid"
                                    size="small"
                                    optionType="button"
                                    value={this.state.currentFrontEndState}
                                    onChange={this.actions.onSetFrontEndState}>
                                    {frontEndStateOptions}
                                </Radio.Group>
                            </Col>
                        </Row>
                        {this.state.currentFrontEnd === "laser" &&
                        <Row>
                            <Col span={8}>
                                <span> {t(teach_and_play.front_end.options.laser.power.label) + "(%)"}</span>
                            </Col>
                            <Col span={16} align={"right"}>
                                <NumberInput
                                    min={teach_and_play.front_end.options.laser.power.minimum_value}
                                    max={teach_and_play.front_end.options.laser.power.maximum_value}
                                    defaultValue={teach_and_play.front_end.options.laser.power.default}
                                    value={this.state.laserPower}
                                    onAfterChange={this.actions.setLaserPower}/>
                            </Col>
                        </Row>}
                    </Space>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        start: (gcode, isTask, isLaser) => dispatch(gcodeSendActions.start(gcode, isTask, isLaser)),
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Index));

