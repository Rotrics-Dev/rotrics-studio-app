import React from 'react';
import {connect} from 'react-redux';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {getGcode4runBoundary} from "../../../../reducers/writeAndDraw";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {toFixed} from "../../../../utils";
import {Row, Col} from 'antd';

const INIT_LASER_POWER = 1;

class Index extends React.Component {
    state = {
        isLaserOn: false,
        laserPower: INIT_LASER_POWER
    };

    actions = {
        switchLaser: (checked) => {
            this.setState({isLaserOn: checked, laserPower: INIT_LASER_POWER}, () => {
                this.actions._sendGcode4laser();
            });
        },
        changeLaserPower: (laserPower) => {
            this.setState({laserPower})
        },
        afterChangeLaserPower: (laserPower) => {
            this.setState({laserPower}, () => {
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
        },
        runBoundary: () => {
            const gcode = getGcode4runBoundary();
            this.props.sendGcode(gcode)
        },
    };
    setJogPenOffset = (value) => {
        this.props.updateWriteAndDrawParameters('jog_pen_offset', value)
        console.log("setJogPenOffset")
    }

    render() {
        const actions = this.actions;
        const state = this.state;
        const {jog_pen_offset} = this.props;
        return (
            <div>
                <DeviceControl runBoundary={actions.runBoundary}/>
                <div style={{padding: "6px"}}>
                    <Row>
                        <Col span={15}>
                            <span>{jog_pen_offset.label}</span>
                            <span>{"(" + jog_pen_offset.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={jog_pen_offset.minimum_value} max={jog_pen_offset.maximum_value}
                                         value={toFixed(jog_pen_offset.default_value, 0)}
                                         onChange={this.setJogPenOffset}/>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {status} = state.serialPort;
    const {jog_pen_offset} = state.writeAndDraw.write_and_draw;
    console.log('jog_pen_offset:' + JSON.stringify(jog_pen_offset, null, 2))
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

export default connect(mapStateToProps, mapDispatchToProps)(Index);

