import React from 'react';
import {connect} from 'react-redux';
import {Switch, Slider} from 'antd';
import styles from './styles.css';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import Line from "../../../../components/Line/Index.jsx";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";


const INIT_LASER_POWER = 1;

class Index extends React.Component {
    state = {
        isLaserOn: false,
        laserPower: INIT_LASER_POWER
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    actions = {
        _sendGcode4laser: () => {
            const {isLaserOn, laserPower} = this.state;
            let gcode = "";
            if (isLaserOn) {
                gcode = `M3 S${Math.round(laserPower * 2.55)}`
            } else {
                gcode = "M5"
            }
            this.props.sendGcode(gcode);
        },
        runBoundary: () => {
            // const gcode = laserManager.getGcode4runBoundary();
            // this.props.sendGcode(gcode)
        },
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <DeviceControl runBoundary={actions.runBoundary}/>
                <Line/>
                <div style={{ padding: "5px"}}>
                    <span>Laser</span>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status} = state.serialPort;
    return {
        serialPortStatus: status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

