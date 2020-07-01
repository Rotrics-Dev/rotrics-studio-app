import React from 'react';
import {connect} from 'react-redux';
import {Select, Row, Col} from 'antd';

import Line from '../../../../components/Line/Index.jsx'
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {Row, Col} from 'antd';

class Index extends React.Component {
    actions = {
        setFrontEnd: (value) => {
            let gcode =null;
            switch (value) {
// case
            }




            this.props.sendGcode(gcode)
        },
    };

    render() {
        // const actions = this.actions;
        // const {jog_pen_offset} = this.props;
        return (
            <div>
                TEACHANDPLAY
                <Row>
                    <Col span={13}>
                        <span>{flip_model.label}</span>
                    </Col>
                    <Col span={11}>
                        <Select value={flip_model.default_value} style={{width: "100%"}}
                                onChange={actions.setFlipModel}>
                            {flipModelOptions}
                        </Select>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        deleteMovementNode:(index)=dispatch(),
        setRepeatCount:(count)=>dispatch(),
        recordArmMovement:()=>dispatch(),
        startArmMovement:()=>dispatch(),
        sendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
    };
};

export default connect(null, mapDispatchToProps)(Index);

