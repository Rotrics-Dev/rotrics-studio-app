import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import Tooltip from '../../Tooltip/Index.jsx';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../components/Config";

//props: t, model, config
class Index extends PureComponent {
    actions = {
        setInvert: (e) => {
            this.props.model.updateConfig("invert", e.target.checked)
        },
        setBW: (value) => {
            this.props.model.updateConfig("bw", value)
        },
        setDensity: (value) => {
            this.props.model.updateConfig("density", value)
        },
        setLineDirection: (value) => {
            this.props.model.updateConfig("line_direction", value)
        }
    };

    render() {
        const {t, model, config} = this.props;

        if (!model || model.fileType !== "bw" || !config) {
            return null;
        }

        const actions = this.actions;
        const {invert, bw, line_direction, density} = config.children;

        const directionOptions = [];
        Object.keys(line_direction.options).forEach((key) => {
            const option = line_direction.options[key];
            directionOptions.push({label: key, value: option})
        });

        return (
            <div>
                <Line/>
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(config.label)}/>
                    <Tooltip title={t(invert.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(invert.label)}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(bw.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={t(bw.label)}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={bw.minimum_value}
                                    max={bw.maximum_value}
                                    value={bw.default_value}
                                    onAfterChange={actions.setBW}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(density.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(density.label)}(${density.unit})`}/>
                            </Col>
                            <Col span={5}>
                                <NumberInput
                                    min={density.minimum_value}
                                    max={density.maximum_value}
                                    value={density.default_value}
                                    onAfterChange={actions.setDensity}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(line_direction.description)}>
                        <Row>
                            <Col span={15}>
                                <ConfigText text={t(line_direction.label)}/>
                            </Col>
                            <Col span={9}>
                                <ConfigSelect
                                    options={directionOptions}
                                    value={line_direction.default_value}
                                    onChange={actions.setLineDirection}
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


