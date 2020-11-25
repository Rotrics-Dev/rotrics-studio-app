import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import NumberInput from '../../../components/NumberInput/Index.jsx';
import Line from '../../../components/Line/Index.jsx'
import {ConfigTitle, ConfigText} from "../../../components/Config";
import Tooltip from '../../Tooltip/Index.jsx';

//props: t, model, config, updateConfig
class Index extends PureComponent {
    actions = {
        setOptimizePath: (e) => {
            this.props.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            this.props.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            this.props.updateConfig("fill.fill_density", value)
        }
    };

    render() {
        const {t, model, config} = this.props;

        if (!model || model.fileType !== "svg" || !config) {
            return null;
        }

        const actions = this.actions;
        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;
        return (
            <div>
                <Line/>
                <div style={{padding: "8px"}}>
                    <ConfigTitle text={t(config.label)}/>
                    <Tooltip title={t(optimize_path.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(optimize_path.label)}`}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    <Tooltip title={t(fill.description)}>
                        <Row>
                            <Col span={19}>
                                <ConfigText text={`${t(fill.label)}`}/>
                            </Col>
                            <Col span={5}>
                                <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                            </Col>
                        </Row>
                    </Tooltip>
                    {fill.default_value &&
                    <Tooltip title={t(fill_density.description)}>
                        <Row>
                            <Col span={17} push={2}>
                                <ConfigText text={`${t(fill_density.label)}`}/>
                            </Col>
                            <Col span={5} push={2}>
                                <NumberInput
                                    min={fill_density.minimum_value}
                                    max={fill_density.maximum_value}
                                    value={fill_density.default_value}
                                    onAfterChange={actions.setFillDensity}
                                />
                            </Col>
                        </Row>
                    </Tooltip>
                    }
                </div>
            </div>
        );
    }
}

export default Index;


