import React from 'react';
import {connect} from 'react-redux';
import {Switch, Slider} from 'antd';
import styles from './styles.css';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import Line from "../../../../components/Line/Index.jsx";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";

const INIT_LASER_POWER = 1;

// 目前没有办法：
// 查询激光头的状态（固件可以添加）。和区分打印头（固件无法添加，看下一个版本的硬件吧）
class Index extends React.Component {
    state = {
        isLaserOn: false,
        laserPower: INIT_LASER_POWER
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    actions = {
        toggleLaser: (checked) => {
            this.setState({isLaserOn: checked, laserPower: INIT_LASER_POWER}, () => {
                this.actions._sendGcode4laser();
            });
        },
        changeLaserPower: (value) => {
            this.setState({laserPower: value})
        },
        afterChangeLaserPower: (value) => {
            this.setState({laserPower: value}, () => {
                this.actions._sendGcode4laser();
            });
        },
        _sendGcode4laser: () => {
            const {isLaserOn, laserPower} = this.state;
            let gcode = "";
            if (isLaserOn) {
                gcode = `M3 S${Math.round(laserPower * 2.55)}`
            } else {
                gcode = "M5"
            }
            this.props.sendGcode(gcode);
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <DeviceControl/>
                <Line/>
                <div style={{padding: "5px"}}>
                    <span>Laser</span>
                    <Switch style={{position: "absolute", right: "5px"}} checked={state.isLaserOn}
                            onChange={actions.toggleLaser}/>
                    <Slider
                        style={{width: "95%"}}
                        min={0}
                        max={100}
                        step={1}
                        onChange={actions.changeLaserPower}
                        onAfterChange={actions.afterChangeLaserPower}
                        defaultValue={0}
                        value={state.laserPower}
                        disabled={!state.isLaserOn}
                    />
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode, false)),
    };
};

export default connect(null, mapDispatchToProps)(Index);

