import React from 'react';
import {connect} from 'react-redux';
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

const INIT_LASER_POWER = 1;

class Index extends React.Component {
    state = {
        module: 'Air Pick', //Air Pick, Soft Gripper, Laser

        states4laser: ['on', 'off'],
        states4airPick: ['pick', 'release', 'off'],
        states4softGripper: ['grip', 'neutral', 'release', 'off'],

        laserState: 'off',
        curState4airPick: 'release',
        curState4softGripper: 'grip',

        laserPower: INIT_LASER_POWER
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    actions4laser = {
        changeState: (e) => {
            const value = e.target.value;
            this.setState({laserState: value});
            if (value === 'on') {
                this.props.startTask(`M3 S${Math.round(this.state.laserPower * 2.55)}`);
            } else if (value === 'off') {
                this.props.startTask("M5");
            }
            console.log(e.target.value)
        },
        changePower: (value) => {
            this.setState({laserPower: value})
        },
        afterChangePower: (value) => {
            this.setState({laserPower: value, laserState: 'on'}, () => {
                this.props.startTask(`M3 S${Math.round(this.state.laserPower * 2.55)}`);
            });
        }
    };

    render() {
        const actions = this.actions;
        const actions4laser = this.actions4laser;
        const state = this.state;
        const {t} = this.props;
        const {changeVisibility4p3dCalibration} = this.props;
        const gutter = 8;
        return (
            <div>
                <div className={styles.div_tap}>
                    <ConfigTitle text={t('Laser')}/>
                    <Radio.Group onChange={actions4laser.changeState} value={state.laserState}>
                        <Radio value={state.states4laser[0]}>{t(state.states4laser[0])}</Radio>
                        <Radio value={state.states4laser[1]}>{t(state.states4laser[1])}</Radio>
                    </Radio.Group>
                    <Slider
                        style={{width: "85%"}}
                        min={0}
                        max={100}
                        step={1}
                        onChange={actions4laser.changePower}
                        onAfterChange={actions4laser.afterChangePower}
                        defaultValue={0}
                        value={state.laserPower}
                        disabled={state.laserState === 'off'}
                    />
                </div>
                <div className={styles.div_tap}>
                    <ConfigTitle text={t('3D Print')}/>
                    <Row gutter={[gutter, gutter]}>
                        <Col span={12}>
                            <input
                                type="button"
                                value={t("Level")}
                                className={styles.btn_action_work}
                                onClick={() => {
                                    changeVisibility4p3dCalibration(true);
                                }}
                            />
                        </Col>
                    </Row>
                </div>
                <div className={styles.div_tap}>
                    <ConfigTitle text={t('Air Pick')}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        <Radio.Group onChange={this.onChange} value={'pick'}>
                            <Radio value={'pick'}>{t('pick')}</Radio>
                            <Radio value={'release'}>{t('release')}</Radio>
                            <Radio value={'off'}>{t('off')}</Radio>
                        </Radio.Group>
                    </Space>
                </div>
                <div className={styles.div_tap}>
                    <ConfigTitle text={t('Soft Gripper')}/>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        <Radio.Group onChange={this.onChange} value={'Grip'}>
                            <Radio value={'Grip'}>{t('Grip')}</Radio>
                            <Radio value={'release'}>{t('release')}</Radio>
                            <Radio value={'Neutral'}>{t('Neutral')}</Radio>
                            <Radio value={'off'}>{t('off')}</Radio>
                        </Radio.Group>
                    </Space>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {jogPanelVisible} = state.header;
    return {
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
