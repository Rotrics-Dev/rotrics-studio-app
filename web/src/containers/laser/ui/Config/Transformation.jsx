import React, {PureComponent} from 'react';
import {Select, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../../components/Config";

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
            flipModelOptions.push({label: key, value: option})
        });
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={transformation.label}/>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${width.label}(${width.unit})`}/>
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
                            <ConfigText text={`${height.label}(${height.unit})`}/>
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
                            <ConfigText text={`${rotation.label}(${rotation.unit})`}/>
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
                            <ConfigText text={`${x.label}(${x.unit})`}/>
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
                            <ConfigText text={`${y.label}(${y.unit})`}/>
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
                            <ConfigText text={`${flip_model.label}`}/>
                        </Col>
                        <Col span={9}>
                            <ConfigSelect options={flipModelOptions} value={flip_model.default_value} onChange={actions.setFlipModel}/>
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



