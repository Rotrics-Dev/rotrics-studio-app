import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';

class ConfigSvg extends PureComponent {
    actions = {
        setOptimizePath: (e) => {
            this.props.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            this.props.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            this.props.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        const {model, config} = this.props;
        if (!model || model.fileType !== "svg" || !config || config.type !== "svg") {
            return null;
        }

        const actions = this.actions;
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

export default connect(mapStateToProps, mapDispatchToProps)(ConfigSvg);


