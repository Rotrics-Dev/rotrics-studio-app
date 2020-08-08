import React from 'react';
import {connect} from 'react-redux';
import BaseDeviceControl from '../../components/BaseDeviceControl/Index.jsx'
import {actions as gcodeSendActions} from "../../reducers/gcodeSend";

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
            this.props.start("M1112", false, false)
        },
        leftTop: () => {
            this.actions._move(`G0 Y${this.state.step} Z${this.state.step}`)
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
            this.props.start("G92 X0 Y0 Z0", false, false)
        },
        goToWorkOrigin: () => {
            this.props.start("G0 X0 Y0 Z0", false, false)
        },
        //G90: absolute position
        //G91: relative position
        //G92: set position
        _move: (moveCmd) => {
            const gcode = ['G91', moveCmd, 'G90'].join("\n");
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

const mapDispatchToProps = (dispatch) => {
    return {
        start: (gcode, isTask, isLaser) => dispatch(gcodeSendActions.start(gcode, isTask, isLaser)),
    };
};

export default connect(null, mapDispatchToProps)(Index);

