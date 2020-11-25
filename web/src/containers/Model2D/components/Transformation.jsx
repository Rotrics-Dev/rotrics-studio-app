import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../components/Config";

//props: t, model, transformation, updateTransformation
class Index extends PureComponent {
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
        }
    };

    render() {
        const {t, model, transformation} = this.props;

        if (!model || !transformation) {
            return null;
        }

        const actions = this.actions;
        const {width, height, rotation, x, y, flip_model} = transformation.children;

        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            flipModelOptions.push({label: t(key), value: flip_model.options[key]})
        });

        return (
            <div>
                <Line/>
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(transformation.label)}/>
                    <Tooltip title={t(width.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(width.label)}(${width.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={width.minimum_value}
                                    max={width.maximum_value}
                                    value={width.default_value}
                                    onAfterChange={actions.setWidth}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(height.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(height.label)}(${height.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={height.minimum_value}
                                    max={height.maximum_value}
                                    value={height.default_value}
                                    onAfterChange={actions.setHeight}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(rotation.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(rotation.label)}(${rotation.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={rotation.minimum_value}
                                    max={rotation.maximum_value}
                                    value={rotation.default_value}
                                    onAfterChange={actions.setRotationDegree}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(x.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(x.label)}(${x.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={x.minimum_value}
                                    max={x.maximum_value}
                                    value={x.default_value}
                                    onAfterChange={actions.setX}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(y.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(y.label)}(${y.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={y.minimum_value}
                                    max={y.maximum_value}
                                    value={y.default_value}
                                    onAfterChange={actions.setY}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(flip_model.description)}>
                        <Row>
                            <Col span={15}>
                                <ConfigText text={t(flip_model.label)}/>
                            </Col>
                            <Col span={9}>
                                <ConfigSelect
                                    options={flipModelOptions}
                                    value={flip_model.default_value}
                                    onChange={actions.setFlipModel}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

export default Index;



