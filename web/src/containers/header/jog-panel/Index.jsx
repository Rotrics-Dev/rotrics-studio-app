import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {withTranslation} from 'react-i18next';
import {Radio, Row, Col, Switch, Slider, Space} from 'antd';
import styles from './styles.css';
import {actions as headerActions} from "../../../reducers/header"
import {actions as gcodeSendActions} from "../../../reducers/gcodeSend";
import PositionMonitor from "../../../components/PositionMoniter/index.jsx";
import ConfigTitle from "../../../components/Config/ConfigTitle/index.jsx";
import {FRONT_END} from "../../../utils/workAreaUtils";
import {TAP_BASIC, TAP_LASER, TAP_P3D} from "../../../constants";
import messageI18n from "../../../utils/messageI18n";
import movement from "../../basic/lib/settings/movement";
import NumberInput from "../../../components/NumberInput/Index.jsx";
import ModuleControl from "./ModuleControl.jsx";

const INIT_LASER_POWER = 1;

class Index extends React.Component {
    state = {
        step: 10,
        position: {x: 0, y: 0},

        //laser
        isLaserOn: false,
        laserPower: INIT_LASER_POWER
    };

    actions = {
        //step
        setStep: (e) => {
            this.setState({step: e.target.value})
        },
        //xyz
        xPlus: () => {
            this.actions._move(`G0 X${this.state.step}`)
        },
        xMinus: () => {
            this.actions._move(`G0 X${-this.state.step}`)
        },
        yPlus: () => {
            this.actions._move(`G0 Y${this.state.step}`)
        },
        yMinus: () => {
            this.actions._move(`G0 Y${-this.state.step}`)
        },
        zPlus: () => {
            this.actions._move(`G0 Z${this.state.step}`)
        },
        zMinus: () => {
            this.actions._move(`G0 Z${-this.state.step}`)
        },
        z0: () => {
            this.props.startTask("G0 Z0", false)
        },
        //others
        home: () => {
            const gcode = ['M1112', 'M114'].join("\n");
            this.props.startTask(gcode, false)
        },
        leftTop: () => {
            this.actions._move(`G0 X${-this.state.step} Y${this.state.step}`)
        },
        leftBottom: () => {
            this.actions._move(`G0 X${-this.state.step} Y${-this.state.step}`)
        },
        rightTop: () => {
            this.actions._move(`G0 X${this.state.step} Y${this.state.step}`)
        },
        rightBottom: () => {
            this.actions._move(`G0 X${this.state.step} Y${-this.state.step}`)
        },
        setWorkOrigin: () => {
            const {frontEnd} = this.props;
            this.props.serialPortWrite('G92.1\n')
            this.props.addOneShootGcodeResponseListener(
                'M114', (x, y, z) => {
                    console.log(` 'M114', (${x}, ${y}, ${z})`)
                    switch (frontEnd) {
                        case FRONT_END.P3D:
                            this.props.setWorkHeightP3d(z);
                            break;
                        case FRONT_END.PEN:
                            this.props.setWorkHeightPen(z);
                            break;
                        case FRONT_END.LASER:
                            this.props.setWorkHeightLaser(z);
                            break;
                    }
                }
            );
            this.props.serialPortWrite('M114\n')
            this.props.serialPortWrite('G92 Z0\n')
        },
        goToWorkOrigin: () => {
            // console.log('goToWorkOrigin'+JSON.stringify(this.props));
            // const {frontEnd} = this.props;
            // let workHeight = 0;
            // switch (frontEnd) {
            //     case FRONT_END.P3D :
            //         workHeight = this.props.workHeightP3d;
            //         break;
            //     case FRONT_END.PEN :
            //         workHeight = this.props.workHeightPen;
            //         break;
            //     case FRONT_END.LASER :
            //         workHeight = this.props.workHeightLaser;
            //         break;
            // }
            // this.props.startTask(`G0 Z${workHeight}\n`, false)
            this.props.startTask(`G0 Z0\n`, false)
        },
        //G90: absolute position
        //G91: relative position
        //G92: set position
        _move: (moveCmd) => {
            const gcode = ['G91', moveCmd, 'G90', 'M114'].join("\n");
            this.props.startTask(gcode, false)
        }
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    actions4laser = {
        toggleLaser: (checked) => {
            this.setState({isLaserOn: checked, laserPower: INIT_LASER_POWER}, () => {
                this.actions4laser._sendGcode();
            });
        },
        changeLaserPower: (value) => {
            this.setState({laserPower: value})
        },
        afterChangeLaserPower: (value) => {
            this.setState({laserPower: value}, () => {
                this.actions4laser._sendGcode();
            });
        },
        _sendGcode: () => {
            const {isLaserOn, laserPower} = this.state;
            let gcode = "";
            if (isLaserOn) {
                gcode = `M3 S${Math.round(laserPower * 2.55)}`
            } else {
                gcode = "M5"
            }
            this.props.startTask(gcode);
        }
    };

    render() {
        if (!this.props.jogPanelVisible) {
            return null;
        }
        const actions = this.actions;
        const actions4laser = this.actions4laser;
        const state = this.state;
        const {t} = this.props;
        const {tap, changeVisibility4jogPanel, changeVisibility4p3dCalibration, path} = this.props;
        const gutter = 8;
        return (
            <Draggable
                defaultPosition={state.position}
                onStop={(e, data) => {
                    const {x, y} = data;
                    this.setState({position: {x, y}})
                }}>
                <div className={styles.div_root}>
                    <PositionMonitor/>
                    <input
                        type="button"
                        className={styles.btn_close}
                        onClick={() => {
                            changeVisibility4jogPanel(false)
                        }}/>
                    <Row gutter={[gutter, gutter]}>
                        <Col span={6}>
                            <input type="button" onClick={actions.leftTop} className={styles.btn_left_top}/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.yPlus} className={styles.btn_xyz} value="Y+"/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.rightTop} className={styles.btn_right_top}/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.zPlus} className={styles.btn_xyz} value="Z+"/>
                        </Col>
                    </Row>
                    <Row gutter={[gutter, gutter]}>
                        <Col span={6}>
                            <input type="button" onClick={actions.xMinus} className={styles.btn_xyz} value="X-"/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.home} className={styles.btn_xyz} value="Home"/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.xPlus} className={styles.btn_xyz} value="X+"/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.z0} className={styles.btn_xyz} value="Z0"/>
                        </Col>
                    </Row>
                    <Row gutter={[gutter, gutter]}>
                        <Col span={6}>
                            <input type="button" onClick={actions.leftBottom} className={styles.btn_left_bottom}/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.yMinus} className={styles.btn_xyz} value="Y-"/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.rightBottom} className={styles.btn_right_bottom}/>
                        </Col>
                        <Col span={6}>
                            <input type="button" onClick={actions.zMinus} className={styles.btn_xyz} value="Z-"/>
                        </Col>
                    </Row>
                    <Row gutter={[gutter, gutter]}>
                        <Col span={12}>
                            <input type="button" onClick={actions.goToWorkOrigin} className={styles.btn_action_work}
                                   value={t("Go To Work Height")}/>
                        </Col>
                        <Col span={12}>
                            <input type="button" onClick={actions.setWorkOrigin} className={styles.btn_action_work}
                                   value={t("Set Work Height")}/>
                        </Col>
                    </Row>
                    <div>
                        <ConfigTitle text={`${t("Step length")}(mm)`}/>
                        <Radio.Group value={state.step} buttonStyle="solid" onChange={actions.setStep}>
                            <Radio.Button value={20} className={styles.btn_step}>20</Radio.Button>
                            <Radio.Button value={10} className={styles.btn_step}>10</Radio.Button>
                            <Radio.Button value={5} className={styles.btn_step}>5</Radio.Button>
                            <Radio.Button value={1} className={styles.btn_step}>1</Radio.Button>
                            <Radio.Button value={0.2} className={styles.btn_step}>0.2</Radio.Button>
                            <Radio.Button value={0.1} className={styles.btn_step}>0.1</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className={styles.div_tap}>
                        <ConfigTitle text={t("Motion Mode")}/>
                        <Space direction={"vertical"} style={{width: "100%"}}>
                            <Radio.Group onChange={this.onChange} value={'Fast Mode'}>
                                <Radio value={'Fast Mode'}>{'Fast Mode'}</Radio>
                                <Radio value={'Linear Mode'}>{'Linear Mode'}</Radio>
                            </Radio.Group>
                        </Space>
                    </div>
                    <ModuleControl/>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {path} = state.serialPort;
    const {tap} = state.taps;
    const {jogPanelVisible} = state.header;
    return {
        path,
        tap,
        jogPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        startTask: (gcode) => dispatch(gcodeSendActions.startTask(gcode)),
        changeVisibility4jogPanel: (value) => dispatch(headerActions.changeVisibility4jogPanel(value)),
        changeVisibility4p3dCalibration: (value) => dispatch(headerActions.changeVisibility4p3dCalibration(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
