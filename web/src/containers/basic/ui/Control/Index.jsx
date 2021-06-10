import React from 'react';
import DeviceControl from '../../../_deviceControl/Index.jsx'
import teach_and_play from '../../lib/settings/teach_and_play.json';
import movement from '../../lib/settings/movement.json';
import accessories from '../../lib/settings/accessories.json'
import {List, Modal, Space, Select, Row, Col, Radio, Input, message} from 'antd';
import front_end from "../../lib/settings/front_end.json";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as serialPortActions} from "../../../../reducers/serialPort";
import Line from '../../../../components/Line/Index.jsx'

import {connect} from 'react-redux';
import NumberInput from "../../../../components/NumberInput/Index.jsx";
import {ConfigTitle} from "../../../../components/Config";
import {withTranslation} from 'react-i18next'
import styles from './style.css'
import _ from 'lodash'

class Index extends React.Component {
    state = {
        laserPower: teach_and_play.front_end.options.laser.power.default_value,
        currentFrontEnd: teach_and_play.front_end.default_value,
        currentFrontEndState: teach_and_play.front_end.options[teach_and_play.front_end.default_value].default_value,
        currentMovementMode: 'fast_mode',

        // 当前配件
        currrentAccessory: 'sliding_rail',

        // 滑轨是否已初始化
        isSlidingRadilInit: false,
        
        // 当前滑轨步长
        slidingRailStepLength: accessories.sliding_rail.feat_list[1].menus[1].default_value,

        // 当前传送带步长
        conveyorBeltStepLength: accessories.conveyor_belt.feat_list[0].menus[2].default_value,

        // 当前熟读
        currentSpeed: movement.speed.default_value,

        // 当前旋转模式
        currentRotary: teach_and_play.front_end.options.rotary_air_pick.default_rotary,

        // 上一次使用旋转的命令
        prevRotateGcodePrefix: '',

        // 上一次使用配件命令
        prevSlidingGcode: { prefix: '', suffix: '' },

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
    };
    actions = {
        // 选择前端模块事件
        onSelectFrontEnd: (frontEnd) => {
            // 当前前端
            const currentFrontEnd = teach_and_play.front_end.options[frontEnd];

            // 当前前端默认state
            const currentFrontEndState = currentFrontEnd.state[currentFrontEnd.default_value];

            // 前端gcode & state的gcode
            const gcodeArr = [currentFrontEnd.gcode, currentFrontEndState.gcode];

            this.props.startTask(gcodeArr.join('\n'), false);

            // 更新数据
            this.setState({
                laserPower: teach_and_play.front_end.options.laser.power.default_value,
                currentFrontEnd: frontEnd,
                currentFrontEndState: currentFrontEnd.default_value
            });
        },

        onSelectMovementMode: (movementMode) => {
            this.props.startTask(movement.mode[movementMode].gcode, false);
            this.setState({currentMovementMode: movementMode});
        },

        // 选择动作事件
        onSetFrontEndState: (event) => {
            const frontEndState = event.target.value;
            const currentFrontEndState = teach_and_play.front_end.options[this.state.currentFrontEnd].state[frontEndState];
            this.props.startTask(currentFrontEndState.gcode, false);
            this.setState({
                currentFrontEndState: frontEndState
            });
        },

        // 设置旋转方式
        onSetRotary: (event) => {
            // console.log('🔥 ' + event.target.value)
            this.setState({
                currentRotary: event.target.value
            })
        },

        // 设置镭射功率
        setLaserPower: (power) => {
            this.props.startTask(`M3 S${Math.round(power * 2.55)}`, false);
            this.setState({
                laserPower: power,
                currentFrontEndState: 'state_1'//switch to  laser on
            });
        },

        // 设置速率
        setSpeed: (speed) => {
            this.props.startTask(`G0 F${speed}`, false);
            this.setState({
                currentSpeed: speed,
            });
        },

        // 旋转按钮点击
        onRotaryButtonClick: (gcodePrefix) => {
            const gcode = `${gcodePrefix}${this.state.rotationAngel[this.state.currentFrontEnd][this.state.currentRotary]}`
            this.props.startTask(gcode, false);
            this.setState({
                prevRotateGcodePrefix: gcodePrefix
            })
        },

        // 输入旋转角度
        setRotate: (rotate) => {
            const _rotationAngle = _.cloneDeep(this.state.rotationAngel)
            _rotationAngle[this.state.currentFrontEnd][this.state.currentRotary] = rotate
            this.setState({
                rotationAngel: _rotationAngle
            }, () => {
                if (!this.state.prevRotateGcodePrefix) return
                const gcode = `${this.state.prevRotateGcodePrefix}${rotate}`
                this.props.startTask(gcode, false);
            })
        },

        // 选择配置
        onSelectAccessory: (accessory) => {
            this.setState({
                currrentAccessory: accessory,
                isSlidingRadilInit: false
            });
            
            
            // 初始化步长
            const feat_list = accessories[accessory].feat_list
            const all_meuns = feat_list.map((item) => item.menus)
            const input_menu = all_meuns.find((item) => item.title === 'step_length')
            if (!input_menu) return

            if (accessory === 'sliding_rail') {
                this.setState({ slidingRailStepLength: input_menu.default_value })
            } else {
                this.setState({ conveyorBeltStepLength: input_menu.default_value })
            }
        },

        // 滑轨点击
        onSlidingRailClick: (menu) => {
            if (menu.title === 'power') {
                // 初始化
                this.props.startTask(menu.gcode, false);
                this.setState({
                    prevSlidingGcode: { prefix: '', suffix: '' },
                    isSlidingRadilInit: true
                }, () => {
                    message.success("滑轨初始化成功")
                })
            } else {
                // 前进或后退
                if (!this.state.isSlidingRadilInit) {
                    message.warn("请先点击初始化按钮")
                    return
                }

                const gcode = `${menu.gcode_prefix}${this.state.slidingRailStepLength}${menu.gcode_suffix}${this.state.currentSpeed}`
                this.props.startTask(`G91\n${gcode}\nG90\nM114`, false);
                this.setState({
                    prevSlidingGcode: { prefix: menu.gcode_prefix, suffix: menu.gcode_suffix }
                })
            }
        },

        // 传送带点击
        onConveyorBeltClick: (menu) => {
            if (menu.title === 'stop') {
                this.props.startTask(menu.gcode, false);
                this.setState({
                    prevSlidingGcode: { prefix: '', suffix: '' }
                })
            } else {
                const gcode = `${menu.gcode_prefix}${this.state.conveyorBeltStepLength}${menu.gcode_suffix}`
                this.props.startTask(gcode, false);
                this.setState({
                    prevSlidingGcode: { prefix: menu.gcode_prefix, suffix: menu.gcode_suffix }
                })
            }
        },

        // 传送带输入步长
        setAccessorySlidingRailStep: (stepLength) => {
            this.setState({ slidingRailStepLength: stepLength }, () => {
                // 再执行一次
                const { prefix, suffix } = this.state.prevSlidingGcode
                if (!prefix || !suffix) return
                const gcode = `${prefix}${this.state.slidingRailStepLength}${suffix}`
                this.props.startTask(`G91\n${gcode}\nG90\nM114`, false);
                // this.props.startTask(gcode, false);
            })
        },

        // 滑轨输入步长
        setAccessoryConveyorBeltStep: (stepLength) => {
            this.setState({ conveyorBeltStepLength: stepLength }, () => {
                // 再执行一次
                const { prefix, suffix } = this.state.prevSlidingGcode
                if (!prefix || !suffix) return
                const gcode = `${prefix}${this.state.conveyorBeltStepLength}${suffix}`
                this.props.startTask(gcode, false);
            })
        }
    };

    render() {
        const {t} = this.props;
        const { isSlidingRadilInit } = this.state
        const movementModeOptions = [];
        Object.keys(movement.mode).forEach((key) => {
            movementModeOptions.push({value: key, label: t(movement.mode[key].label)})
        });

        // 前端配置文件
        const frontEndOptionsObj = teach_and_play.front_end.options;

        // 前端下拉选项
        const frontEndOptions = [];
        Object.keys(teach_and_play.front_end.options).forEach((key) => {
            frontEndOptions.push({value: key, label: t(frontEndOptionsObj[key].label)})
        });

        const frontEndStateOptions = [];
        
        // 当前前端模块的state
        const frontEndState = frontEndOptionsObj[this.state.currentFrontEnd].state;

        // 当前前端模块的state选项列表
        Object.keys(frontEndState).forEach((key) => {
            frontEndStateOptions.push(
                <Radio.Button 
                    value={key} 
                    key={key}>
                    {t(frontEndState[key].label)}
                </Radio.Button>);
        });

        // 当前前端模块的rotary
        const frontEndRotary = frontEndOptionsObj[this.state.currentFrontEnd].rotary;

        // 旋转选项
        const rotaryOptions = []
        frontEndRotary && Object.keys(frontEndRotary).forEach((key) => {
            rotaryOptions.push(
                <Radio.Button 
                    value={key} 
                    key={key}>
                    {t(frontEndRotary[key].label)}
                </Radio.Button>
            );
        })

        // 当前前端模块的角度输入配置
        const frontEndAngle = frontEndOptionsObj[this.state.currentFrontEnd].angle || null;
        
        // 当前前端模块的buttons
        const frontEndButtons = frontEndOptionsObj[this.state.currentFrontEnd].buttons
            ? frontEndOptionsObj[this.state.currentFrontEnd].buttons
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

        frontEndAngle && frontEndExtras.splice(
            frontEndExtras.length === 2 ? 1 : 0, 
            0,
            <NumberInput
                key={frontEndAngle.order}
                min={frontEndAngle.minimum_value}
                max={frontEndAngle.maximum_value}
                value={this.state.rotationAngel[this.state.currentFrontEnd][this.state.currentRotary]}
                style={{width: '90px'}}
                onAfterChange={this.actions.setRotate}
            />
        )

        // accessories选项
        const accessoryOptions = Object.keys(accessories).map((key) => ({
            value: key,
            label:  t(accessories[key].label)
        }))

        // Sliding Rail 菜单
        let accessorySlidingRail = []
        accessories['sliding_rail'].feat_list.forEach((item) => {
            accessorySlidingRail.push(
                <Row key={item.title}>
                    <Col span={10}>
                        <span>{t(item.title)}{item.title_suffix || ''}</span>
                    </Col>
                    <Col span={14} align={"right"}>
                        <div className={'ant-radio-group-small'}>
                            <Space>
                                {item.menus.map((menu) => {
                                return menu.type === 'button' ? <Radio.Button 
                                    value={menu.gcode} 
                                    key={menu.title}
                                    className={styles[`btn_${menu.title}${isSlidingRadilInit ? '' : '_disable'}`]}
                                    onClick={() => this.actions.onSlidingRailClick(menu)}>
                                </Radio.Button> : <NumberInput
                                    key={menu.title}
                                    min={menu.minimum_value}
                                    max={menu.maximum_value}
                                    disabled={!isSlidingRadilInit}
                                    value={this.state.slidingRailStepLength}
                                    style={{width: '90px'}}
                                    onAfterChange={this.actions[menu.callback]}
                                />}
                                )}
                            </Space>
                        </div>
                    </Col>
                </Row>
            )
        })

        // Conveyor Belt 菜单
        let accessoryConveyorBelt = []
        accessories['conveyor_belt'].feat_list.forEach((item) => {
            accessoryConveyorBelt.push(
                <Row key={item.title}>
                    <Col span={8}>
                        <span>{t(item.title)}{item.title_suffix || ''}</span>
                    </Col>
                    <Col span={16} align={"right"}>
                        <div className={'ant-radio-group-small'}>
                            <Space>
                                {item.menus.map((menu) => {
                                return menu.type === 'button' ? <Radio.Button 
                                    value={menu.gcode} 
                                    key={menu.title}
                                    className={styles[`btn_${menu.title}`]}
                                    onClick={() => this.actions.onConveyorBeltClick(menu)}>
                                </Radio.Button> : <NumberInput
                                    key={menu.title}
                                    min={menu.minimum_value}
                                    max={menu.maximum_value}
                                    value={this.state.conveyorBeltStepLength}
                                    style={{width: '70px'}}
                                    onAfterChange={this.actions[menu.callback]}
                                />}
                                )}
                            </Space>
                        </div>
                    </Col>
                </Row>
            )
        })

        return (
            <div>
                <DeviceControl/>
                <Line/>
                {/* 运动模式 */}
                <div style={{padding: "6px"}}>
                    <ConfigTitle text={t("Motion Mode")}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        <Select
                            style={{width: "100%", textAlign: "center"}}
                            onChange={this.actions.onSelectMovementMode}
                            value={this.state.currentMovementMode}
                            options={movementModeOptions}
                        />
                        <Row>
                            <Col span={12}>
                                <span> {`${t(movement.speed.label)}(${movement.speed.unit})`}</span>
                            </Col>
                            <Col span={12} align={"right"}>
                                <NumberInput
                                    min={movement.speed.minimum_value}
                                    max={movement.speed.maximum_value}
                                    defaultValue={movement.speed.default_value}
                                    step={movement.speed.step}
                                    value={this.state.currentSpeed}
                                    onAfterChange={this.actions.setSpeed}
                                />
                            </Col>
                        </Row>
                    </Space>
                </div>
                <Line/>
                {/* 前端模块 */}
                <div style={{padding: "6px", width: "100%"}}>
                    <ConfigTitle text={t("Front End")}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        {/* 前端模块 下拉选择器 */}
                        <Select
                            style={{width: "100%", textAlign: "center"}}
                            onChange={this.actions.onSelectFrontEnd}
                            placeholder={t("select front end")}
                            value={this.state.currentFrontEnd}
                            options={frontEndOptions}
                        />
                        {/* 动作 */}
                        <Row>
                            {/* 标题 */}
                            <Col span={6}>
                                <span>{t("Actions")}</span>
                            </Col>
                            {/* 当前前端模块的 state 列表 */}
                            <Col span={18} align={"right"}>
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
                        {/* 仅当前端模块为镭射时显示 */}
                        {this.state.currentFrontEnd === "laser" &&
                        <Row>
                            {/* 标题 */}
                            <Col span={6}>
                                <span>{t("Rotary")}</span>
                            </Col>
                            {/* 当前前端模块的 rotary 列表 */}
                            <Col span={18} align={"right"}>
                                <Radio.Group
                                    buttonStyle="solid"
                                    size="small"
                                    optionType="button"
                                    value={this.state.currentFrontEndState}
                                    onChange={this.actions.onSetFrontEndState}>
                                    {frontEndStateOptions}
                                </Radio.Group>
                            </Col>
                        </Row>}
                        {/* 仅当前端模块为旋转相关时显示 */}
                        {this.state.currentFrontEnd.toLowerCase().startsWith('rotary') &&
                        <Row>
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
                        {/* 仅当前端模块为旋转相关时显示 */}
                        {this.state.currentFrontEnd.toLowerCase().startsWith('rotary') &&
                        <Row>
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
                    </Space>
                </div>
                <Line />
                {/* Accessories */}
                <div style={{padding: "6px"}}>
                    <ConfigTitle text={t("Accessories")}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        {/* 下拉选择 */}
                        <Select
                            style={{width: "100%", textAlign: "center"}}
                            onChange={this.actions.onSelectAccessory}
                            value={this.state.currrentAccessory}
                            options={accessoryOptions}
                        />
                        {/* 仅当accessoryMode为sliding_rail显示 */}
                        {this.state.currrentAccessory === 'sliding_rail' &&
                        accessorySlidingRail
                        }
                        {/* 仅当accessoryMode为conveyor_belt显示 */}
                        {this.state.currrentAccessory === 'conveyor_belt' &&
                        accessoryConveyorBelt
                        }
                    </Space>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        startTask: (gcode, isAckChange) => dispatch(gcodeSendActions.startTask(gcode, isAckChange)),
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Index));

