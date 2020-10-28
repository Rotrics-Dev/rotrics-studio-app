import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Radio, Row, Col, Select, Switch, Slider, Space} from 'antd';
import styles from './styles.css';
import {actions as headerActions} from "../../../../reducers/header"
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import ConfigTitle from "../../../../components/Config/ConfigTitle/index.jsx";

const MODULE_NAMES = [
    'Laser',
    '3D Print',
    // 'Pen Holder', //应该有两个参数：停笔高度，抬笔高度
    'Air Pick',
    'Soft Gripper'
];
const STATES_AIR_PICK = ['pick', 'release', 'off'];
const STATES_SOFT_GRIPPER = ['grip', 'neutral', 'release', 'off'];

class Index extends React.Component {
    state = {
        curModule: 'Laser', //Laser, 3D Print, Pen Holder, Air Pick, Soft Gripper
        isLaserOn: false,
        laserPowerPercent: 1,
        //TODO: 查询状态，保证软件和硬件同步
        //TODO: 若无法同步，则应该考虑使用button而不是Radio，button表示click后发送指定的命令
        curState4airPick: null,
        curState4softGripper: null
    };

    actions = {
        //TODO: gcode是异步的，存在发送不成功，但ui已经更新的问题；存在ui和状态不一致的问题
        changeModule: (value) => {
            this.setState({curModule: value});
            let gcode = null;
            switch (value) {
                case 'Laser':
                    gcode = 'M888 P1';
                    break;
                case '3D Print':
                    gcode = 'M888 P3';
                    break;
                case 'Pen Holder':
                    gcode = 'M888 P0';
                    break;
                case 'Air Pick':
                case 'Soft Gripper':
                    gcode = 'M888 P2';
                    break;
            }
            this.props.send(gcode);
        }
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    actions4laser = {
        toggleLaser: (checked) => {
            this.setState({isLaserOn: checked});
            let gcode = null;
            if (checked) {
                gcode = `M3 S${Math.round(this.state.laserPowerPercent * 2.55)}`;
            } else {
                gcode = "M5";
            }
            this.props.send(gcode);
        },
        changePowerPercent: (value) => {
            this.setState({laserPowerPercent: value})
        },
        afterChangePowerPercent: (value) => {
            this.setState({laserPowerPercent: value, isLaserOn: true}, () => {
                this.props.send(`M3 S${Math.round(this.state.laserPowerPercent * 2.55)}`);
            });
        }
    };

    actions4airPick = {
        changeState: (e) => {
            const value = e.target.value;
            this.setState({curState4airPick: value});
            let gcode = null;
            switch (value) {
                case 'pick':
                    gcode = 'M1000';
                    break;
                case 'release':
                    gcode = 'M1002';
                    break;
                case 'off':
                    gcode = 'M1003';
                    break;
            }
            this.props.send(gcode);
        }
    };

    actions4softGripper = {
        changeState: (e) => {
            const value = e.target.value;
            this.setState({curState4softGripper: value});
            let gcode = null;
            switch (value) {
                case 'grip':
                    gcode = 'M1001';
                    break;
                case 'release':
                    gcode = 'M1000';
                    break;
                case 'neutral':
                    gcode = 'M1002';
                    break;
                case 'off':
                    gcode = 'M1003';
                    break;
            }
            this.props.send(gcode);
        }
    };

    render() {
        const actions = this.actions;
        const actions4laser = this.actions4laser;
        const actions4airPick = this.actions4airPick;
        const actions4softGripper = this.actions4softGripper;

        const state = this.state;
        const {curModule} = this.state;
        const {t} = this.props;
        const {changeVisible4p3dCalibration} = this.props;
        const gutter = 8;
        return (
            <div className={styles.div_tap}>
                <ConfigTitle text={t('Front end')}/>
                <Select
                    value={state.curModule}
                    onChange={actions.changeModule}
                    style={{width: "100%", marginBottom: "15px"}}
                >
                    {MODULE_NAMES.map(value => {
                        return (
                            <Select.Option
                                key={value}
                                value={value}
                            >
                                {value}
                            </Select.Option>
                        );
                    })}
                </Select>
                {curModule === 'Laser' &&
                <div>
                    <span>{'Power'}</span>
                    <Switch
                        size="small"
                        style={{marginLeft: "5px"}}
                        checked={state.isLaserOn}
                        onChange={actions4laser.toggleLaser}
                    />
                    <Slider
                        style={{width: "97%"}}
                        min={1}
                        max={100}
                        step={1}
                        value={state.laserPowerPercent}
                        onChange={actions4laser.changePowerPercent}
                        onAfterChange={actions4laser.afterChangePowerPercent}
                    />
                </div>
                }
                {curModule === '3D Print' &&
                <Row gutter={[gutter, gutter]}>
                    <Col span={12}>
                        <input
                            type="button"
                            value={t("Level")}
                            className={styles.btn_action_work}
                            onClick={() => {
                                changeVisible4p3dCalibration(true);
                            }}
                        />
                    </Col>
                </Row>
                }
                {curModule === 'Air Pick' &&
                <Space direction={"vertical"} style={{width: "100%"}}>
                    <Radio.Group onChange={actions4airPick.changeState} value={state.curState4airPick}>
                        {STATES_AIR_PICK.map(value => {
                            return (<Radio.Button key={value} value={value}>{t(value)}</Radio.Button>);
                        })}
                    </Radio.Group>
                </Space>
                }
                {curModule === 'Soft Gripper' &&
                <Space direction={"vertical"} style={{width: "100%"}}>
                    <Radio.Group onChange={actions4softGripper.changeState} value={state.curState4softGripper}>
                        {STATES_SOFT_GRIPPER.map(value => {
                            return (<Radio.Button key={value} value={value}>{t(value)}</Radio.Button>);
                        })}
                    </Radio.Group>
                </Space>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {controlPanelVisible} = state.header;
    return {
        controlPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        send: (gcode) => dispatch(gcodeSendActions.send(gcode)),
        changeVisible4p3dCalibration: (value) => dispatch(headerActions.changeVisible4p3dCalibration(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
