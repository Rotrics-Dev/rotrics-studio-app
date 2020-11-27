import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../components/Config";

//props: t, model, transformation, updateTransformation
class Index extends PureComponent {
    actions = {
        set_width_mm: (value) => {
            this.props.updateTransformation("width_mm", value, true)
        },
        set_height_mm: (value) => {
            this.props.updateTransformation("height_mm", value, true)
        },
        /**
         * @param value: unit is degree
         */
        set_rotation: (value) => {
            this.props.updateTransformation("rotation", value, true)
        },
        set_x: (value) => {
            this.props.updateTransformation("x", value, false)
        },
        set_y: (value) => {
            this.props.updateTransformation("y", value, false)
        },
        set_flip_model: (value) => {
            this.props.updateTransformation("flip_model", value, true)
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
                                    onAfterChange={actions.set_width_mm}
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
                                    onAfterChange={actions.set_height_mm}
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
                                    onAfterChange={actions.set_rotation}
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
                                    onAfterChange={actions.set_x}
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
                                    onAfterChange={actions.set_y}
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
                                    onChange={actions.set_flip_model}
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



