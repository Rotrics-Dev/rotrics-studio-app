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
            this.props.sendGcode("G0 Z0")
        },
        //others
        home: () => {
            this.props.sendGcode("M1112")
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
            this.props.sendGcode("G92 X0 Y0 Z0")
        },
        goToWorkOrigin: () => {
            this.props.sendGcode("G0 X0 Y0 Z0")
        },
        //G90: absolute position
        //G91: relative position
        //G92: set position
        _move: (moveCmd) => {
            const gcode = ['G91', moveCmd, 'G90'].join("\n");
            this.props.sendGcode(gcode)
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
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode, false)),
    };
};

export default connect(null, mapDispatchToProps)(Index);

