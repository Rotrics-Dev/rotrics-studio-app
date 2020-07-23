import React from 'react';
import {connect} from 'react-redux';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    render() {
        return (
            <div>
                <DeviceControl/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status} = state.serialPort;
    const {jog_pen_offset} = state.writeAndDraw.write_and_draw;
    return {
        serialPortStatus: status,
        jog_pen_offset
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        updateWriteAndDrawParameters: (key, value) => dispatch(writeAndDrawActions.updateWriteAndDrawParameters(key, value))
    };
};

export default withTranslation()(Index);

