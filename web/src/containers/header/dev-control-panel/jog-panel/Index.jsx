import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Radio, Row, Col, Slider, Space} from 'antd';
import styles from './styles.css';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as persistentDataActions} from "../../../../reducers/persistentData";
import ConfigTitle from "../../../../components/Config/ConfigTitle/index.jsx";
import {FRONT_END} from "../../../../utils/workAreaUtils";

const JOG_SPEED_MARKS = {
    500: '500',
    1000: '1000',
    2000: '2000',
    3000: '3000',
    4000: '4000'
};

class Index extends React.Component {
    state = {
        step: 10,
        jogSpeed: 100,
        motionMode: 'Fast' //Fast, Linear
    };

    actions = {
        changeStep: (e) => {
            this.setState({step: e.target.value})
        },
        xPlus: () => {
            this.actions._moveRelative(`G0 X${this.state.step}`)
        },
        xMinus: () => {
            this.actions._moveRelative(`G0 X${-this.state.step}`)
        },
        yPlus: () => {
            this.actions._moveRelative(`G0 Y${this.state.step}`)
        },
        yMinus: () => {
            this.actions._moveRelative(`G0 Y${-this.state.step}`)
        },
        zPlus: () => {
            this.actions._moveRelative(`G0 Z${this.state.step}`)
        },
        zMinus: () => {
            this.actions._moveRelative(`G0 Z${-this.state.step}`)
        },
        z0: () => {
            this.props.send("G0 Z0")
        },
        home: () => {
            const gcode = ['M1112', 'M114'].join("\n");
            this.props.send(gcode)
        },
        leftTop: () => {
            this.actions._moveRelative(`G0 X${-this.state.step} Y${this.state.step}`)
        },
        leftBottom: () => {
            this.actions._moveRelative(`G0 X${-this.state.step} Y${-this.state.step}`)
        },
        rightTop: () => {
            this.actions._moveRelative(`G0 X${this.state.step} Y${this.state.step}`)
        },
        rightBottom: () => {
            this.actions._moveRelative(`G0 X${this.state.step} Y${-this.state.step}`)
        },
        setWorkOrigin: () => {
            const {frontEnd} = this.props;
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
            //G92.1: reset工作原点为工件坐标系原点，也就是home变成了(0, 300, 0)
            this.props.send(['G92.1', 'M114', 'G92 Z0'].join('\n'));
        },
        goToWorkOrigin: () => {
            this.props.send('G0 Z0')
        },
        //G90: absolute position
        //G91: relative position
        //G92: set position
        _moveRelative: (moveCmd) => {
            const gcode = ['G91', moveCmd, 'G90', 'M114'].join("\n");
            this.props.send(gcode)
        },
        changeJogSpeed: (value) => {
            this.setState({jogSpeed: value})
        },
        afterChangeJogSpeed: (value) => {
            this.setState({jogSpeed: value}, () => {
                const gcode = [`G0 F${value}`].join("\n");
                this.props.send(gcode);
            });
        },
        changeMotionMode: (e) => {
            const value = e.target.value;
            this.setState({motionMode: value}, () => {
                switch (value) {
                    case 'Fast':
                        this.props.send('M2001');
                        break;
                    case 'Linear':
                        this.props.send('M2000');
                        break;
                }
            });
        },
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {t} = this.props;
        const gutter = 5;
        return (
            <div>
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
                <Space direction={"vertical"} style={{width: "100%"}}>
                    <div>
                        <ConfigTitle text={`${t("Step length")}(mm)`}/>
                        <Radio.Group value={state.step} onChange={actions.changeStep}>
                            <Radio.Button value={20}>20</Radio.Button>
                            <Radio.Button value={10}>10</Radio.Button>
                            <Radio.Button value={5}>5</Radio.Button>
                            <Radio.Button value={1}>1</Radio.Button>
                            <Radio.Button value={0.2}>0.2</Radio.Button>
                            <Radio.Button value={0.1}>0.1</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div>
                        <ConfigTitle text={t("Motion Mode")}/>
                        <Radio.Group onChange={actions.changeMotionMode} value={state.motionMode}>
                            <Radio.Button value={'Fast'}>{t("Fast Mode")}</Radio.Button>
                            <Radio.Button value={'Linear'}>{t("Linear Mode")}</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div>
                        <ConfigTitle text={`${t("Jog Speed")}(mm/s)`}/>
                        <Slider
                            tooltipVisible={false}
                            style={{margin: "5px 20px 20px 15px"}}
                            min={500}
                            max={4000}
                            marks={JOG_SPEED_MARKS}
                            step={null}
                            value={state.jogSpeed}
                            onChange={actions.changeJogSpeed}
                            onAfterChange={actions.afterChangeJogSpeed}
                            defaultValue={500}
                        />
                    </div>
                </Space>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        send: (gcode) => dispatch(gcodeSendActions.send(gcode)),
        setWorkHeightP3d: (value) => dispatch(persistentDataActions.setWorkHeightP3d(value)),
        setWorkHeightPen: (value) => dispatch(persistentDataActions.setWorkHeightPen(value)),
        setWorkHeightLaser: (value) => dispatch(persistentDataActions.setWorkHeightLaser(value)),
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Index));
