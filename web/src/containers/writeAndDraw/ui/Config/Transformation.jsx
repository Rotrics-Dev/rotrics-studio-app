import React, {PureComponent} from 'react';
import {Select, Row, Col} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';

class Transformation extends PureComponent {
    actions = {
        setWidth: (value) => {
            this.props.updateTransformation("width", value, true)
        },
        setHeight: (value) => {
            this.props.updateTransformation("height", value, true)
        },
        setRotationDegree: (value) => {
            this.props.updateTransformation("rotation", value, true)
        },
        setX: (value) => {
            this.props.updateTransformation("x", value, true)
        },
        setY: (value) => {
            this.props.updateTransformation("y", value, true)
        },
        setFlipModel: (value) => {
            this.props.updateTransformation("flip_model", value, true)
        },
    };

    render() {
        const {model, transformation} = this.props;
        if (!model || !transformation) {
            return null;
        }
        const actions = this.actions;
        const {width, height, rotation, x, y, flip_model} = transformation.children;
        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            const option = flip_model.options[key];
            flipModelOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    <h4>{transformation.label}</h4>
                    <Row>
                        <Col span={15}>
                            <span>{width.label}</span>
                            <span>{"(" + width.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                value={toFixed(width.default_value, 0)}
                                onChange={actions.setWidth}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{height.label}</span>
                            <span>{"(" + height.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                value={toFixed(height.default_value, 0)}
                                onChange={actions.setHeight}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{rotation.label}</span>
                            <span>{"(" + rotation.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={rotation.minimum_value} max={rotation.maximum_value}
                                         value={toFixed(rotation.default_value, 0)}
                                         onChange={actions.setRotationDegree}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{x.label}</span>
                            <span>{"(" + x.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={x.minimum_value} max={x.maximum_value} value={toFixed(x.default_value, 0)}
                                         onChange={actions.setX}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{y.label}</span>
                            <span>{"(" + y.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput min={y.minimum_value} max={y.maximum_value} value={toFixed(y.default_value, 0)}
                                         onChange={actions.setY}/>
                        </Col>
                    </Row>
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
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, transformation} = state.writeAndDraw;
    return {
        model,
        transformation
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransformation: (key, value, preview) => dispatch(writeAndDrawActions.updateTransformation(key, value, preview)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transformation);



