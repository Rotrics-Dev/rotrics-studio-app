import React from 'react';
import {connect} from 'react-redux';
import {List, Modal, Checkbox, Select, Row, Col, Radio, Space} from 'antd';

import Line from '../../../../components/Line/Index.jsx'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as teachAndPlayActions} from "../../../../reducers/teachAndPlay";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import teach_and_play from "../../lib/settings/teach_and_play.json";
import styles from "./styles.css";
import {withTranslation} from 'react-i18next'
import _ from 'lodash'

const FRONT_END_STYLE = {
    laser: {
        state_0: styles.front_end_laser_off,
        state_1: styles.front_end_laser_on,
    },
    air_pick: {
        state_0: styles.front_end_air_off,
        state_1: styles.front_end_air_place,
        state_2: styles.front_end_air_pick

    },
    soft_gripper: {
        state_0: styles.front_end_air_off,
        state_1: styles.front_end_soft_neutral,
        state_2: styles.front_end_soft_grip,
        state_3: styles.front_end_soft_release
    },
    rotary_air_pick: {
        state_0: styles.front_end_air_off,
        state_1: styles.front_end_air_place,
        state_2: styles.front_end_air_pick
    },
    rotary_soft_gripper: {
        state_0: styles.front_end_air_off,
        state_1: styles.front_end_soft_neutral,
        state_2: styles.front_end_soft_grip,
        state_3: styles.front_end_soft_release
    }
};

class Index extends React.Component {
    state = {
        // 当前旋转模式
        currentRotary: teach_and_play.front_end.options.rotary_air_pick.default_rotary,

        // 旋转角度
        rotationAngel: {
            rotary_air_pick: {
                rotary_0: 15,
                rotary_1: 15,
                rotary_2: 15
            },
            rotary_soft_gripper: {
                rotary_0: 15,
                rotary_1: 15,
                rotary_2: 15
            }
        }
    }

    actions = {
        setTeachAndPlay: (event) => {
            if (event.target.checked) {
                this.props.setShowFrontEndSelect(true);
            } else {
                this.props.setTeachAndPlay(false)
            }
        },

        // 设置旋转方式
        onSetRotary: (event) => {
            // console.log('🔥 ' + event.target.value)
            this.setState({
                currentRotary: event.target.value
            })
        },

        // 旋转按钮点击
        onRotaryButtonClick: (gcodePrefix) => {
            const gcode = `${gcodePrefix}${this.state.rotationAngel[this.props.currentFrontEnd][this.state.currentRotary]}`
            this.props.startTask(gcode, false);
            this.setState({
                prevRotateGcodePrefix: gcodePrefix
            })
        },

        // 输入旋转角度
        setRotate: (rotate) => {
            const _rotationAngle = _.cloneDeep(this.state.rotationAngel)
            _rotationAngle[this.props.currentFrontEnd][this.state.currentRotary] = rotate
            this.setState({
                rotationAngel: _rotationAngle
            })
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
            repeatCount,
            t
        } = this.props;

        const frontEndOptions = [];
        Object.keys(teach_and_play.front_end.options).forEach((key) => {
            const option = teach_and_play.front_end.options[key];
            frontEndOptions.push({value: key, label: t(option.label)})
        });
        const frontEndStateOptions = [];
        const frontEndState = teach_and_play.front_end.options[currentFrontEnd].state;
        Object.keys(frontEndState).forEach((key) => {
            frontEndStateOptions.push(<Radio.Button value={key} key={key}>{t(frontEndState[key].label)}</Radio.Button>);
        });

        // 旋转选项
        const rotaryOptions = []

        // 前端配置文件
        const frontEndOptionsObj = teach_and_play.front_end.options;

        // 当前前端模块的rotary
        const frontEndRotary = frontEndOptionsObj[currentFrontEnd].rotary;

        frontEndRotary && Object.keys(frontEndRotary).forEach((key) => {
            rotaryOptions.push(
                <Radio.Button 
                    value={key} 
                    key={key}>
                    {t(frontEndRotary[key].label)}
                </Radio.Button>
            );
        })

        // 当前前端模块的buttons
        const frontEndButtons = frontEndOptionsObj[currentFrontEnd].buttons
            ? frontEndOptionsObj[currentFrontEnd].buttons
                .filter((item) => item.type === this.state.currentRotary)
            : []

        // 当前前端的额外按钮
        const frontEndExtras = []

        // 加入按钮
        frontEndButtons && frontEndButtons.forEach((item) => {
            frontEndExtras.push(
                <Radio.Button 
                    value={item.label} 
                    key={item.order}
                    className={styles[`btn_${item.label}`]}
                    onClick={() => this.actions.onRotaryButtonClick(item.gcode)}>
                    {/* {item.label} */}
                </Radio.Button>
            )
        })

        // 当前前端模块的角度输入配置
        const frontEndAngle = frontEndOptionsObj[currentFrontEnd].angle || null;

        frontEndAngle && frontEndExtras.splice(
            frontEndExtras.length === 2 ? 1 : 0, 
            0,
            <NumberInput
                key={frontEndAngle.order}
                min={frontEndAngle.minimum_value}
                max={frontEndAngle.maximum_value}
                value={this.state.rotationAngel[currentFrontEnd][this.state.currentRotary]}
                style={{width: '90px'}}
                onAfterChange={this.actions.setRotate}
            />
        )

        const gutter = 8

        return (
            <div style={{
                width: "100%",
                height: "100%",
                fontSize: "13px"
            }}>
                <div style={{padding: "5px"}}>
                    {/* 示教模式 */}
                    <Row style={{ marginBottom: '8px' }}>
                        <Col span={15}>
                            <span> {t('Teach & Play Mode')}</span>
                        </Col>
                        <Col span={9} align={"right"}>
                            <Checkbox checked={teachAndPlayMode}
                                      onChange={this.actions.setTeachAndPlay}>
                                {t(teachAndPlayMode ? 'On' : 'Off')}
                            </Checkbox>
                        </Col>
                    </Row>
                    {/* 当前前端名称 */}
                    {teachAndPlayMode &&
                    <Row style={{ marginBottom: '8px' }}>
                        <Col span={10}>
                            <span> {t(teach_and_play.front_end.options[this.props.currentFrontEnd].label)}</span>
                        </Col>
                        <Col span={14} align={"right"}>{/*前端模块*/}
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
                    {/* 激光功率 */}
                    {teachAndPlayMode && currentFrontEnd === "laser" &&
                    <Row style={{ marginBottom: '8px' }}>
                        <Col span={8}>
                            <span> {t(teach_and_play.front_end.options.laser.power.label) + "(%)"}</span>
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
                    {/* 旋转吸盘 */}
                    {teachAndPlayMode && currentFrontEnd.toLowerCase().startsWith('rotary') && 
                    <Row style={{ marginBottom: '8px' }}>
                        <Col span={6}>
                            <span>{t("Rotary")}</span>
                        </Col>
                        <Col span={18} align={"right"}>
                            <Radio.Group
                                buttonStyle="solid"
                                size="small"
                                optionType="button"
                                value={this.state.currentRotary}
                                onChange={this.actions.onSetRotary}>
                                {rotaryOptions}
                            </Radio.Group>
                        </Col>
                    </Row>}
                    {/* 旋转柔性爪 */}
                    {teachAndPlayMode && currentFrontEnd.toLowerCase().startsWith('rotary') &&
                    <Row style={{ marginBottom: '8px' }}>
                        <Col span={6}>
                            <span></span>
                        </Col>
                        <Col span={18} align={"right"}>
                            <div className={'ant-radio-group-small'}>
                                <Space>
                                    {frontEndExtras}
                                </Space>
                            </div>
                        </Col>
                    </Row>}
                </div>

                <Line/>
                {/* 重复次数 */}
                <div style={{padding: "6px 6px 0px 6px "}}>
                    <Row>
                        <Col span={16}>
                            <span> {t(teach_and_play.repeatCount.label)}</span>
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
                    {/* 按钮组合 */}
                    <div style={{textAlign: "center"}}>
                        {/* 录制 */}
                        <button 
                            className={styles.button_record} 
                            onClick={this.props.recordStep}
                            disabled={!(teachAndPlayMode)}
                        />
                        {/* 播放 */}
                        <button 
                            className={styles.button_start} 
                            onClick={() => this.props.startPlayStep()}
                            disabled={!(stepArray.length > 0)}
                        />
                        {/* 停止 */}
                        <button 
                            className={styles.button_stop} 
                            onClick={this.props.stopPlayStep}
                            disabled={!(stepArray.length > 0)}
                        />
                    </div>
                </div>

                <Line/>
                <List
                    style={{padding: "6px 6px 40px 6px"}}
                    grid={{gutter: 1, column: 1}}
                    dataSource={stepArray}
                    renderItem={(item, index) => (
                        <List.Item style={{marginBottom: '0px'}}>
                            {/* 行 */}
                            <Row>
                                {/* 索引顺序 */}
                                <Col span={2}>
                                    <div className={styles.div_num}>
                                        {index + 1}
                                    </div>
                                </Col>
                                <Col 
                                    span={22} className={styles.div_card}
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
                                                <Row>
                                                    <Col span={8}>R</Col>
                                                    <Col span={16}>{item.r || 0}</Col>
                                                </Row>
                                            </Col>
                                            <Col span={12} align={"center"}>
                                                <img
                                                    className={FRONT_END_STYLE[item.currentFrontEnd][item.currentFrontEndState]}/>
                                                <div>
                                                    {t(teach_and_play.front_end.options[item.currentFrontEnd].state[item.currentFrontEndState].label)}
                                                </div>
                                            </Col>
                                        </Row>
                                        <button 
                                            className={styles.btn_delete}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                this.props.deleteStep(index);
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Col>
                                    {t('Set Delay') + '(s)'}:
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
                    title={t("select front end")}
                    visible={this.props.showFrontEndSelect}
                    cancelText={t("Cancel")}
                    okText={t("Save")}
                    onCancel={this.actions.onCancel}
                    onOk={this.actions.onOk}>
                    {/*<Space direction={"vertical"}>*/}
                    <Select style={{width: 300}}
                            onChange={this.props.onSelectFrontEnd}
                            placeholder={t("select front end")}
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
        setTeachAndPlay: (isTeachAndPlayMode) => dispatch(teachAndPlayActions.setTeachAndPlay(isTeachAndPlayMode)),
        setShowFrontEndSelect: (show) => dispatch(teachAndPlayActions.setShowFrontEndSelect(show)),
        onSelectFrontEnd: (front_end) => dispatch(teachAndPlayActions.onSelectFrontEnd(front_end)),
        setFrontEndState: (event) => dispatch(teachAndPlayActions.setFrontEndState(event.target.value)),
        setLaserPower: (power) => dispatch(teachAndPlayActions.setLaserPower(power)),
        setRepeatCount: (repeatCount) => dispatch(teachAndPlayActions.setRepeatCount(repeatCount)),
        updateStep: (step, index) => dispatch(teachAndPlayActions.updateStep(step, index)),
        deleteStep: (index) => dispatch(teachAndPlayActions.deleteStep(index)),
        exportGcode: () => dispatch(teachAndPlayActions.exportGcode()),
        startTask: (gcode, isAckChange) => dispatch(gcodeSendActions.startTask(gcode, isAckChange)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

