import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import writeDrawManager from "../../lib/WriteAndDrawManager.js";
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'

class ConfigSvg extends PureComponent {
    state = {
        model2d: null,
        config: null
    };

    componentDidMount() {
        writeDrawManager.on("onChange", (model2d) => {
            let config = model2d ? _.cloneDeep(model2d.settings.config) : null;
            // console.log("change: " + JSON.stringify(config, null, 2))
            this.setState({
                model2d,
                config
            })
        });
    }

    actions = {
        setOptimizePath: (e) => {
            writeDrawManager.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            writeDrawManager.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            writeDrawManager.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "svg") {
            return null;
        }
        const actions = this.actions;
        const {config} = this.state;
        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;
        return (
            <React.Fragment>
                <Line/>
                <h4>{config.label}</h4>
                <Row>
                    <Col span={11}>
                        <span>{optimize_path.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{fill.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                    </Col>
                </Row>
                {fill.default_value &&
                <Row>
                    <Col span={11} push={2}>
                        <span>{fill_density.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={fill_density.minimum_value} max={fill_density.maximum_value}
                                     value={toFixed(fill_density.default_value, 0)}
                                     onChange={actions.setFillDensity}/>
                    </Col>
                </Row>
                }
            </React.Fragment>
        );
    }
}

export default ConfigSvg;

