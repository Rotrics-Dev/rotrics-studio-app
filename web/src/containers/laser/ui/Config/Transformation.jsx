import React, {PureComponent} from 'react';
import {Select, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import globalStyles from "../../../../globalStyles.css";

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
            this.props.updateTransformation("x", value, false)
        },
        setY: (value) => {
            this.props.updateTransformation("y", value, false)
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
            flipModelOptions.push(<Select.Option style={{fontSize: "12px"}} key={key}
                                                 value={option}>{key}</Select.Option>)
        });
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <h4>{transformation.label}</h4>
                    <Row>
                        <Col span={19}>
                            <span className={globalStyles.text_parameters}>{width.label}</span>
                            <span className={globalStyles.text_parameters}>{"(" + width.unit + ")"}</span>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={width.minimum_value}
                                max={width.maximum_value}
                                value={width.default_value}
                                onAfterChange={actions.setWidth}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <span className={globalStyles.text_parameters}>{height.label}</span>
                            <span className={globalStyles.text_parameters}>{"(" + height.unit + ")"}</span>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={height.minimum_value}
                                max={height.maximum_value}
                                value={height.default_value}
                                onAfterChange={actions.setHeight}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <span className={globalStyles.text_parameters}>{rotation.label}</span>
                            <span className={globalStyles.text_parameters}>{"(" + rotation.unit + ")"}</span>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={rotation.minimum_value}
                                max={rotation.maximum_value}
                                value={rotation.default_value}
                                onAfterChange={actions.setRotationDegree}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <span className={globalStyles.text_parameters}>{x.label}</span>
                            <span className={globalStyles.text_parameters}>{"(" + x.unit + ")"}</span>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={x.minimum_value}
                                max={x.maximum_value}
                                value={x.default_value}
                                onAfterChange={actions.setX}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <span className={globalStyles.text_parameters}>{y.label}</span>
                            <span className={globalStyles.text_parameters}>{"(" + y.unit + ")"}</span>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={y.minimum_value}
                                max={y.maximum_value}
                                value={y.default_value}
                                onAfterChange={actions.setY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span className={globalStyles.text_parameters}>{flip_model.label}</span>
                        </Col>
                        <Col span={9}>
                            <Select size="small" value={flip_model.default_value}
                                    style={{width: "100%", fontSize: "12px"}}
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
    const {model, transformation} = state.laser;
    return {
        model,
        transformation
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransformation: (key, value, preview) => dispatch(laserActions.updateTransformation(key, value, preview)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transformation);



