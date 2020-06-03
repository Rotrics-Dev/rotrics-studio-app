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
        leftTop: () => {
            this.actions._move(`G0 Y${this.state.step} Z${this.state.step}`)
        },
        //others
        home: () => {
            this.props.sendGcode("M1112")
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
        //work
        runBoundary: () => {
            this.props.runBoundary();
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
        return (
            <div style={{paddingLeft: "8px"}}>
                <BaseDeviceControl actions={actions} step={state.step}/>
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

