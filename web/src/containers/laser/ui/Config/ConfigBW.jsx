import React, {PureComponent} from 'react';
import {Checkbox, Select, Space, Row, Col, Divider} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';

class ConfigBW extends PureComponent {
    actions = {
        setInvert: (e) => {
            this.props.updateConfig("invert", e.target.checked)
        },
        setBW: (value) => {
            this.props.updateConfig("bw", value)
        },
        setDensity: (value) => {
            this.props.updateConfig("density", value)
        },
        setLineDirection: (value) => {
            this.props.updateConfig("line_direction", value)
        }
    };

    render() {
        const {model, config} = this.props;
        if (!model || model.fileType !== "bw" || !config || config.type !== "bw") {
            return null;
        }
        const actions = this.actions;
        const {invert, bw, line_direction, density} = config.children;
        const directionOptions = [];
        Object.keys(line_direction.options).forEach((key) => {
            const option = line_direction.options[key];
            directionOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });
        return (
            <React.Fragment>
                <Line/>
                <h4>{config.label}</h4>
                <Row>
                    <Col span={11}>
                        <span>{invert.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{bw.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={bw.minimum_value} max={bw.maximum_value}
                                     value={toFixed(bw.default_value, 0)}
                                     onChange={actions.setBW}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{line_direction.label}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <Select value={line_direction.default_value} style={{width: 110}}
                                onChange={actions.setLineDirection}>
                            {directionOptions}></Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <span>{density.label}</span>
                        <span>{"(" + density.unit + ")"}</span>
                    </Col>
                    <Col span={8} push={5}>
                        <NumberInput min={density.minimum_value} max={density.maximum_value}
                                     value={toFixed(density.default_value, 0)}
                                     onChange={actions.setDensity}/>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config} = state.laser;
    return {
        model,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (key, value) => dispatch(laserActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigBW);


