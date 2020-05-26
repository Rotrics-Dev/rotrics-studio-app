import React from 'react';
import {actions as serialPortActions} from '../../../../../reducers/serialPort';
import {connect} from 'react-redux';
import BaseDeviceControl from '../../../../../components/BaseDeviceControl/Index.jsx'

class Index extends React.Component {
    state = {
        step: 10
    };

    actions = {
        _move: (moveStr) => {
            const arr = [];
            arr.push('G91')
            arr.push(moveStr);
            arr.push('G90');
            const gcode = arr.join("\n");
            console.log(gcode)
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

    render() {
        const baseActions = this.baseActions;
        const state = this.state;
        return (
            <div style={{paddingLeft: "8px"}}>
                <BaseDeviceControl actions={baseActions} step={state.step}/>
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

