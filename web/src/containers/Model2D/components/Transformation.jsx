import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../components/Config";

//props: t, model, transformation
class Index extends PureComponent {
    actions = {
        setWidthMM: (value) => {
            this.props.model.updateTransformation("width_mm", value, true)
        },
        setHeightMM: (value) => {
            this.props.model.updateTransformation("height_mm", value, true)
        },
        setRotation: (degree) => {
            this.props.model.updateTransformation("rotation", degree, true)
        },
        setX: (value) => {
            this.props.model.updateTransformation("x", value, false)
        },
        setY: (value) => {
            this.props.model.updateTransformation("y", value, false)
        },
        setFlipModel: (value) => {
            this.props.model.updateTransformation("flip_model", value, true)
        }
    };

    render() {
        const {t, model, transformation} = this.props;

        if (!model || !transformation) {
            return null;
        }

        const actions = this.actions;
        const {width_mm, height_mm, rotation, x, y, flip_model} = transformation.children;

        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            flipModelOptions.push({label: t(key), value: flip_model.options[key]})
        });

        return (
            <div>
                <Line/>
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(transformation.label)}/>
                    <Tooltip title={t(width_mm.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(width_mm.label)}(${width_mm.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={width_mm.minimum_value}
                                    max={width_mm.maximum_value}
                                    value={width_mm.default_value}
                                    onAfterChange={actions.setWidthMM}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(height_mm.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(height_mm.label)}(${height_mm.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={height_mm.minimum_value}
                                    max={height_mm.maximum_value}
                                    value={height_mm.default_value}
                                    onAfterChange={actions.setHeightMM}
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
                                    onAfterChange={actions.setRotation}
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



