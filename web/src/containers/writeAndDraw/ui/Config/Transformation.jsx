import React, {PureComponent} from 'react';
import {Select, Row, Col} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle, ConfigSelect} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../../components/Tooltip/Index.jsx';
import {getUuid} from '../../../../utils';

const tooltipId = getUuid();

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
        const {t} = this.props;
        const {model, transformation} = this.props;
        if (!model || !transformation) {
            return null;
        }
        const actions = this.actions;
        const {width, height, rotation, x, y, flip_model} = transformation.children;

        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            const option = flip_model.options[key];
            flipModelOptions.push({label: t(key), value: option})
        });
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                   />
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(transformation.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Width of the picture.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(width.label)}(${width.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={width.minimum_value}
                                max={width.maximum_value}
                                value={width.default_value}
                                onAfterChange={actions.setWidth}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Height of the picture.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(height.label)}(${height.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={height.minimum_value}
                                max={height.maximum_value}
                                value={height.default_value}
                                onAfterChange={actions.setHeight}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Rotate of the picture.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(rotation.label)}(${rotation.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={rotation.minimum_value}
                                max={rotation.maximum_value}
                                value={rotation.default_value}
                                onAfterChange={actions.setRotationDegree}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('X offset of the picture.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(x.label)}(${x.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={x.minimum_value}
                                max={x.maximum_value}
                                value={x.default_value}
                                onAfterChange={actions.setX}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Y offset of the picture.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(y.label)}(${y.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={y.minimum_value}
                                max={y.maximum_value}
                                value={y.default_value}
                                onAfterChange={actions.setY}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Flip the selected picture vertically, horizontally or in both directions.')}>
                        <Col span={15}>
                            <ConfigText text={`${t(flip_model.label)}`}/>
                        </Col>
                        <Col span={9}>
                            <ConfigSelect options={flipModelOptions} value={flip_model.default_value}
                                          onChange={actions.setFlipModel}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Transformation));



