import React from 'react';
import {connect} from 'react-redux';
import BaseDeviceControl from '../../components/BaseDeviceControl/Index.jsx'
import {actions as gcodeSendActions} from "../../reducers/gcodeSend";
import {actions as persistentDataActions} from "../../reducers/persistentData";
import {FRONT_END} from '../../utils/workAreaUtils.js'
import {actions as serialPortAction} from "../../reducers/serialPort";

class Index extends React.Component {
    state = {
        step: 10
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
            this.props.start("G0 Z0", false, false)
        },
        //others
        home: () => {
            const gcode = ['M1112', 'M114'].join("\n");
            this.props.start(gcode, false, false)
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
            // this.props.start(`G0 Z${workHeight}\n`, false, false)
            this.props.start(`G0 Z0\n`, false, false)
        },
        //G90: absolute position
        //G91: relative position
        //G92: set position
        _move: (moveCmd) => {
            const gcode = ['G91', moveCmd, 'G90', 'M114'].join("\n");
            this.props.start(gcode, false, false)
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {...rest} = this.props;
        return (
            <div>
                <BaseDeviceControl
                    {...rest}
                    actions={actions} step={state.step}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {workHeightP3d, workHeightPen, workHeightLaser} = state.persistentData;
    return {workHeightP3d, workHeightPen, workHeightLaser};
};

const mapDispatchToProps = (dispatch) => {
    return {
        start: (gcode, isTask, isLaser) => dispatch(gcodeSendActions.start(gcode, isTask, isLaser)),
        setWorkHeightP3d: (value) => dispatch(persistentDataActions.setWorkHeightP3d(value)),
        setWorkHeightPen: (value) => dispatch(persistentDataActions.setWorkHeightPen(value)),
        setWorkHeightLaser: (value) => dispatch(persistentDataActions.setWorkHeightLaser(value)),
        addOneShootGcodeResponseListener: (gcode, listener) => dispatch(serialPortAction.addOneShootGcodeResponseListener(gcode, listener)),
        serialPortWrite: (gcode) => dispatch(serialPortAction.write(gcode))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

