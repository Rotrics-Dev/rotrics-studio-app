import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';

class WorkingParameters extends PureComponent {
    actions = {
        setPrintOrder: (value) => {
            this.props.updateWorkingParameters("print_order", value)
        },
        setJogSpeed: (value) => {
            this.props.updateWorkingParameters("jog_speed", value)
        },
        setJogPenOffset: (value) => {
            this.props.updateWorkingParameters("jog_pen_offset", value)
        },
        setWorkSpeed: (value) => {
            this.props.updateWorkingParameters("work_speed", value)
        }
    };

    render() {
        const {model, working_parameters} = this.props;
        if (!model || !working_parameters) {
            return null;
        }
        const actions = this.actions;
        const {work_speed, jog_speed, jog_pen_offset} = working_parameters.children;
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    <h4>{working_parameters.label}</h4>
                    <Row>
                        <Col span={15}>
                            <span>{work_speed.label}</span>
                            <span>{"(" + work_speed.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={work_speed.minimum_value} max={work_speed.maximum_value}
                                         value={toFixed(work_speed.default_value, 0)}
                                         onChange={actions.setWorkSpeed}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{jog_speed.label}</span>
                            <span>{"(" + jog_speed.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={jog_speed.minimum_value} max={jog_speed.maximum_value}
                                         value={toFixed(jog_speed.default_value, 0)}
                                         onChange={actions.setJogSpeed}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{jog_pen_offset.label}</span>
                            <span>{"(" + jog_pen_offset.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={jog_pen_offset.minimum_value} max={jog_pen_offset.maximum_value}
                                         value={toFixed(jog_pen_offset.default_value, 0)}
                                         onChange={actions.setJogPenOffset}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, working_parameters} = state.writeAndDraw;
    return {
        model,
        working_parameters
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateWorkingParameters: (key, value) => dispatch(writeAndDrawActions.updateWorkingParameters(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkingParameters);


