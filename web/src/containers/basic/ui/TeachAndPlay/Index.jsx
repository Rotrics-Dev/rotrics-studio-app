import React from 'react';
import {connect} from 'react-redux';
import {List, Modal, Checkbox, Select, Row, Col, Radio, Space} from 'antd';

import Line from '../../../../components/Line/Index.jsx'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as teachAndPlayActions} from "../../../../reducers/teachAndPlay";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import teach_and_play from "../../lib/settings/teach_and_play.json";
import styles from "./styles.css";

const FRONT_END_STYLE = {
    laser: {
        state_0: styles.front_end_laser_off,
        state_1: styles.front_end_laser_on,
    },
    air_pick: {
        state_0: styles.front_end_air_drop,
        state_1: styles.front_end_air_pick,

    },
    soft_gripper: {
        state_0: styles.front_end_soft_neutral,
        state_1: styles.front_end_soft_grip,
        state_2: styles.front_end_soft_release
    }

}

class Index extends React.Component {

    actions = {
        setTeachAndPlay: (event) => {
            if (event.target.checked) {
                this.props.setShowFrontEndSelect(true);
            } else {
                this.props.setTeachAndPlay(false)
            }
        },
        onCancel: () => {
            this.props.setShowFrontEndSelect(false);
        },
        onOk: () => {
            this.props.setTeachAndPlay(true);
            this.props.setShowFrontEndSelect(false);
        }
    };

    render() {
        const {
            currentFrontEnd,
            currentFrontEndState,
            laserPower,
            stepArray,
            teachAndPlayMode,
            repeatCount
        } = this.props;

        const frontEndOptions = [];
        Object.keys(teach_and_play.front_end.options).forEach((key) => {
            const option = teach_and_play.front_end.options[key];
            frontEndOptions.push({value: key, label: option.label})
        });
        const frontEndStateOptions = [];
        const frontEndState = teach_and_play.front_end.options[currentFrontEnd].state;
        Object.keys(frontEndState).forEach((key) => {
            frontEndStateOptions.push(<Radio.Button value={key} key={key}>{frontEndState[key].label}</Radio.Button>);
        });


        return (
            <div style={{
                width: "100%",
                height: "100%",
                fontSize: "13px"
            }}>
                <div style={{padding: "5px"}}>
                    <Row>
                        <Col span={15}>
                            <span> Teach & Play Mode</span>
                        </Col>
                        <Col span={9} align={"right"}>
                            <Checkbox checked={teachAndPlayMode}
                                      onChange={this.actions.setTeachAndPlay}>
                                {teachAndPlayMode ? 'On' : 'Off'}
                            </Checkbox>
                        </Col>
                    </Row>

                    {teachAndPlayMode &&
                    <Row>
                        <Col span={6}>
                            <span> {teach_and_play.front_end.options[this.props.currentFrontEnd].label}</span>
                        </Col>
                        <Col span={18} align={"right"}>{/*前端模块*/}
                            <Radio.Group
                                value={currentFrontEndState}
                                buttonStyle="solid"
                                size="small"
                                optionType="button"
                                onChange={this.props.setFrontEndState}>
                                {frontEndStateOptions}
                            </Radio.Group>
                        </Col>
                    </Row>}

                    {teachAndPlayMode && currentFrontEnd === "laser" &&
                    <Row>
                        <Col span={8}>
                            <span> {teach_and_play.front_end.options.laser.power.label + "(%)"}</span>
                        </Col>
                        <Col span={16} align={"right"}>
                            <NumberInput
                                min={teach_and_play.front_end.options.laser.power.minimum_value}
                                max={teach_and_play.front_end.options.laser.power.maximum_value}
                                defaultValue={teach_and_play.front_end.options.laser.power.default}
                                value={laserPower}
                                onAfterChange={this.props.setLaserPower}/>
                        </Col>
                    </Row>}
                </div>

                <Line/>
                <div style={{padding: "6px 6px 0px 6px "}}>
                    <Row>
                        <Col span={16}>
                            <span> {teach_and_play.repeatCount.label}</span>
                        </Col>
                        <Col span={8} align={"right"}>
                            <NumberInput
                                min={teach_and_play.repeatCount.minimum_value}
                                max={teach_and_play.repeatCount.maximum_value}
                                defaultValue={teach_and_play.repeatCount.default}
                                value={repeatCount}
                                disabled={!(stepArray.length > 0)}
                                onAfterChange={this.props.setRepeatCount}/>
                        </Col>
                    </Row>

                    <div style={{textAlign: "center"}}>
                        <button className={styles.button_record} onClick={this.props.recordStep}
                                disabled={!(teachAndPlayMode)}/>
                        <button className={styles.button_start} onClick={() => this.props.startPlayStep()}
                                disabled={!(stepArray.length > 0)}/>
                        <button className={styles.button_stop} onClick={this.props.stopPlayStep}
                                disabled={!(stepArray.length > 0)}/>
                    </div>
                </div>

                <Line/>
                <List
                    style={{padding: "6px 6px 40px 6px"}}
                    grid={{gutter: 1, column: 1}}
                    dataSource={stepArray}
                    renderItem={(item, index) => (
                        <List.Item
                            style={{
                                marginBottom: '0px'
                            }}>
                            <Row>
                                <Col span={2}>
                                    <div className={styles.div_num}>
                                        {index + 1}
                                    </div>
                                </Col>
                                <Col span={22} className={styles.div_card}
                                     onClick={() => this.props.startPlayStep(index, false)}>
                                    <div>
                                        <Row>
                                            <Col span={12}>
                                                <Row>
                                                    <Col span={8}>X</Col>
                                                    <Col span={16}>{item.x}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={8}>Y</Col>
                                                    <Col span={16}>{item.y}</Col>
                                                </Row>
                                                <Row>
                                                    <Col span={8}>Z</Col>
                                                    <Col span={16}>{item.z}</Col>
                                                </Row>
                                            </Col>
                                            <Col span={12} align={"center"}>
                                                <img
                                                    className={FRONT_END_STYLE[item.currentFrontEnd][item.currentFrontEndState]}/>
                                                <div>{teach_and_play.front_end.options[item.currentFrontEnd].state[item.currentFrontEndState].label}</div>
                                            </Col>
                                        </Row>
                                        <button className={styles.btn_delete}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    this.props.deleteStep(index);
                                                }}/>
                                    </div>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Col>
                                    Set Delay(s):
                                    <NumberInput
                                        size="small"
                                        style={{width: "48px"}}
                                        min={0}
                                        max={99}
                                        value={item.delay / 1000}
                                        onAfterChange={(value) => {
                                            item.delay = value * 1000;
                                            this.props.updateStep(item, index);
                                        }}/>
                                </Col>
                            </Row>
                        </List.Item>
                    )}
                />
                <div style={{
                    position: "fixed",
                    right: "15px",
                    bottom: "20px",
                    padding: "0px 3px",
                    width: "300px",
                    height: "24px",
                    backgroundColor: "white",
                    textAlign: "right"
                }}>
                    <button className={styles.button_delete} onClick={this.props.clearStepArray}
                            disabled={!(stepArray.length > 0)}/>
                    <button className={styles.button_export} onClick={this.props.exportGcode}
                            disabled={!(stepArray.length > 0)}/>
                </div>
                <Modal
                    title="Select Teach & Play Front End"
                    visible={this.props.showFrontEndSelect}
                    onCancel={this.actions.onCancel}
                    onOk={this.actions.onOk}>
                    {/*<Space direction={"vertical"}>*/}
                    <Select style={{width: 300}}
                            onChange={this.props.onSelectFrontEnd}
                            placeholder="select a front end"
                            defaultValue={this.props.currentFrontEnd}
                            options={frontEndOptions}/>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state.teachAndPlay;
};
const mapDispatchToProps = (dispatch) => {
    return {
        recordStep: () => dispatch(teachAndPlayActions.recordStep()),
        startPlayStep: (startIndex = 0, doRepeat = true) => dispatch(teachAndPlayActions.startPlayStep(startIndex, doRepeat)),
        stopPlayStep: () => dispatch(teachAndPlayActions.stopPlayStep()),
        clearStepArray: () => dispatch(teachAndPlayActions.clearStepArray()),
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        setTeachAndPlay: (isTeachAndPlayMode) => dispatch(teachAndPlayActions.setTeachAndPlay(isTeachAndPlayMode)),
        setShowFrontEndSelect: (show) => dispatch(teachAndPlayActions.setShowFrontEndSelect(show)),
        onSelectFrontEnd: (front_end) => dispatch(teachAndPlayActions.onSelectFrontEnd(front_end)),
        setFrontEndState: (event) => dispatch(teachAndPlayActions.setFrontEndState(event.target.value)),
        setLaserPower: (power) => dispatch(teachAndPlayActions.setLaserPower(power)),
        setRepeatCount: (repeatCount) => dispatch(teachAndPlayActions.setRepeatCount(repeatCount)),
        updateStep: (step, index) => dispatch(teachAndPlayActions.updateStep(step, index)),
        deleteStep: (index) => dispatch(teachAndPlayActions.deleteStep(index)),
        exportGcode: () => dispatch(teachAndPlayActions.exportGcode())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

