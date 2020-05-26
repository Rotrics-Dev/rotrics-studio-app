import React, {PureComponent} from 'react';
import {Select, Space, Row, Col, Divider} from 'antd';
import laserManager from "../../lib/laserManager.js";
import {toFixed} from '../../../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import _ from 'lodash';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'

class Transformation extends PureComponent {
    state = {
        model2d: null,
        transformation: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let transformation = model2d ? _.cloneDeep(model2d.settings.transformation) : null;
            this.setState({
                model2d,
                transformation
            })
        });
    }

    actions = {
        setWidth: (value) => {
            laserManager.updateTransformation("width", value)
        },
        setHeight: (value) => {
            laserManager.updateTransformation("height", value)
        },
        setRotationDegree: (value) => {
            laserManager.updateTransformation("rotation", value)
        },
        setX: (value) => {
            laserManager.updateTransformation("x", value)
        },
        setY: (value) => {
            laserManager.updateTransformation("y", value)
        },
        setFlipModel: (value) => {
            laserManager.updateTransformation("flip_model", value)
        },
    };

    render() {
        if (!this.state.model2d) {
            return null;
        }
        const actions = this.actions;
        const {transformation} = this.state;
        const {width, height, rotation, x, y, flip_model} = transformation.children;
        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            const option = flip_model.options[key];
            flipModelOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        return (
            <React.Fragment>
                <Line/>
                <h4>{transformation.label}</h4>
                <Row>
                    <Col span={11}>
                        <span>{width.label}</span>
                        <span>{"(" + width.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput
                            value={toFixed(width.default_value, 0)}
                            onChange={actions.setWidth}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{height.label}</span>
                        <span>{"(" + height.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput
                            value={toFixed(height.default_value, 0)}
                            onChange={actions.setHeight}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{rotation.label}</span>
                        <span>{"(" + rotation.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={rotation.minimum_value} max={rotation.maximum_value}
                                     value={toFixed(rotation.default_value, 0)}
                                     onChange={actions.setRotationDegree}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{x.label}</span>
                        <span>{"(" + x.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={x.minimum_value} max={x.maximum_value} value={toFixed(x.default_value, 0)}
                                     onChange={actions.setX}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{y.label}</span>
                        <span>{"(" + y.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={y.minimum_value} max={y.maximum_value} value={toFixed(y.default_value, 0)}
                                     onChange={actions.setY}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{flip_model.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Select value={flip_model.default_value} style={{width: 110}}
                                onChange={actions.setFlipModel}>
                            {flipModelOptions}
                        </Select>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default Transformation;

