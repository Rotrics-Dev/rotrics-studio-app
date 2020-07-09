import React from 'react';
import {connect} from 'react-redux';
import {Switch, Slider} from 'antd';
import styles from './styles.css';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import Line from "../../../../components/Line/Index.jsx";
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";

class Index extends React.Component {
    state = {};

    actions = {
        runBoundary: () => {
        },
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <DeviceControl runBoundary={actions.runBoundary} hideRunBoundary={true} showLevel={true}/>
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

