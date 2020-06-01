import React from 'react';
import {Switch, Slider} from 'antd';
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../../../../reducers/serialPort';
import BaseDeviceControl from '../../../../../components/BaseDeviceControl/Index.jsx'
import Line from "../../../../../components/Line/Index.jsx";

const INIT_LASER_POWER = 1;

class Index extends React.Component {
    state = {
        step: 10,
        isLaserOn: false,
        laserPower: INIT_LASER_POWER
    };

    actions = {
        _move: (moveStr) => {
            const arr = [];
            arr.push('G91')
            arr.push(moveStr);
            arr.push('G90');
            const gcode = arr.join("\n");
            this.props.startSendGcode(gcode);
        }
    };

    baseActions = {
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
            this.props.write("G0 Z0")
        },
        leftTop: () => {
            this.actions._move(`G0 Y${this.state.step} Z${this.state.step}`)
        },
        //others
        home: () => {
            this.props.write("M1112")
        },
        leftBottom: () => {
            this.actions._move(`G0 Y${this.state.step} Z${-this.state.step}`)
        },
        rightTop: () => {
            this.actions._move(`G0 Y${-this.state.step} Z${this.state.step}`)
        },
        rightBottom: () => {
            this.actions._move(`G0 Y${-this.state.step} Z${-this.state.step}`)
        },
        //step
        setStep: (e) => {
            this.setState({step: e.target.value})
        },
        //work
        runBoundary: () => {
            console.log("runBoundary")
        },
        setWorkOrigin: () => {
            this.props.write("G92 X0 Y0 Z0")
        },
        goToWorkOrigin: () => {
            this.props.write("G0 X0 Y0 Z0")
        }
    };

    //M3: laser on
    //M5: laser off
    //M3 S${power, 0~255}: set laser power
    laserActions = {
        switchLaser: (checked) => {
            this.setState({isLaserOn: checked, laserPower: INIT_LASER_POWER}, () => {
                this.laserActions._sendGcode4laser();
            });
        },
        changeLaserPower: (laserPower) => {
            this.setState({laserPower})
        },
        afterChangeLaserPower: (laserPower) => {
            this.setState({laserPower}, () => {
                this.laserActions._sendGcode4laser();
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
            this.props.startSendGcode(gcode);
        }
    };

    render() {
        const baseActions = this.baseActions;
        const laserActions = this.laserActions;
        const state = this.state;
        return (
            <div style={{paddingLeft: "8px"}}>
                <BaseDeviceControl actions={baseActions} step={state.step}/>
                <div style={{marginTop: "8px"}}>
                    <Line/>
                    <span>Laser</span>
                    <Switch style={{position: "absolute", right: 0}} checked={state.isLaserOn}
                            onChange={laserActions.switchLaser}/>
                    <Slider
                        style={{width: "90%"}}
                        min={0}
                        max={100}
                        step={1}
                        onChange={laserActions.changeLaserPower}
                        onAfterChange={laserActions.afterChangeLaserPower}
                        defaultValue={0}
                        value={state.laserPower}
                        disabled={!state.isLaserOn}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {serialPortStatus} = state.serialPort;
    return {
        serialPortStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        write: (str) => dispatch(serialPortActions.write(str)),
        startSendGcode: (gcode) => dispatch(serialPortActions.startSendGcode(gcode)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

